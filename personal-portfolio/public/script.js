const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const projectsGrid = document.getElementById("projectsGrid");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

document.getElementById("year").textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function safeUrl(value = "") {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function projectCard(project, index) {
  const symbols = ["✳", "⌁", "◈", "⌘", "✦"];
  const tags = Array.isArray(project.technologies) ? project.technologies : [];
  const liveUrl = safeUrl(project.liveUrl);
  const githubUrl = safeUrl(project.githubUrl);
  const links = [
    liveUrl ? `<a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer">Live demo ↗</a>` : "",
    githubUrl ? `<a href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer">Source code ↗</a>` : ""
  ].filter(Boolean).join("");

  return `<article class="project-card">
    <div class="project-visual"><span class="project-symbol">${symbols[index % symbols.length]}</span></div>
    <div class="project-content">
      <div class="project-topline"><h3>${escapeHtml(project.title)}</h3><span>↗</span></div>
      <p>${escapeHtml(project.description)}</p>
      <div class="tags">${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      ${links ? `<div class="project-links">${links}</div>` : ""}
    </div>
  </article>`;
}

async function loadProjects() {
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("Project request failed");
    const projects = await response.json();

    if (!projects.length) {
      projectsGrid.innerHTML = '<p class="empty-projects">No projects yet. Add projects to your database to show them here.</p>';
      return;
    }
    projectsGrid.innerHTML = projects.map(projectCard).join("");
  } catch (error) {
    projectsGrid.innerHTML = '<p class="empty-projects">Projects could not be loaded. Check that the server and database are running.</p>';
  }
}

contactForm.addEventListener("submit", async event => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  formStatus.textContent = "";

  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not send your message.");
    formStatus.textContent = result.message;
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = error.message || "Something went wrong. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
});

loadProjects();