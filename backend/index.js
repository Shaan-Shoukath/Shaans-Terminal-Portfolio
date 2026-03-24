import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import projectRoutes from './routes/projects.js'
import adminRoutes from './routes/admin.js'
import profileRoutes from './routes/profile.js'
import contentRoutes from './routes/content.js'

dotenv.config()
mongoose.set('bufferCommands', false)

const app = express()
const PORT = process.env.PORT || 5000
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// Always allow localhost for development
if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173')
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl / Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use('/api/projects', projectRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/content', contentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✓ Connected to MongoDB')

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message)
    console.log('→ Starting server without database...')
    console.log('  Projects will use fallback data on the frontend')

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT} (no database)`)
    })
  }
}

startServer()
