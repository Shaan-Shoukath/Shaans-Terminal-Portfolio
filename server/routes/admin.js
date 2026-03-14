import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  const adminUser = process.env.ADMIN_USERNAME || 'admin'
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123'

  if (username !== adminUser) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // Simple password check (use bcrypt hash in production)
  if (password !== adminPass) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )

  res.json({ token, message: 'Login successful' })
})

export default router
