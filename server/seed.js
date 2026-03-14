import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Project from './models/Project.js'

dotenv.config()

const seedData = [
  {
    title: 'Autonomous Agriculture Drone',
    description: 'AI-powered drone for precision agriculture using computer vision and ROS2. Capable of crop health monitoring, pest detection, and automated spraying with 95% accuracy.',
    technologies: ['ROS2', 'Jetson Nano', 'Computer Vision', 'Python', 'OpenCV', 'TensorFlow'],
    github: 'https://github.com/shaan-shoukath/ag-drone',
    deployment: '',
    linkedin: 'https://linkedin.com/in/shaan-shoukath',
    image: '',
  },
  {
    title: 'Hyprland Terminal Portfolio',
    description: 'Interactive developer portfolio simulating a Hyprland Linux desktop environment with glassmorphism Alacritty-style terminals. Visitors explore via CLI commands.',
    technologies: ['React', 'Vite', 'TailwindCSS', 'Framer Motion', 'Node.js', 'MongoDB'],
    github: 'https://github.com/shaan-shoukath/terminal-portfolio',
    deployment: 'https://shaan.dev',
    linkedin: '',
    image: '',
  },
  {
    title: 'Smart Traffic Management System',
    description: 'Real-time traffic flow optimization using IoT sensors and machine learning. Reduces congestion by 35% through adaptive signal control and predictive routing.',
    technologies: ['Python', 'TensorFlow', 'IoT', 'MQTT', 'React', 'PostgreSQL'],
    github: 'https://github.com/shaan-shoukath/smart-traffic',
    deployment: '',
    linkedin: 'https://linkedin.com/in/shaan-shoukath',
    image: '',
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✓ Connected to MongoDB')

    await Project.deleteMany({})
    console.log('✓ Cleared existing projects')

    const created = await Project.insertMany(seedData)
    console.log(`✓ Seeded ${created.length} projects`)

    await mongoose.disconnect()
    console.log('✓ Done')
    process.exit(0)
  } catch (err) {
    console.error('✗ Seed error:', err.message)
    process.exit(1)
  }
}

seed()
