import express from 'express'
import multer from 'multer'
import auth from '../middleware/auth.js'
import Profile from '../models/Profile.js'
import { imageToAscii } from '../utils/imageToAscii.js'

const router = express.Router()

// Configure multer for memory storage (no files saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  },
})

// GET /api/profile/ascii — Public, returns the ASCII art
router.get('/ascii', async (req, res) => {
  try {
    const profile = await Profile.getProfile()
    res.json({
      asciiArt: profile.asciiArt,
      filename: profile.originalFilename,
      width: profile.width,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/profile/ascii — Protected, upload image and convert to ASCII
router.post('/ascii', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' })
    }

    const width = parseInt(req.body.width) || 50

    // Convert image to ASCII
    const asciiArt = await imageToAscii(req.file.buffer, width)

    // Save to database
    const profile = await Profile.updateAscii(
      asciiArt,
      req.file.originalname,
      width
    )

    res.json({
      message: 'Profile ASCII art updated',
      asciiArt: profile.asciiArt,
      filename: profile.originalFilename,
      width: profile.width,
    })
  } catch (err) {
    console.error('ASCII conversion error:', err)
    res.status(500).json({ message: err.message })
  }
})

export default router
