import mongoose from 'mongoose'

const skillSchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: { type: String, required: true },
}, { _id: false })

const siteContentSchema = new mongoose.Schema({
  // About
  about: {
    name: { type: String, default: 'Shaan Shoukath' },
    tagline: { type: String, default: 'Full-stack developer & tech enthusiast passionate about building innovative solutions that make a real-world impact.' },
    education: { type: String, default: 'Computer Science & Engineering' },
    location: { type: String, default: 'India' },
    focus: { type: String, default: 'AI/ML, Robotics, Web Development' },
  },

  // Skills
  skills: {
    type: [skillSchema],
    default: [
      { category: 'Languages', items: 'Python · JavaScript · TypeScript · C++ · Rust' },
      { category: 'Frontend', items: 'React · Next.js · TailwindCSS · Framer Motion' },
      { category: 'Backend', items: 'Node.js · Express · FastAPI · Django' },
      { category: 'Database', items: 'MongoDB · PostgreSQL · Redis · Firebase' },
      { category: 'DevOps & Tools', items: 'Docker · Git · Linux · Nginx · CI/CD' },
      { category: 'AI / ML / Robotics', items: 'TensorFlow · PyTorch · OpenCV · ROS2' },
    ],
  },

  // Contact
  contact: {
    email: { type: String, default: 'shaan@example.com' },
    github: { type: String, default: 'https://github.com/shaan-shoukath' },
    linkedin: { type: String, default: 'https://linkedin.com/in/shaan-shoukath' },
  },

  // Links
  coffeeUrl: { type: String, default: 'https://buymeacoffee.com/shaan' },
  resumeUrl: { type: String, default: '/resume.pdf' },
  resumeLinkedIn: { type: String, default: 'https://linkedin.com/in/shaan-shoukath' },

  // Shake easter egg — audio played when phone is shaken
  shakeAudioUrl: { type: String, default: '' },

  // Hobbies — shown with sudo hobby
  hobbies: {
    type: [String],
    default: [
      '🎮  Gaming (when I should be coding)',
      '🤖  Building robots that don\'t work yet',
      '🎧  Listening to lofi while pretending to be productive',
      '☕  Drinking way too much coffee',
      '🚀  Breaking things in production at 2 AM',
    ],
  },

  // Sudo meme — audio URL (MP3) played when user types sudo meme
  memeAudioUrl: { type: String, default: '' },

  // Sudo music — YouTube/Spotify URL opened
  musicUrl: { type: String, default: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },

  // Sudo hire shaan — custom message
  hireMessage: { type: String, default: 'Shaan has been hired! Starting date: Immediately. Salary: Yes, please 🚀' },

  // Sudo rm -rf / — YouTube URL opened
  rickrollUrl: { type: String, default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },

  updatedAt: { type: Date, default: Date.now },
})

// Singleton pattern — only one document
siteContentSchema.statics.getContent = async function () {
  let content = await this.findOne()
  if (!content) {
    content = await this.create({})
  }
  return content
}

siteContentSchema.statics.updateContent = async function (data) {
  let content = await this.findOne()
  if (content) {
    Object.assign(content, data)
    content.updatedAt = Date.now()
    await content.save()
  } else {
    content = await this.create(data)
  }
  return content
}

export default mongoose.model('SiteContent', siteContentSchema)
