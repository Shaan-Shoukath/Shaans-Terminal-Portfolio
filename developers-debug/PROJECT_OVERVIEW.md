# 🗺️ Project Overview — How Everything Connects

> A bird's-eye view of the entire project for beginners.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     YOUR BROWSER                         │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              React App (Frontend)                    │ │
│  │                                                      │ │
│  │  App.jsx ─── Routes ───┬─── Desktop.jsx (/)         │ │
│  │                        └─── AdminPage.jsx (/admin)  │ │
│  │                                                      │ │
│  │  Desktop.jsx                                         │ │
│  │  ├── BootScreen.jsx    (boot animation)              │ │
│  │  ├── Terminal.jsx ×4   (glassmorphism windows)       │ │
│  │  │   └── commandParser.js (processes typed commands) │ │
│  │  ├── MatrixRain.jsx    (canvas effect)               │ │
│  │  └── Taskbar.jsx       (bottom bar with clock)       │ │
│  │                                                      │ │
│  │  Zustand Store (terminalStore.js)                    │ │
│  │  └── terminals[], focusedId, matrixMode             │ │
│  └──────────────────────────┬──────────────────────────┘ │
│                             │ HTTP Requests (Axios)       │
│                             │ GET /api/projects           │
│                             │ POST /api/admin/login       │
└─────────────────────────────┼───────────────────────────┘
                              │
                    ┌─────────▼─────────────┐
                    │   Vite Dev Server      │
                    │   (proxies /api → :5000)│
                    └─────────┬─────────────┘
                              │
                    ┌─────────▼──────────────┐
                    │   Express Server (:5000) │
                    │                          │
                    │   Middleware:             │
                    │   ├── cors()             │
                    │   ├── express.json()     │
                    │   └── auth (JWT)         │
                    │                          │
                    │   Routes:                │
                    │   ├── /api/projects      │
                    │   └── /api/admin/login   │
                    └─────────┬──────────────┘
                              │
                    ┌─────────▼──────────────┐
                    │   MongoDB Atlas          │
                    │   (or local MongoDB)     │
                    │                          │
                    │   Collection: projects   │
                    │   { title, description,  │
                    │     technologies, ...}   │
                    └─────────────────────────┘
```

---

## 📂 Folder Structure Explained

```
Shaans-Portfolio/
│
├── index.html              ← The ONE HTML file (React is a Single Page App)
├── package.json            ← Frontend dependencies & scripts
├── vite.config.js          ← Vite build configuration
│
├── src/                    ← ALL frontend code
│   ├── main.jsx            ← Bootstraps React into index.html
│   ├── App.jsx             ← Top-level component with routes
│   ├── index.css           ← ALL styles (glassmorphism, responsive, etc.)
│   │
│   ├── store/              ← Global state
│   │   └── terminalStore.js  ← Zustand store for terminal state
│   │
│   ├── commands/           ← Terminal command logic
│   │   ├── commandParser.js    ← Maps commands to output
│   │   └── fallbackProjects.js ← Offline project data
│   │
│   └── components/         ← React components (UI pieces)
│       ├── Desktop.jsx         ← Main layout + keybindings
│       ├── Terminal.jsx        ← Individual terminal window
│       ├── BootScreen.jsx      ← Boot animation
│       ├── Taskbar.jsx         ← Bottom status bar
│       ├── MatrixRain.jsx      ← Matrix rain effect
│       ├── Neofetch.jsx        ← System info display
│       ├── AdminLogin.jsx      ← Admin login form
│       ├── AdminDashboard.jsx  ← Project CRUD interface
│       └── AdminPage.jsx       ← Auth state wrapper
│
├── server/                 ← ALL backend code
│   ├── index.js            ← Server entry point
│   ├── package.json        ← Backend dependencies
│   ├── .env                ← Secret configuration
│   ├── seed.js             ← Database seeder
│   │
│   ├── models/             ← Database schemas
│   │   └── Project.js
│   │
│   ├── routes/             ← URL → handler mapping
│   │   ├── projects.js
│   │   └── admin.js
│   │
│   ├── controllers/        ← Business logic
│   │   └── projectController.js
│   │
│   └── middleware/          ← Request preprocessors
│       └── auth.js
│
├── developers-debug/       ← You are here! 📍
│   ├── FRONTEND_GUIDE.md
│   ├── BACKEND_GUIDE.md
│   └── PROJECT_OVERVIEW.md
│
└── dist/                   ← Built production files (auto-generated)
```

---

## 🔑 Key Terminology

| Term              | Meaning                             | Example in Our Project                      |
| ----------------- | ----------------------------------- | ------------------------------------------- |
| **Component**     | A reusable UI piece                 | `Terminal.jsx` is one terminal window       |
| **State**         | Data that changes over time         | `terminals[]` — changes when you open/close |
| **Props**         | Data passed to a component          | `<Terminal terminal={data} />`              |
| **Route**         | A URL path                          | `/admin` → shows AdminPage                  |
| **Endpoint**      | A backend URL that does something   | `GET /api/projects` returns project list    |
| **Middleware**    | Code that runs before your handler  | `auth` checks JWT before allowing access    |
| **Schema**        | The "shape" of your database data   | Project has title, description, etc.        |
| **JWT**           | A token proving you're logged in    | `eyJhbGci...` sent in Authorization header  |
| **CRUD**          | Create, Read, Update, Delete        | POST, GET, PUT, DELETE                      |
| **Proxy**         | Forwards requests to another server | Vite forwards `/api/*` to port 5000         |
| **SPA**           | Single Page Application             | One HTML file, React handles "pages"        |
| **HMR**           | Hot Module Replacement              | Edit code → browser updates instantly       |
| **ODM**           | Object Document Mapper              | Mongoose maps JS classes to MongoDB         |
| **Glassmorphism** | Frosted glass UI effect             | `backdrop-filter: blur()` on terminals      |

---

## ▶️ How to Run Everything

### Option 1: Frontend Only (no database needed)

```bash
npm run dev
# Opens at http://localhost:5173
# Projects will use fallback data (no MongoDB required)
```

### Option 2: Full Stack

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
npm run dev

# Or run both together:
npm run dev:all
```

### Option 3: Seed the Database

```bash
cd server
npm run seed   # Adds 3 sample projects to MongoDB
```

### Production Build

```bash
npm run build  # Creates optimized files in dist/
```

---

## 🧪 Testing Checklist (Manual)

Try these to verify everything works:

```
□ Boot sequence plays on first visit
□ Type "help" — shows command list
□ Type "about" — shows bio
□ Type "skills" — shows tech stack
□ Type "projects" — lists projects (from API or fallback)
□ Type "neofetch" — shows ASCII art + system info
□ Type "contact" — shows links
□ Type "resume" — shows resume link
□ Type "matrix" — toggles matrix rain
□ Type "coffee" — shows coffee ASCII art
□ Type "sudo hire shaan" — shows easter egg
□ Type "sudo rm -rf /" — shows funny response
□ Type "hyprland" — shows WM info
□ Type "newterm" — opens a second terminal (desktop only)
□ Type "exit" — closes current terminal
□ Type "clear" — clears terminal output
□ Press Alt+Enter — opens new terminal
□ Press Alt+Q — closes focused terminal
□ Press Alt+H/J/K/L — moves focus between terminals
□ Visit /admin — shows login page
□ Login with admin/admin123 — shows dashboard
□ Open Chrome DevTools → toggle device toolbar → check mobile view
```

---

## 📚 Learning Resources

| Topic            | Resource                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| React basics     | [react.dev/learn](https://react.dev/learn)                                                                  |
| Zustand          | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)                                              |
| Framer Motion    | [motion.dev](https://motion.dev)                                                                            |
| Express          | [expressjs.com](https://expressjs.com)                                                                      |
| MongoDB/Mongoose | [mongoosejs.com](https://mongoosejs.com)                                                                    |
| JWT explained    | [jwt.io/introduction](https://jwt.io/introduction)                                                          |
| CSS Grid         | [css-tricks.com/snippets/css/complete-guide-grid](https://css-tricks.com/snippets/css/complete-guide-grid/) |
| Glassmorphism    | [glassmorphism.com](https://glassmorphism.com)                                                              |
