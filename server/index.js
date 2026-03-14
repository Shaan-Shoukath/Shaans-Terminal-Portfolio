import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import projectRoutes from './routes/projects.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/projects', projectRoutes)
app.use('/api/admin', adminRoutes)

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
