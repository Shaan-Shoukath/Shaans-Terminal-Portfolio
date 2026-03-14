# ⬡ ShaanOS — Hyprland Terminal Portfolio

A developer portfolio that simulates a **Hyprland Linux desktop** with glassmorphism Alacritty-style terminals. Visitors explore projects, skills, and more by typing commands.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)

---

## ✨ Features

| Feature                 | Description                                                                       |
| ----------------------- | --------------------------------------------------------------------------------- |
| 🖥️ **Hyprland Desktop** | Tiling window manager with 1/2/3/4 terminal layouts                               |
| 🧊 **Glassmorphism**    | Frosted glass terminals with blur, glow, and translucency                         |
| ⌨️ **14 Commands**      | help, about, skills, projects, resume, contact, neofetch, matrix, coffee, sudo... |
| 🚀 **Boot Sequence**    | Staged Linux-style boot animation on first visit                                  |
| 🟢 **Matrix Rain**      | Toggle canvas-based Katakana character rain                                       |
| 🔐 **Admin Dashboard**  | Hidden `/admin` panel with JWT auth + project CRUD                                |
| 📱 **Responsive**       | Optimized for phones, tablets, laptops, desktops, and ultra-wide                  |
| 🌐 **REST API**         | Express + MongoDB backend with offline fallback                                   |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Run frontend (works without backend)
npm run dev

# Run backend (requires MongoDB)
cd server && npm run dev

# Or run both together
npm run dev:all
```

**Admin login:** `/admin` → username: `admin` / password: `admin123`

---

## ⌨️ Keybindings

| Shortcut        | Action                     |
| --------------- | -------------------------- |
| `Alt + Enter`   | Open new terminal          |
| `Alt + Q`       | Close terminal             |
| `Alt + H/J/K/L` | Navigate between terminals |

---

## 📂 Project Structure

```
├── src/                    Frontend (React + Vite)
│   ├── components/         UI components
│   ├── commands/           Terminal command system
│   └── store/              Zustand state management
├── server/                 Backend (Express + MongoDB)
│   ├── models/             Mongoose schemas
│   ├── routes/             API endpoints
│   ├── controllers/        Business logic
│   └── middleware/          JWT auth
└── developers-debug/       📖 Documentation (see below)
```

---

## 📖 Developer Documentation

> **New to this codebase?** Start with the [Project Overview](developers-debug/PROJECT_OVERVIEW.md), then read the guides below.

### Comprehensive Guides

| Guide                                                       | What You'll Learn                                                          |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| [📗 Project Overview](developers-debug/PROJECT_OVERVIEW.md) | Architecture diagram, folder structure, terminology, how to run            |
| [🖥️ Frontend Guide](developers-debug/FRONTEND_GUIDE.md)     | React, Vite, Zustand, Framer Motion, TailwindCSS, Axios — with comparisons |
| [🛠️ Backend Guide](developers-debug/BACKEND_GUIDE.md)       | Express, MongoDB, Mongoose, JWT, CORS, dotenv — with request lifecycle     |

### Feature-Specific Docs

| Feature                  | Doc                                                                       |
| ------------------------ | ------------------------------------------------------------------------- |
| ⌨️ Terminal System       | [FEATURE_TERMINAL.md](developers-debug/FEATURE_TERMINAL.md)               |
| 🪟 Tiling Window Manager | [FEATURE_TILING_WM.md](developers-debug/FEATURE_TILING_WM.md)             |
| 🧊 Glassmorphism UI      | [FEATURE_GLASSMORPHISM.md](developers-debug/FEATURE_GLASSMORPHISM.md)     |
| 💻 Command System        | [FEATURE_COMMANDS.md](developers-debug/FEATURE_COMMANDS.md)               |
| 🚀 Boot Sequence         | [FEATURE_BOOT_SEQUENCE.md](developers-debug/FEATURE_BOOT_SEQUENCE.md)     |
| 🟢 Matrix Rain           | [FEATURE_MATRIX_RAIN.md](developers-debug/FEATURE_MATRIX_RAIN.md)         |
| 🔐 Admin Dashboard       | [FEATURE_ADMIN_DASHBOARD.md](developers-debug/FEATURE_ADMIN_DASHBOARD.md) |
| 📱 Responsive Design     | [FEATURE_RESPONSIVE.md](developers-debug/FEATURE_RESPONSIVE.md)           |
| 🔌 Backend API           | [FEATURE_BACKEND_API.md](developers-debug/FEATURE_BACKEND_API.md)         |

---

## 🛠️ Tech Stack

| Layer         | Tech               | Purpose                        |
| ------------- | ------------------ | ------------------------------ |
| **Framework** | React 19           | Component-based UI             |
| **Build**     | Vite 6             | Dev server + bundler           |
| **Styling**   | TailwindCSS v4     | CSS processing                 |
| **State**     | Zustand            | Global terminal state          |
| **Animation** | Framer Motion      | Layout + enter/exit animations |
| **HTTP**      | Axios              | API calls with fallback        |
| **Routing**   | React Router v7    | `/` and `/admin` routes        |
| **Server**    | Express 4          | REST API                       |
| **Database**  | MongoDB + Mongoose | Project storage                |
| **Auth**      | JWT + bcryptjs     | Admin authentication           |

---

## 📡 API Reference

```
GET    /api/projects       Public  — List all projects
GET    /api/projects/:id   Public  — Get one project
POST   /api/projects       Admin   — Create project
PUT    /api/projects/:id   Admin   — Update project
DELETE /api/projects/:id   Admin   — Delete project
POST   /api/admin/login    Public  — Get JWT token
```

---

## 📱 Responsive Breakpoints

| Width       | Device         | Terminals |
| ----------- | -------------- | --------- |
| ≤480px      | Phones         | 1         |
| ≤768px      | Large phones   | 1         |
| ≤1024px     | Tablets        | 1         |
| 1025–1366px | Small laptops  | 4         |
| ≥1367px     | Desktops       | 4         |
| ≥1600px     | Large monitors | 4         |

---

## 📄 License

MIT
