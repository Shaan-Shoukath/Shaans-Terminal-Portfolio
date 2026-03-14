# 🔌 Backend API

## What It Does

RESTful API serving project data and handling admin authentication. Built with Express + MongoDB.

## Files

| File                                      | Role                                          |
| ----------------------------------------- | --------------------------------------------- |
| `server/index.js`                         | Server entry, middleware setup, DB connection |
| `server/models/Project.js`                | Mongoose schema for projects                  |
| `server/controllers/projectController.js` | CRUD logic                                    |
| `server/routes/projects.js`               | URL → controller mapping                      |
| `server/routes/admin.js`                  | Login endpoint                                |
| `server/middleware/auth.js`               | JWT verification                              |
| `server/seed.js`                          | Populate DB with sample data                  |
| `server/.env`                             | Configuration (secrets, DB URI)               |

## API Endpoints

### Public (no auth)

```
GET  /api/projects      → Returns all projects (newest first)
GET  /api/projects/:id  → Returns one project
GET  /api/health        → { status: "ok", timestamp: "..." }
```

### Auth

```
POST /api/admin/login   → Body: { username, password } → Returns { token }
```

### Protected (require JWT in Authorization header)

```
POST   /api/projects       → Body: project data → Creates project
PUT    /api/projects/:id   → Body: updated data → Updates project
DELETE /api/projects/:id   → Deletes project
```

## Project Schema

```js
{
  title: String (required),
  description: String (required),
  technologies: [String],
  github: String,
  deployment: String,
  linkedin: String,
  image: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Middleware Pipeline

```
Request → cors() → express.json() → [auth] → controller → Response
```

- `cors()` — allows cross-origin requests
- `express.json()` — parses JSON body into `req.body`
- `auth` — only on protected routes, verifies JWT

## Offline Fallback

If the backend is unreachable, the frontend uses `src/commands/fallbackProjects.js` with 3 hardcoded projects. The `projectsCommand()` wraps the API call in try/catch.

## Running

```bash
cd server
npm install        # Install dependencies
npm run seed       # (Optional) Add sample data
npm run dev        # Start server with auto-reload
```

## Environment Variables (.env)

```
PORT=5000                                    # Server port
MONGODB_URI=mongodb://localhost:27017/...     # Database URL
JWT_SECRET=change-this-in-production         # Token signing key
ADMIN_USERNAME=admin                         # Login username
ADMIN_PASSWORD=admin123                      # Login password
```
