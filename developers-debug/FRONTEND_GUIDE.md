# 🖥️ Frontend — Developer Debug Guide

> **For beginners:** This guide explains every tool, library, function, and file in the frontend.
> If you're new to React or web development, read this top to bottom.

---

## 📦 What is Each Tool / Library?

### 1. Vite — The Build Tool

**What it does:** Vite is the **development server and bundler**. It takes all your React code, CSS, and assets and serves them to the browser during development, and bundles them into optimized files for production.

**Why we use it:**

```
When you run `npm run dev`, Vite:
  1. Starts a local server (http://localhost:5173)
  2. Watches your files for changes
  3. Instantly refreshes the browser when you edit code (HMR — Hot Module Replacement)

When you run `npm run build`, Vite:
  1. Bundles all JS into a single optimized file
  2. Processes CSS and removes unused styles
  3. Outputs everything into the `dist/` folder
```

**Comparison — Why Vite over alternatives?**

| Tool                   | Speed                            | Config                         | Best For              |
| ---------------------- | -------------------------------- | ------------------------------ | --------------------- |
| **Vite** ✅            | ⚡ Extremely fast (uses esbuild) | Minimal — works out of the box | Modern React/Vue apps |
| Create React App (CRA) | 🐌 Slow                          | Hidden, hard to customize      | Legacy projects       |
| Webpack                | 🐌 Slow                          | Complex 100+ line configs      | Large enterprise apps |
| Parcel                 | ⚡ Fast                          | Zero config                    | Small projects        |

**Key file:** `vite.config.js`

```js
export default defineConfig({
  plugins: [react(), tailwindcss()], // Enable React + TailwindCSS
  server: {
    proxy: { "/api": "http://localhost:5000" }, // Forward API calls to backend
  },
});
```

The `proxy` setting means when the frontend calls `/api/projects`, Vite forwards it to `http://localhost:5000/api/projects` so you don't get CORS errors during development.

---

### 2. React — The UI Framework

**What it does:** React lets you build UIs using **components** — reusable pieces of the interface. Instead of writing one giant HTML file, you split everything into small `.jsx` files.

**Key concepts you need to know:**

#### Components

A component is just a **function that returns HTML-like code (JSX)**:

```jsx
function Terminal() {
  return <div className="glass-terminal">Hello</div>;
}
```

#### Props

Props are **inputs** passed to a component:

```jsx
// Parent passes data
<Terminal terminal={terminalData} />;

// Child receives it
function Terminal({ terminal }) {
  return <div>{terminal.id}</div>;
}
```

#### State (useState)

State is **data that changes over time**. When state changes, React re-renders (redraws) the component:

```jsx
const [input, setInput] = useState('')  // '' is the initial value

// When user types, update the state:
onChange={(e) => setInput(e.target.value)}
```

#### Effects (useEffect)

Effects run **side effects** — code that happens after rendering:

```jsx
useEffect(() => {
  // This runs after the component renders
  bodyRef.current.scrollTop = bodyRef.current.scrollHeight; // Auto-scroll
}, [terminal.history]); // Only re-run when history changes
```

#### Refs (useRef)

Refs give you **direct access to DOM elements** (the actual HTML):

```jsx
const inputRef = useRef(null)     // Create a ref
<input ref={inputRef} />          // Attach it to an element
inputRef.current.focus()          // Now you can control it directly
```

#### useCallback

Wraps a function so React **doesn't recreate it every render** (performance optimization):

```jsx
const handleSubmit = useCallback(
  async (e) => {
    // This function is memoized — same reference between renders
  },
  [input, terminal.id],
);
```

**Comparison — Why React?**

| Framework    | Learning Curve | Ecosystem                              | Job Market |
| ------------ | -------------- | -------------------------------------- | ---------- |
| **React** ✅ | Medium         | Massive — most libraries support React | Largest    |
| Vue          | Easy           | Good                                   | Medium     |
| Svelte       | Easy           | Growing                                | Small      |
| Angular      | Hard           | Enterprise-focused                     | Medium     |

---

### 3. React Router — Page Navigation

**What it does:** Lets you have **multiple "pages"** in a single-page app without full page reloads.

**How it works in our app:**

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Desktop />} /> {/* Main portfolio */}
    <Route path="/admin" element={<AdminPage />} /> {/* Hidden admin panel */}
  </Routes>
</BrowserRouter>
```

- Visit `localhost:5174/` → shows the Hyprland desktop
- Visit `localhost:5174/admin` → shows the admin login

**No full page reload happens!** React Router swaps components in/out.

---

### 4. TailwindCSS v4 — Styling

**What it does:** A utility-first CSS framework. In our project we mainly use it as a **CSS processing engine** — our styles are in `index.css` using regular CSS, and Tailwind handles the build pipeline.

**The `@import "tailwindcss"` line** at the top of `index.css` enables Tailwind's CSS processing.

**Why TailwindCSS for processing (vs. plain CSS build)?**

- Automatic vendor prefixes (e.g., `-webkit-backdrop-filter`)
- CSS optimization and minification
- Modern CSS nesting support

---

### 5. Zustand — State Management

**What it does:** Manages **shared state** between components. Without Zustand, if Terminal A wants to know about Terminal B, you'd have to pass data through multiple parent components ("prop drilling"). Zustand gives every component direct access to shared state.

**How it works:**

```js
// Create a store (like a global brain)
const useTerminalStore = create((set, get) => ({
  terminals: [], // The data
  addTerminal: () => {
    // Functions to modify data
    set((state) => ({ terminals: [...state.terminals, newTerm] }));
  },
}));

// Use it in ANY component — no prop drilling!
function Desktop() {
  const terminals = useTerminalStore((s) => s.terminals); // Read data
  const addTerminal = useTerminalStore((s) => s.addTerminal); // Get function
}
```

**Comparison — Why Zustand over alternatives?**

| Library        | Boilerplate | Learning Curve | Size            |
| -------------- | ----------- | -------------- | --------------- |
| **Zustand** ✅ | Almost none | Very easy      | 1 KB            |
| Redux Toolkit  | Medium      | Medium         | 11 KB           |
| Redux (old)    | Massive     | Hard           | 7 KB            |
| Jotai          | None        | Easy           | 3 KB            |
| MobX           | Medium      | Medium         | 15 KB           |
| React Context  | None        | Easy           | 0 KB (built-in) |

Zustand wins because: tiny size, no boilerplate, simple API, works exactly like `useState` but globally.

---

### 6. Framer Motion — Animations

**What it does:** Adds smooth **animations** to React components. Instead of complex CSS animations or manual JavaScript animation code, you just add props.

**How we use it:**

```jsx
// Animate a terminal appearing/disappearing
<motion.div
  layout                           // Automatically animate position/size changes
  initial={{ opacity: 0, scale: 0.92 }}  // Starting state
  animate={{ opacity: 1, scale: 1 }}     // Final state
  exit={{ opacity: 0, scale: 0.92 }}     // When removed
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
```

- `layout` → When the grid changes (1 terminal → 2), Framer Motion smoothly animates the resize
- `AnimatePresence` → Detects when components are added/removed and plays enter/exit animations
- `spring` transition → Gives a natural bouncy feel instead of linear

**Comparison — Why Framer Motion?**

| Library              | Features                            | Ease   | React Support  |
| -------------------- | ----------------------------------- | ------ | -------------- |
| **Framer Motion** ✅ | Layout animations, gestures, scroll | Easy   | Native         |
| CSS transitions      | Basic                               | Manual | All frameworks |
| GSAP                 | Very powerful                       | Hard   | Needs adapters |
| React Spring         | Spring physics                      | Medium | Native         |

---

### 7. Axios — HTTP Requests

**What it does:** Makes API calls (HTTP requests) to the backend. It's a better version of the built-in `fetch()`.

```js
// Fetch projects from the backend
const res = await axios.get("/api/projects"); // GET request
const projects = res.data; // Response data

// Admin login
await axios.post("/api/admin/login", { username, password }); // POST request
```

**Why Axios over fetch()?**

| Feature              | Axios ✅             | fetch()                          |
| -------------------- | -------------------- | -------------------------------- |
| JSON auto-parse      | ✅ Automatic         | ❌ Manual `.json()`              |
| Error handling       | ✅ Throws on 4xx/5xx | ❌ Only throws on network errors |
| Request interceptors | ✅ Built-in          | ❌ Manual                        |
| Timeout support      | ✅ Built-in          | ❌ Manual AbortController        |

---

## 📁 File-by-File Breakdown

### `src/main.jsx` — Entry Point

```
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

- Finds the `<div id="root">` in `index.html`
- Renders the entire React app inside it
- `StrictMode` enables extra development warnings

### `src/App.jsx` — Router Setup

- Sets up React Router with 2 routes: `/` and `/admin`
- This is the top-level component

### `src/index.css` — All Styles

- CSS custom properties (variables) for the color theme
- Glassmorphism effect using `backdrop-filter: blur(24px)`
- Grid layouts for terminal tiling (1/2/3/4 windows)
- Responsive breakpoints for every device size
- Taskbar, boot screen, admin dashboard styles

### `src/store/terminalStore.js` — Global State

All terminal data lives here:

| State          | Type    | Purpose                           |
| -------------- | ------- | --------------------------------- |
| `terminals`    | Array   | List of all open terminals        |
| `focusedId`    | Number  | Which terminal has keyboard input |
| `matrixMode`   | Boolean | Is matrix rain active?            |
| `maxTerminals` | Number  | 1 on phone/tablet, 4 on desktop   |

| Function                       | What It Does                                |
| ------------------------------ | ------------------------------------------- |
| `addTerminal()`                | Creates a new terminal (checks max limit)   |
| `removeTerminal(id)`           | Closes a terminal                           |
| `setFocused(id)`               | Sets which terminal receives keyboard input |
| `addOutput(id, lines)`         | Adds output text to a terminal's history    |
| `clearTerminal(id)`            | Clears all output from a terminal           |
| `addCommandToHistory(id, cmd)` | Stores command for arrow-key navigation     |
| `navigateHistory(id, dir)`     | Up/Down arrow through past commands         |
| `toggleMatrix()`               | Toggles matrix rain on/off                  |
| `focusDirection(dir)`          | Alt+H/J/K/L to move focus between terminals |

### `src/commands/commandParser.js` — Command Engine

The brain of the terminal. Takes a string like `"help"` and returns formatted output lines.

```
User types: "projects"
  → executeCommand("projects", store, termId)
    → projectsCommand()
      → fetchProjects() calls GET /api/projects
      → Falls back to fallbackProjects.js if backend is offline
      → Returns array of formatted line objects
```

Each output line is an object:

```js
{ type: 'text', text: '  Hello!', className: 'output-success' }
{ type: 'link', text: '  GitHub', url: 'https://...', className: 'output-link' }
{ type: 'neofetch' }  // Renders the Neofetch component
{ type: 'prompt', text: 'help' }  // Renders the colored prompt line
```

### `src/components/Desktop.jsx` — Main Desktop

- Shows boot screen first, then the desktop
- Manages keyboard shortcuts (Alt+Enter, Alt+Q, Alt+HJKL)
- Renders the wallpaper, terminal grid, matrix rain, and taskbar
- The `data-count` attribute on `.terminal-container` controls the CSS grid layout

### `src/components/Terminal.jsx` — Terminal Window

Each terminal window handles:

1. **Rendering the title bar** (red/yellow/green dots)
2. **Displaying output history** (scrollable area)
3. **Input line** with blinking cursor
4. **Command submission** → calls `executeCommand()`
5. **Arrow key history** → navigates past commands
6. **Focus management** → only focused terminal accepts input

### `src/components/BootScreen.jsx` — Boot Animation

- Shows boot lines one-by-one with timed delays
- Each line fades in with Framer Motion
- After all lines show, waits 400ms then calls `onComplete`
- The parent (Desktop) then switches to the actual terminal view

### `src/components/MatrixRain.jsx` — Matrix Effect

- Creates a full-screen `<canvas>` element
- Draws Katakana characters falling like The Matrix
- Uses `requestAnimationFrame`-style loop via `setInterval(draw, 40)`
- Characters: Japanese katakana + numbers + code symbols

### `src/components/Neofetch.jsx` — System Info

- Mimics Linux `neofetch` command
- Shows ASCII art logo + system information
- All data is hardcoded (it's a portfolio, not a real OS!)

### `src/components/Taskbar.jsx` — Bottom Bar

- Shows "ShaanOS" branding
- Displays terminal count
- Shows workspace indicators (purple dots for each terminal)
- Live clock updated every second

### `src/components/AdminLogin.jsx` — Admin Auth

- Form with username/password fields
- Sends POST to `/api/admin/login`
- Stores JWT token in `localStorage`
- Shows error message if login fails

### `src/components/AdminDashboard.jsx` — Project Manager

- Full CRUD interface for projects
- Table showing all projects
- Form to create/edit projects (2-column grid layout)
- Delete confirmation
- All API calls include JWT token in Authorization header

---

## 🔄 Data Flow Diagram

```
User types "projects" → Terminal.jsx
  → handleSubmit() called
    → executeCommand("projects", store, termId)
      → projectsCommand()
        → axios.get('/api/projects')
          → Vite proxy forwards to localhost:5000
            → Express receives request
              → MongoDB returns data
            → Express sends JSON response
          → Vite proxy forwards response back
        → If backend offline: use fallbackProjects.js
      → Returns formatted output array
    → store.addOutput(termId, output)
  → React re-renders Terminal
    → renderLine() maps each output object to JSX
  → useEffect auto-scrolls to bottom
```

---

## 🔑 Key CSS Concepts

### Glassmorphism

```css
backdrop-filter: blur(24px) saturate(1.2); /* Blur what's behind */
background: rgba(12, 12, 20, 0.65); /* Semi-transparent bg */
border: 1px solid rgba(255, 255, 255, 0.08); /* Subtle border */
```

This creates the frosted glass effect on terminals.

### CSS Grid for Tiling

```css
/* 2 terminals → side by side */
.terminal-container[data-count="2"] {
  grid-template-columns: 1fr 1fr; /* 2 equal columns */
}

/* 3 terminals → master + stack */
.terminal-container[data-count="3"] > :first-child {
  grid-row: 1 / -1; /* First terminal spans full height */
}
```

### CSS Custom Properties (Variables)

```css
:root {
  --accent-purple: #8b5cf6; /* Define once */
}
.element {
  color: var(--accent-purple); /* Use everywhere */
}
```

Change one value, and it updates everywhere — great for theming.

---

## 🐛 Common Debugging Tips

1. **Console errors?** → Open Chrome DevTools (F12) → Console tab
2. **Styling broken?** → Inspect element → check if CSS classes match
3. **API not working?** → Network tab → check if requests are going through
4. **State issues?** → Add `console.log(useTerminalStore.getState())` anywhere
5. **Hot reload not working?** → Restart `npm run dev`
