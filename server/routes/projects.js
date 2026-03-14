import express from 'express'
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/projectController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', getProjects)
router.get('/:id', getProject)

// Protected routes (admin)
router.post('/', auth, createProject)
router.put('/:id', auth, updateProject)
router.delete('/:id', auth, deleteProject)

export default router
