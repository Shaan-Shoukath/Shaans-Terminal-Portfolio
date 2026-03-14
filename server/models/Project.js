import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  technologies: [{
    type: String,
    trim: true,
  }],
  github: {
    type: String,
    default: '',
  },
  deployment: {
    type: String,
    default: '',
  },
  linkedin: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
})

export default mongoose.model('Project', projectSchema)
