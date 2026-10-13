require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const Project = require("./models/Project");
const Message = require("./models/Message");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please try again later." }
});

function validOptionalUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// Public API: list projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ featured: -1, createdAt: -1 }).lean();
    res.json(projects);
  } catch (error) {
    console.error("Could not fetch projects:", error.message);
    res.status(500).json({ error: "Unable to load projects right now." });
  }
});

// Public API: save a contact message
app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please fill in every field." });
    }
    if (name.length > 80 || email.length > 254 || message.length > 3000) {
      return res.status(400).json({ error: "One or more fields are too long." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    await Message.create({ name, email, message });
    res.status(201).json({ message: "Thanks! Your message has been received." });
  } catch (error) {
    console.error("Could not save contact message:", error.message);
    res.status(500).json({ error: "Unable to send your message right now." });
  }
});

// Optional development API for adding projects.
// Protect this endpoint with authentication before using it on a public deployment.
app.post("/api/projects", async (req, res) => {
  try {
    const { title, description, technologies = [], liveUrl = "", githubUrl = "", featured = false } = req.body;
    if (typeof title !== "string" || !title.trim() ||
        typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ error: "Title and description are required." });
    }
    if (!validOptionalUrl(liveUrl) || !validOptionalUrl(githubUrl)) {
      return res.status(400).json({ error: "Project links must be valid HTTP or HTTPS URLs." });
    }
    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      technologies: Array.isArray(technologies)
        ? technologies.filter(t => typeof t === "string").map(t => t.trim()).filter(Boolean).slice(0, 12)
        : [],
      liveUrl,
      githubUrl,
      featured: Boolean(featured)
    });
    res.status(201).json(project);
  } catch (error) {
    console.error("Could not create project:", error.message);
    res.status(500).json({ error: "Unable to create project." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function seedDemoProjects() {
  if (process.env.SEED_DEMO_DATA !== "true") return;
  if (await Project.countDocuments()) return;

  await Project.insertMany([
    {
      title: "TaskFlow",
      description: "A clean task management app for organizing everyday work and tracking progress.",
      technologies: ["HTML", "CSS", "JavaScript"],
      githubUrl: "https://github.com/",
      featured: true
    },
    {
      title: "Weather Dashboard",
      description: "A responsive weather interface that presents current conditions in a simple layout.",
      technologies: ["JavaScript", "REST API", "CSS"],
      githubUrl: "https://github.com/"
    },
    {
      title: "ShopLite",
      description: "A small storefront concept with product cards, responsive styling, and a cart-ready UI.",
      technologies: ["Node.js", "Express", "MongoDB"],
      githubUrl: "https://github.com/"
    }
  ]);
  console.log("Inserted demo projects. Replace them with your own projects.");
}

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB.");
      await seedDemoProjects();
    } else {
      console.warn("MONGODB_URI is missing. API/database features will not work until configured.");
    }

    app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();