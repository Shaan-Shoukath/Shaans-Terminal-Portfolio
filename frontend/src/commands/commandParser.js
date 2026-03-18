import axios from 'axios'
import fallbackProjects from './fallbackProjects'
import config from '../config'

let cachedProjects = null
let cachedContent = null

// ── Data fetchers ──────────────────────────────────────────────

async function fetchProjects() {
  try {
    const res = await axios.get(`${config.apiUrl}/api/projects`)
    cachedProjects = res.data
    return cachedProjects
  } catch {
    cachedProjects = fallbackProjects
    return cachedProjects
  }
}

async function fetchContent() {
  try {
    const res = await axios.get(`${config.apiUrl}/api/content`)
    cachedContent = res.data
    return cachedContent
  } catch {
    // Return defaults when backend is offline
    cachedContent = {
      about: {
        name: 'Shaan Shoukath',
        tagline: 'Full-stack developer & tech enthusiast passionate about building innovative solutions that make a real-world impact.',
        education: 'Computer Science & Engineering',
        location: 'India',
        focus: 'AI/ML, Robotics, Web Development',
      },
      skills: [
        { category: 'Languages', items: 'Python · JavaScript · TypeScript · C++ · Rust' },
        { category: 'Frontend', items: 'React · Next.js · TailwindCSS · Framer Motion' },
        { category: 'Backend', items: 'Node.js · Express · FastAPI · Django' },
        { category: 'Database', items: 'MongoDB · PostgreSQL · Redis · Firebase' },
        { category: 'DevOps & Tools', items: 'Docker · Git · Linux · Nginx · CI/CD' },
        { category: 'AI / ML / Robotics', items: 'TensorFlow · PyTorch · OpenCV · ROS2' },
      ],
      contact: {
        email: 'shaan@example.com',
        github: 'https://github.com/shaan-shoukath',
        linkedin: 'https://linkedin.com/in/shaan-shoukath',
      },
      coffeeUrl: 'https://buymeacoffee.com/shaan',
      resumeUrl: '/resume.pdf',
      resumeLinkedIn: 'https://linkedin.com/in/shaan-shoukath',
    }
    return cachedContent
  }
}

// ── Helpers ─────────────────────────────────────────────────────

const BOX_W = 48 // inner character count between corners

function line(text, className = 'output-text') {
  return { type: 'text', text, className }
}

function blank() {
  return line('')
}

// ── Box drawing generators (guarantees matched top/bottom) ──────

function boxTop(title) {
  const label = `─── ${title} `
  return { type: 'text', text: `  ┌${label}${'─'.repeat(BOX_W - label.length)}┐`, className: 'output-accent output-border' }
}
function boxBottom() {
  return { type: 'text', text: `  └${'─'.repeat(BOX_W)}┘`, className: 'output-accent output-border' }
}
function dblBoxTop() {
  return { type: 'text', text: `  ╔${'═'.repeat(BOX_W)}╗`, className: 'output-accent output-border' }
}
function dblBoxBottom() {
  return { type: 'text', text: `  ╚${'═'.repeat(BOX_W)}╝`, className: 'output-accent output-border' }
}
function dblBoxRow(content, pad = ' ') {
  const inner = content + pad.repeat(Math.max(0, BOX_W - content.length))
  return { type: 'text', text: `  ║${inner}║`, className: 'output-accent output-border' }
}
function divider(title, cls = 'output-muted output-border') {
  const label = `─── ${title} `
  return { type: 'text', text: `  ${label}${'─'.repeat(BOX_W - label.length + 2)}`, className: cls }
}
function roundBoxTop(title) {
  const label = `─── ${title} `
  return { type: 'text', text: `  ╭${label}${'─'.repeat(BOX_W - label.length)}╮`, className: 'output-muted output-border' }
}
function roundBoxBottom() {
  return { type: 'text', text: `  ╰${'─'.repeat(BOX_W)}╯`, className: 'output-muted output-border' }
}
function roundBoxRow(content) {
  const inner = content + ' '.repeat(Math.max(0, BOX_W - content.length))
  return line(`  │${inner}│`, 'output-muted')
}
function dblBoxTopSuccess() {
  return { type: 'text', text: `  ╔${'═'.repeat(BOX_W)}╗`, className: 'output-success output-border' }
}
function dblBoxBottomSuccess() {
  return { type: 'text', text: `  ╚${'═'.repeat(BOX_W)}╝`, className: 'output-success output-border' }
}
function dblBoxRowSuccess(content, pad = ' ') {
  const inner = content + pad.repeat(Math.max(0, BOX_W - content.length))
  return { type: 'text', text: `  ║${inner}║`, className: 'output-success output-border' }
}

// ── Command dispatcher ─────────────────────────────────────────

export async function executeCommand(cmd, store, termId) {
  const input = cmd.trim()
  if (!input) return []

  const [command, ...args] = input.split(/\s+/)
  const lower = command.toLowerCase()

  switch (lower) {
    case 'help':
      return helpCommand()
    case 'about':
      return await aboutCommand()
    case 'skills':
      return await skillsCommand()
    case 'projects':
      return await projectsCommand()
    case 'resume':
      return await resumeCommand()
    case 'contact':
      return await contactCommand()
    case 'clear':
      store.clearTerminal(termId)
      return []
    case 'neofetch':
      return neofetchCommand()
    case 'newterm':
      return newtermCommand(store)
    case 'exit':
      store.removeTerminal(termId)
      return []
    case 'open':
      return await openCommand(args)
    case 'sudo':
      return await sudoCommand(args)
    case 'matrix':
      store.toggleMatrix()
      return [line('  ⟩ Matrix mode toggled.', 'output-success')]
    case 'coffee':
      return await coffeeCommand()
    default:
      return [
        line(`  zsh: command not found: ${command}`, 'output-error'),
        line(`  Type 'help' to see available commands.`, 'output-muted'),
      ]
  }
}

// ── Commands ────────────────────────────────────────────────────

function helpCommand() {
  return [
    blank(),
    dblBoxTop(),
    dblBoxRow('          AVAILABLE COMMANDS'),
    dblBoxBottom(),
    blank(),
    line('  about       → Who is Shaan?', 'output-text'),
    line('  skills      → Tech stack & expertise', 'output-text'),
    line('  projects    → Browse portfolio projects', 'output-text'),
    line('  open <id>   → View project details', 'output-text'),
    line('  resume      → Open resume / CV', 'output-text'),
    line('  contact     → Get in touch', 'output-text'),
    line('  coffee      → ☕ Buy me a coffee', 'output-text'),
    line('  neofetch    → System information', 'output-text'),
    line('  matrix      → Toggle matrix rain effect', 'output-text'),
    line('  newterm     → Open new terminal (Alt+Enter)', 'output-text'),
    line('  exit        → Close this terminal (Alt+Q)', 'output-text'),
    line('  clear       → Clear terminal', 'output-text'),
    line('  sudo <cmd>  → Try your luck...', 'output-muted'),
    blank(),
    divider('Keybindings'),
    line('  Alt+Enter → New terminal    Alt+Q → Close', 'output-muted'),
    line('  Alt+W/A/S/D → Navigate terminals', 'output-muted'),
    blank(),
  ]
}

async function aboutCommand() {
  const content = cachedContent || await fetchContent()
  const a = content.about
  return [
    blank(),
    boxTop('About Me'),
    blank(),
    line(`    👋 Hey, I'm ${a.name}`, 'output-heading'),
    blank(),
    ...a.tagline.match(/.{1,50}(\s|$)/g).map(s => line(`    ${s.trim()}`, 'output-text')),
    blank(),
    line(`    🎓 Education: ${a.education}`, 'output-text'),
    line(`    📍 Location: ${a.location}`, 'output-text'),
    line(`    🔭 Focus: ${a.focus}`, 'output-text'),
    blank(),
    boxBottom(),
    blank(),
  ]
}

async function skillsCommand() {
  const content = cachedContent || await fetchContent()
  const lines = [
    blank(),
    boxTop('Skills & Technologies'),
    blank(),
  ]

  content.skills.forEach(skill => {
    lines.push(line(`    ▸ ${skill.category}`, 'output-warning'))
    lines.push(line(`      ${skill.items}`, 'output-text'))
    lines.push(blank())
  })

  lines.push(boxBottom())
  lines.push(blank())
  return lines
}

async function projectsCommand() {
  const projects = await fetchProjects()
  const lines = [
    blank(),
    boxTop('Projects'),
    blank(),
  ]

  projects.forEach((p, i) => {
    lines.push(line(`    [${i + 1}] ${p.title}`, 'output-heading'))
    lines.push(line(`        ${p.description.slice(0, 80)}${p.description.length > 80 ? '...' : ''}`, 'output-text'))
    lines.push(line(`        Tech: ${p.technologies.join(', ')}`, 'output-muted'))
    if (p.github) lines.push({ type: 'link', text: `        GitHub: ${p.github}`, url: p.github, className: 'output-link' })
    if (p.deployment) lines.push({ type: 'link', text: `        Live: ${p.deployment}`, url: p.deployment, className: 'output-link' })
    if (p.linkedin) lines.push({ type: 'link', text: `        LinkedIn: ${p.linkedin}`, url: p.linkedin, className: 'output-link' })
    lines.push(blank())
  })

  lines.push(boxBottom())
  lines.push(blank())
  lines.push(roundBoxTop('How to explore'))
  lines.push(roundBoxRow('  Type  open <number>  to view details'))
  lines.push(roundBoxRow('  Example:  open 1'))
  lines.push(roundBoxBottom())
  lines.push(blank())

  return lines
}

async function openCommand(args) {
  if (!args[0]) {
    return [line('  Usage: open <project-number>', 'output-warning')]
  }
  const idx = parseInt(args[0]) - 1
  const projects = cachedProjects || await fetchProjects()
  if (idx < 0 || idx >= projects.length) {
    return [line(`  Project #${args[0]} not found. Run 'projects' to see list.`, 'output-error')]
  }
  const p = projects[idx]
  const label = `══ ${p.title} `
  const pad = Math.max(0, BOX_W - label.length)
  const lines = [
    blank(),
    { type: 'text', text: `  ╔${label}${'═'.repeat(pad)}╗`, className: 'output-accent output-border' },
    blank(),
    line(`    ${p.description}`, 'output-text'),
    blank(),
    line(`    Technologies:`, 'output-warning'),
    line(`      ${p.technologies.join(' · ')}`, 'output-text'),
    blank(),
  ]
  if (p.github) lines.push({ type: 'link', text: `    🔗 GitHub: ${p.github}`, url: p.github, className: 'output-link' })
  if (p.deployment) lines.push({ type: 'link', text: `    🌐 Live: ${p.deployment}`, url: p.deployment, className: 'output-link' })
  if (p.linkedin) lines.push({ type: 'link', text: `    💼 LinkedIn: ${p.linkedin}`, url: p.linkedin, className: 'output-link' })
  lines.push(blank())
  lines.push({ type: 'text', text: `  ╚${'═'.repeat(label.length + pad)}╝`, className: 'output-accent output-border' })
  lines.push(blank())
  return lines
}

async function resumeCommand() {
  const content = cachedContent || await fetchContent()
  return [
    blank(),
    boxTop('Resume'),
    blank(),
    line('    📄 Resume / CV', 'output-heading'),
    blank(),
    { type: 'link', text: '    → Download PDF Resume', url: content.resumeUrl, className: 'output-link' },
    { type: 'link', text: '    → View on LinkedIn', url: content.resumeLinkedIn, className: 'output-link' },
    blank(),
    boxBottom(),
    blank(),
  ]
}

async function contactCommand() {
  const content = cachedContent || await fetchContent()
  const c = content.contact
  return [
    blank(),
    boxTop('Contact'),
    blank(),
    line('    📬 Let\'s Connect!', 'output-heading'),
    blank(),
    { type: 'link', text: `    📧 Email: ${c.email}`, url: `mailto:${c.email}`, className: 'output-link' },
    { type: 'link', text: `    🐙 GitHub: ${c.github}`, url: c.github, className: 'output-link' },
    { type: 'link', text: `    💼 LinkedIn: ${c.linkedin}`, url: c.linkedin, className: 'output-link' },
    blank(),
    boxBottom(),
    blank(),
  ]
}

async function coffeeCommand() {
  const content = cachedContent || await fetchContent()
  const url = content.coffeeUrl || 'https://buymeacoffee.com/shaan'
  return [
    blank(),
    line('         ( (', 'output-warning'),
    line('          ) )', 'output-warning'),
    line('       ........', 'output-warning'),
    line('       |      |]', 'output-warning'),
    line('       \\      /', 'output-warning'),
    line('        `----\'', 'output-warning'),
    blank(),
    line('  ☕ Enjoying this portfolio? Buy me a coffee!', 'output-text'),
    blank(),
    { type: 'link', text: `    → ${url}`, url, className: 'output-link' },
    blank(),
    line('  Current status: Caffeinated ✓', 'output-success'),
    blank(),
  ]
}

function neofetchCommand() {
  return [
    { type: 'neofetch' },
  ]
}

function newtermCommand(store) {
  const success = store.addTerminal()
  if (!success) {
    return [line('  Maximum terminals reached.', 'output-warning')]
  }
  return [line('  ⟩ New terminal opened.', 'output-success')]
}

async function sudoCommand(args) {
  const full = args.join(' ').toLowerCase()
  if (!full) {
    return [
      line('  ⚠️  sudo: missing command', 'output-error'),
      line('  Hint: try "sudo hire shaan", "sudo meme", "sudo music", "sudo hobby"', 'output-muted'),
    ]
  }

  // Fetch content from backend
  const content = cachedContent || await fetchContent()

  if (full === 'hire shaan') {
    const msg = content.hireMessage || 'Shaan has been hired! Starting date: Immediately. Salary: Yes, please 🚀'
    return [
      blank(),
      dblBoxTopSuccess(),
      dblBoxRowSuccess('   ✅ DECISION: EXCELLENT'),
      dblBoxRowSuccess(''),
      line(`  ║   ${msg}`, 'output-success'),
      dblBoxRowSuccess(''),
      dblBoxBottomSuccess(),
      blank(),
    ]
  }

  if (full === 'music' || full === 'favourite music' || full === 'play') {
    const musicUrl = content.musicUrl || 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
    return [
      blank(),
      line('  🎵 Opening the vibes...', 'output-success'),
      blank(),
      { type: 'action', action: 'openUrl', url: musicUrl },
      line('  ♪ Now playing your favourite beats...', 'output-muted'),
      blank(),
    ]
  }

  if (full === 'meme' || full === 'favourite meme') {
    const output = [blank()]
    if (content.memeAudioUrl) {
      output.push({ type: 'audio', url: content.memeAudioUrl })
      output.push(line('  🔊 Playing your favourite meme sound...', 'output-success'))
    } else {
      output.push(line('  🤖 "It works on my machine" — Every Developer Ever', 'output-warning'))
    }
    output.push(blank())
    return output
  }

  if (full === 'hobby' || full === 'favourite hobby' || full === 'hobbies') {
    const hobbies = content.hobbies || []
    const output = [
      blank(),
      boxTop('Hobbies & Interests'),
      blank(),
    ]
    hobbies.forEach(h => {
      output.push(line(`    ${h}`, 'output-text'))
    })
    output.push(blank())
    output.push(boxBottom())
    output.push(blank())
    return output
  }

  if (full === 'rm -rf /') {
    const rickrollUrl = content.rickrollUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    return [
      blank(),
      line('  ☠️  Initiating system destruction...', 'output-error'),
      line('  ██████████████████ 100%', 'output-error'),
      line('  ...', 'output-muted'),
      line('  Just kidding! 😏', 'output-success'),
      blank(),
      { type: 'action', action: 'openUrl', url: rickrollUrl },
      line('  🎵 You\'ve been rickrolled!', 'output-warning'),
      blank(),
    ]
  }

  return [
    line('  ⚠️  sudo: command not found', 'output-error'),
    line('  Hint: try "sudo hire shaan", "sudo meme", "sudo music", "sudo hobby"', 'output-muted'),
  ]
}
