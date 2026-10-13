const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    technologies: [{ type: String, trim: true, maxlength: 40 }],
    liveUrl: { type: String, trim: true, default: "" },
    githubUrl: { type: String, trim: true, default: "" },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);