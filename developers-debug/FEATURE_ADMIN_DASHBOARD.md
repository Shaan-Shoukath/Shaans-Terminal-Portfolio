# 🔐 Admin Dashboard

## What It Does

A hidden admin panel at `/admin` for managing portfolio projects. Uses JWT authentication and glassmorphism styling matching the main site.

## Files

| File                                | Role                                         |
| ----------------------------------- | -------------------------------------------- |
| `src/components/AdminPage.jsx`      | Auth state wrapper (login vs dashboard)      |
| `src/components/AdminLogin.jsx`     | Login form, sends POST to `/api/admin/login` |
| `src/components/AdminDashboard.jsx` | Full CRUD interface for projects             |
| `server/routes/admin.js`            | Login endpoint, creates JWT                  |
| `server/middleware/auth.js`         | Validates JWT on protected routes            |
| `server/routes/projects.js`         | POST/PUT/DELETE are protected                |

## Authentication Flow

```
1. User visits /admin → AdminPage checks localStorage for token
2. No token → show AdminLogin form
3. User submits credentials → POST /api/admin/login
4. Server validates → returns JWT token
5. Frontend stores token in localStorage
6. AdminPage re-renders → shows AdminDashboard
7. All API calls include: Authorization: Bearer <token>
8. Logout → removes token from localStorage
```

## Dashboard Features

### Create Project

- Click "+ New Project" → form appears (animated slide-down)
- Fill in: title, description, technologies (comma-separated), URLs
- Submit → POST /api/projects with JWT header
- Table refreshes automatically

### Edit Project

- Click "✎ Edit" on any row → form populates with existing data
- Modify fields → submit → PUT /api/projects/:id
- Changes reflect in terminal `projects` command immediately

### Delete Project

- Click "✕" on any row → confirmation dialog
- Confirm → DELETE /api/projects/:id
- Row removed from table

## Status Messages

```
"✓ Project created"  → Green banner (auto-hides after 3s)
"✓ Project updated"  → Green banner
"✓ Project deleted"  → Green banner
"Error: ..."         → Red banner
```

Uses Framer Motion AnimatePresence for slide-in/out animation.

## Default Credentials

```
Username: admin
Password: admin123
```

Configured in `server/.env` → change before deploying!

## Security Notes

- JWT expires after **24 hours**
- Token stored in `localStorage` (cleared on logout)
- Protected routes check token via middleware before processing
- GET routes are public (visitors need to see projects)
