# 🛠️ Backend — Developer Debug Guide

> **For beginners:** This guide explains every tool, library, function, and file in the backend server.
> If you've never built a backend before, start here.

---

## 🧠 What IS a Backend?

```
Frontend (React)  ←→  Backend (Express)  ←→  Database (MongoDB)
   Browser              Server                Data Storage

The user sees         Handles logic,          Stores projects,
the terminal UI       authentication,         user data
                      API endpoints           permanently
```

The frontend **can't talk directly to the database** (that would be a security nightmare). The backend sits in the middle — it receives requests, validates them, talks to the database, and sends back responses.

---

## 📦 What is Each Tool / Library?

### 1. Node.js — The Runtime

**What it does:** Lets you run **JavaScript outside the browser**. Normally, JS only runs in Chrome/Firefox. Node.js lets you run it on a server.

```
Browser JS: Can manipulate HTML, handle clicks
Node.js:    Can read files, start servers, talk to databases
```

**You already have it installed** — that's how `npm` works!

---

### 2. Express — The Web Framework

**What it does:** Express is a **lightweight web server framework**. It handles incoming HTTP requests and sends back responses.

**Without Express** (pure Node.js):

```js
// UGLY — you'd have to manually parse URLs, methods, headers, body...
const http = require("http");
http
  .createServer((req, res) => {
    if (req.method === "GET" && req.url === "/api/projects") {
      // manually parse, query DB, format response...
    }
  })
  .listen(5000);
```

**With Express** (what we use):

```js
// CLEAN — Express handles all the parsing
app.get("/api/projects", async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});
```

**Comparison — Why Express?**

| Framework      | Speed  | Ecosystem              | Learning Curve                | Best For                 |
| -------------- | ------ | ---------------------- | ----------------------------- | ------------------------ |
| **Express** ✅ | Good   | Massive (most popular) | Very easy                     | APIs, web apps           |
| Fastify        | Faster | Growing                | Easy                          | High-performance APIs    |
| Koa            | Good   | Medium                 | Easy                          | Clean async code         |
| NestJS         | Good   | Large                  | Hard (TypeScript, decorators) | Enterprise apps          |
| Hapi           | Good   | Medium                 | Medium                        | Configuration-heavy apps |

Express wins for beginners because: huge community, tons of tutorials, simple API.

---

### 3. MongoDB — The Database

**What it does:** Stores data **permanently**. When the server restarts, your projects are still there because they're saved in MongoDB.

**How it stores data:** MongoDB uses **documents** (like JSON objects):

```json
{
  "_id": "65abc123...",
  "title": "My Project",
  "technologies": ["React", "Node"],
  "github": "https://github.com/..."
}
```

**Comparison — SQL vs. NoSQL**

| Feature        | MongoDB (NoSQL) ✅             | PostgreSQL (SQL)                 |
| -------------- | ------------------------------ | -------------------------------- |
| Data format    | JSON documents                 | Rows & columns (tables)          |
| Schema         | Flexible (can change anytime)  | Strict (must define upfront)     |
| Query language | JavaScript-like                | SQL language                     |
| Best for       | Rapid prototyping, varied data | Complex relationships, analytics |
| Learning curve | Easy for JS devs               | Need to learn SQL                |
| Scaling        | Horizontal (add more servers)  | Vertical (bigger server)         |

We chose MongoDB because:

- Your project data is simple (no complex relationships)
- Documents look like JavaScript objects (natural for JS devs)
- MongoDB Atlas gives you a free cloud database

---

### 4. Mongoose — The ODM (Object Document Mapper)

**What it does:** Mongoose is a layer **between Express and MongoDB**. Instead of writing raw MongoDB queries, you define schemas and use clean JavaScript methods.

**Without Mongoose** (raw MongoDB driver):

```js
// HARD — manual collection access, no validation
const db = client.db("portfolio");
const result = await db.collection("projects").insertOne({
  title: "Test",
  randomField: 123, // No validation! Anything goes!
});
```

**With Mongoose** (what we use):

```js
// CLEAN — schema validates data, provides methods
const Project = mongoose.model("Project", projectSchema);
const project = new Project({ title: "Test" });
await project.save(); // Validates against schema first!
```

**Key Mongoose concepts:**

#### Schema — Define your data shape

```js
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Must have a title
    technologies: [String], // Array of strings
    github: { type: String, default: "" }, // Optional, defaults to ''
  },
  { timestamps: true },
); // auto createdAt/updatedAt
```

#### Model — Create a class from the schema

```js
const Project = mongoose.model("Project", projectSchema);
```

#### Model Methods

```js
Project.find(); // Get ALL projects
Project.findById(id); // Get ONE project by ID
Project.findByIdAndUpdate(); // Update a project
Project.findByIdAndDelete(); // Delete a project
new Project(data).save(); // Create a new project
```

---

### 5. JSON Web Tokens (JWT) — Authentication

**What it does:** JWTs are **encrypted tokens** that prove a user is logged in. Instead of checking username/password on every request, you check the token.

**Flow:**

```
1. Admin sends: POST /api/admin/login { username, password }
2. Server validates credentials
3. Server creates a JWT token (encrypted string)
4. Server sends token back to frontend
5. Frontend stores token in localStorage
6. For every admin request, frontend sends: Authorization: Bearer <token>
7. Server verifies token before allowing access
```

**What a JWT looks like:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.abc123...
```

It's 3 parts separated by dots: Header.Payload.Signature

**Why JWT over alternatives?**

| Method     | Stateless?              | Scalable? | Best For             |
| ---------- | ----------------------- | --------- | -------------------- |
| **JWT** ✅ | Yes (no server storage) | Very      | APIs, SPAs           |
| Sessions   | No (stored on server)   | Hard      | Traditional web apps |
| API Keys   | Yes                     | Yes       | Service-to-service   |

---

### 6. bcryptjs — Password Hashing

**What it does:** Turns passwords into **irreversible hashes** so they're not stored as plain text.

```
"admin123" → "$2a$10$X7YJkQ3..." (hashed — can't reverse this!)
```

**Why hash?** If someone steals your database, they see `$2a$10$X7YJkQ3...` instead of `admin123`.

> **Note:** In our current setup, we compare passwords directly for simplicity. For production, you should hash the password with `bcrypt.hash()` and compare with `bcrypt.compare()`.

---

### 7. CORS — Cross-Origin Resource Sharing

**What it does:** By default, browsers **block** requests from one origin (localhost:5173) to another (localhost:5000). CORS tells the browser "it's OK, allow this."

```js
app.use(cors()); // Allow all origins (fine for development)
```

Without this, every API call from the frontend would fail with a CORS error.

---

### 8. dotenv — Environment Variables

**What it does:** Loads variables from a `.env` file into `process.env`.

**`.env` file:**

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shaan-portfolio
JWT_SECRET=my-super-secret-key
```

**In code:**

```js
dotenv.config(); // Load .env file
const port = process.env.PORT; // → "5000"
```

**Why use .env?**

- Keep secrets out of your code
- Different values for development vs. production
- `.env` is in `.gitignore` — never pushed to GitHub

---

## 📁 File-by-File Breakdown

### `server/index.js` — Server Entry Point

```
What happens when you run `node server/index.js`:

1. dotenv.config() → loads .env variables
2. app.use(cors()) → enables cross-origin requests
3. app.use(express.json()) → parses JSON request bodies
4. app.use('/api/projects', projectRoutes) → mounts project API
5. app.use('/api/admin', adminRoutes) → mounts admin auth API
6. mongoose.connect() → connects to MongoDB
7. app.listen(5000) → starts accepting requests
```

If MongoDB connection fails, the server **still starts** — the frontend will use fallback data.

---

### `server/models/Project.js` — Data Schema

Defines what a "Project" looks like in the database:

| Field          | Type     | Required | Default |
| -------------- | -------- | -------- | ------- |
| `title`        | String   | ✅ Yes   | —       |
| `description`  | String   | ✅ Yes   | —       |
| `technologies` | [String] | No       | `[]`    |
| `github`       | String   | No       | `''`    |
| `deployment`   | String   | No       | `''`    |
| `linkedin`     | String   | No       | `''`    |
| `image`        | String   | No       | `''`    |
| `createdAt`    | Date     | Auto     | Now     |
| `updatedAt`    | Date     | Auto     | Now     |

---

### `server/controllers/projectController.js` — Business Logic

Each function handles one type of request:

| Function        | HTTP Method | URL                 | What It Does                       |
| --------------- | ----------- | ------------------- | ---------------------------------- |
| `getProjects`   | GET         | `/api/projects`     | Returns all projects, newest first |
| `getProject`    | GET         | `/api/projects/:id` | Returns one project by ID          |
| `createProject` | POST        | `/api/projects`     | Creates a new project              |
| `updateProject` | PUT         | `/api/projects/:id` | Updates an existing project        |
| `deleteProject` | DELETE      | `/api/projects/:id` | Deletes a project                  |

**What `:id` means:**

```
GET /api/projects/65abc123
                  ^^^^^^^^^ This is the :id parameter
req.params.id → "65abc123"
```

**Error handling pattern:**

```js
try {
  // Try the operation
  const projects = await Project.find();
  res.json(projects); // Success → send data
} catch (err) {
  res.status(500).json({ message: err.message }); // Error → send error
}
```

---

### `server/routes/projects.js` — URL Routing

Maps URLs to controller functions:

```js
router.get("/", getProjects); // Public — anyone can read
router.get("/:id", getProject); // Public
router.post("/", auth, createProject); // Protected — need JWT
router.put("/:id", auth, updateProject); // Protected
router.delete("/:id", auth, deleteProject); // Protected
```

Notice `auth` middleware before create/update/delete — only logged-in admins can modify data!

---

### `server/routes/admin.js` — Authentication

```
POST /api/admin/login
Body: { "username": "admin", "password": "admin123" }

Steps:
1. Check if username matches ADMIN_USERNAME env var
2. Check if password matches ADMIN_PASSWORD env var
3. If both match → create JWT token with jwt.sign()
4. Return { token: "eyJ..." }
5. If wrong → return 401 "Invalid credentials"
```

---

### `server/middleware/auth.js` — Route Protection

This runs BEFORE the controller function:

```
Request comes in → auth middleware checks:
  1. Is there an Authorization header?
  2. Does it start with "Bearer "?
  3. Extract the token
  4. jwt.verify(token, secret) → is it valid?
  5. If valid → add decoded data to req.admin, call next()
  6. If invalid → return 401 error, stop here
```

**How middleware works:**

```
Request → [cors] → [json parser] → [auth] → [controller] → Response
           ↑           ↑             ↑           ↑
         Middleware   Middleware    Middleware   Handler
         (always)     (always)    (protected    (your code)
                                   routes only)
```

---

### `server/seed.js` — Sample Data

Run with `npm run seed` to populate the database with 3 sample projects. It:

1. Connects to MongoDB
2. Deletes all existing projects
3. Inserts 3 hardcoded projects
4. Disconnects and exits

---

## 🔄 Request/Response Lifecycle

```
Browser                    Express Server               MongoDB
  |                              |                         |
  |  GET /api/projects           |                         |
  |----------------------------->|                         |
  |                              |  Project.find()         |
  |                              |------------------------>|
  |                              |                         |
  |                              |  [{ title: "..." }, ...] |
  |                              |<------------------------|
  |                              |                         |
  |  200 OK                      |                         |
  |  [{ title: "..." }, ...]     |                         |
  |<-----------------------------|                         |
  |                              |                         |
```

**For protected routes (admin):**

```
Browser                    Express Server               MongoDB
  |                              |                         |
  |  POST /api/projects          |                         |
  |  Authorization: Bearer JWT   |                         |
  |  Body: { title: "New" }      |                         |
  |----------------------------->|                         |
  |                              |                         |
  |            auth middleware:   |                         |
  |            verify JWT ✓      |                         |
  |                              |                         |
  |                              |  new Project().save()   |
  |                              |------------------------>|
  |                              |                         |
  |  201 Created                 |                         |
  |  { _id: "...", title: "New" }|                         |
  |<-----------------------------|                         |
```

---

## 🔧 HTTP Status Codes We Use

| Code  | Meaning      | When We Return It                          |
| ----- | ------------ | ------------------------------------------ |
| `200` | OK           | Successful GET, PUT, DELETE                |
| `201` | Created      | Successful POST (new resource)             |
| `400` | Bad Request  | Invalid data (missing required fields)     |
| `401` | Unauthorized | No token, invalid token, wrong credentials |
| `404` | Not Found    | Project ID doesn't exist                   |
| `500` | Server Error | Database error, unexpected crash           |

---

## 🐛 Common Debugging Tips

### 1. Server won't start?

```bash
# Check if MongoDB is running
mongosh  # If this fails, MongoDB isn't running

# Check if port 5000 is already in use
lsof -i :5000
```

### 2. API returns errors?

```bash
# Test API directly using curl
curl http://localhost:5000/api/projects
curl http://localhost:5000/api/health

# Test with authentication
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. MongoDB connection fails?

- Check if `MONGODB_URI` in `.env` is correct
- For MongoDB Atlas: whitelist your IP in Atlas dashboard
- For local MongoDB: make sure `mongod` service is running

### 4. JWT token expired?

- Tokens expire after 24 hours
- Log out and log in again to get a fresh token

### 5. CORS errors in browser?

- Make sure `app.use(cors())` is before your routes
- In production, restrict CORS to your frontend domain

---

## ⚡ Quick Reference — API Endpoints

```
PUBLIC (no auth needed):
  GET    /api/projects       → List all projects
  GET    /api/projects/:id   → Get one project
  GET    /api/health         → Server health check

AUTH:
  POST   /api/admin/login    → Login, get JWT token

PROTECTED (need JWT):
  POST   /api/projects       → Create project
  PUT    /api/projects/:id   → Update project
  DELETE /api/projects/:id   → Delete project
```
