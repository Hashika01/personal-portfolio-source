# Personal Portfolio Website

A responsive full-stack portfolio built with HTML, CSS, vanilla JavaScript, Node.js, Express, and MongoDB.

## Features
- Responsive dark portfolio design
- About, skills, projects, and contact sections
- Project cards loaded from MongoDB through `GET /api/projects`
- Contact form saves messages to MongoDB through `POST /api/contact`
- Optional demo project seeding
- Basic request validation, Helmet security headers, and contact rate limiting

## Requirements
- Node.js 18+
- MongoDB locally, or a MongoDB Atlas connection string

## Run locally
1. Extract this folder and open a terminal in it.
2. Install packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`.
4. Edit `.env` and set `MONGODB_URI` to your MongoDB connection string.
   - Local MongoDB: `mongodb://127.0.0.1:27017/personal_portfolio`
   - MongoDB Atlas: use the connection string from your Atlas cluster.
5. Start the server:
   ```bash
   npm run dev
   ```
   Or use `npm start`.
6. Open http://localhost:3000

## Customize
- Replace “Alex Morgan”, `hello@example.com`, and the sample copy in `public/index.html`.
- Change the skill list and text to match your own experience.
- Demo projects are seeded when the project collection is empty and `SEED_DEMO_DATA=true`.
- Update sample project links with your own working links.

## API
- `GET /api/projects` — list projects
- `POST /api/projects` — create a project (development/demo endpoint)
- `POST /api/contact` — validate and store a contact message

Example project creation body:
```json
{
  "title": "My Portfolio App",
  "description": "A full-stack web application.",
  "technologies": ["HTML", "CSS", "JavaScript", "Node.js", "MongoDB"],
  "liveUrl": "https://example.com",
  "githubUrl": "https://github.com/yourname/project",
  "featured": true
}
```

## Before public deployment
The `POST /api/projects` endpoint is intentionally included for learning. It is **not authenticated**. Add admin authentication/authorization or disable that route before exposing the site publicly. Add spam protection (such as CAPTCHA) and configure secure environment variables. Never commit `.env` to Git.

## Deploy
Deploy the Node/Express app to a Node-compatible host (for example Render or Railway), provision MongoDB Atlas, and set `MONGODB_URI`, `SEED_DEMO_DATA`, and `PORT` in the host's environment settings. This app serves the frontend from Express, so one service can host both frontend and API.
