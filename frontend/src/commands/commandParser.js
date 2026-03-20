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

const BOX_W = 42 // inner character count between corners

function line(text, className = 'output-text') {
  return { type: 'text', text, className }
}

function blank() {
  return line('')
}

// Emoji-aware display width: emojis render as 2 chars in monospace
const emojiRx = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
function displayWidth(str) {
  let w = 0
  for (const ch of str) {
    w += emojiRx.test(ch) ? 2 : 1
    emojiRx.lastIndex = 0 // reset regex state
  }
  return w
}
function pad(content, width = BOX_W, ch = ' ') {
  return content + ch.repeat(Math.max(0, width - displayWidth(content)))
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
function dblBoxRow(content, p = ' ') {
  return { type: 'text', text: `  ║${pad(content)}║`, className: 'output-accent output-border' }
}
function divider(title, cls = 'output-muted output-border') {
  const label = `─── ${title} `
  return { type: 'text', text: `  ${label}${'─'.repeat(BOX_W - label.length + 2)}`, className: cls }
}
function boxRow(content, cls = 'output-text') {
  return line(`  │${pad(content)}│`, `${cls} output-border`)
}
function boxLink(content, url) {
  return { type: 'link', text: `  │${pad(content)}│`, url, className: 'output-link output-border' }
}
function roundBoxTop(title) {
  const label = `─── ${title} `
  return { type: 'text', text: `  ╭${label}${'─'.repeat(BOX_W - label.length)}╮`, className: 'output-muted output-border' }
}
function roundBoxBottom() {
  return { type: 'text', text: `  ╰${'─'.repeat(BOX_W)}╯`, className: 'output-muted output-border' }
}
function roundBoxRow(content) {
  return line(`  │${pad(content)}│`, 'output-muted')
}
function dblBoxTopSuccess() {
  return { type: 'text', text: `  ╔${'═'.repeat(BOX_W)}╗`, className: 'output-success output-border' }
}
function dblBoxBottomSuccess() {
  return { type: 'text', text: `  ╚${'═'.repeat(BOX_W)}╝`, className: 'output-success output-border' }
}
function dblBoxRowSuccess(content, p = ' ') {
  return { type: 'text', text: `  ║${pad(content)}║`, className: 'output-success output-border' }
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
    boxRow(' about      → Who is Shaan?'),
    boxRow(' skills     → Tech stack & expertise'),
    boxRow(' projects   → Browse portfolio projects'),
    boxRow(' open <id>  → View project details'),
    boxRow(' resume     → Open resume / CV'),
    boxRow(' contact    → Get in touch'),
    boxRow(' coffee     -> Buy me a coffee'),
    boxRow(' neofetch   → System information'),
    boxRow(' matrix     → Toggle matrix rain'),
    boxRow(' newterm    → New terminal (Alt+Enter)'),
    boxRow(' exit       → Close terminal (Alt+Q)'),
    boxRow(' clear      → Clear terminal'),
    boxRow(' sudo <cmd> → Try your luck...', 'output-muted'),
    boxBottom(),
    blank(),
    divider('Keybindings'),
    boxRow(' Alt+Enter → New terminal', 'output-muted'),
    boxRow(' Alt+Q     → Close terminal', 'output-muted'),
    boxRow(' Alt+W/A/S/D → Navigate', 'output-muted'),
    boxBottom(),
    blank(),
  ]
}

async function aboutCommand() {
  const content = cachedContent || await fetchContent()
  const a = content.about
  const chunkW = BOX_W - 6 // account for side padding + emoji widths
  const taglineLines = a.tagline.match(new RegExp(`.{1,${chunkW}}(\s|$)`, 'g')) || [a.tagline]
  return [
    blank(),
    boxTop('About Me'),
    boxRow(''),
    boxRow(`  > Hey, I'm ${a.name}`, 'output-heading'),
    boxRow(''),
    ...taglineLines.map(s => boxRow(`  ${s.trim()}`)),
    boxRow(''),
    boxRow(`  * Education: ${a.education}`),
    boxRow(`  * Location: ${a.location}`),
    boxRow(`  * Focus: ${a.focus}`),
    boxRow(''),
    boxBottom(),
    blank(),
  ]
}

async function skillsCommand() {
  const content = cachedContent || await fetchContent()
  const lines = [
    blank(),
    boxTop('Skills & Technologies'),
    boxRow(''),
  ]

  content.skills.forEach(skill => {
    lines.push(boxRow(`  ▸ ${skill.category}`, 'output-warning'))
    // Wrap long skill items to fit in box
    const maxW = BOX_W - 6
    const chunks = skill.items.match(new RegExp(`.{1,${maxW}}(\\s|$)`, 'g')) || [skill.items]
    chunks.forEach(c => lines.push(boxRow(`    ${c.trim()}`)))
    lines.push(boxRow(''))
  })

  lines.push(boxBottom())
  lines.push(blank())
  return lines
}

async function projectsCommand() {
  const projects = await fetchProjects()
  const maxDescW = BOX_W - 8
  const lines = [
    blank(),
    boxTop('Projects'),
    boxRow(''),
  ]

  projects.forEach((p, i) => {
    lines.push(boxRow(`  [${i + 1}] ${p.title}`, 'output-heading'))
    const desc = p.description.length > maxDescW ? p.description.slice(0, maxDescW - 3) + '...' : p.description
    lines.push(boxRow(`      ${desc}`))
    const techStr = `Tech: ${p.technologies.join(', ')}`
    const techChunks = techStr.match(new RegExp(`.{1,${BOX_W - 8}}(\\s|$)`, 'g')) || [techStr]
    techChunks.forEach(c => lines.push(boxRow(`      ${c.trim()}`, 'output-muted')))
    if (p.github) lines.push(boxLink(`      GitHub`, p.github))
    if (p.deployment) lines.push(boxLink(`      Live`, p.deployment))
    if (p.linkedin) lines.push(boxLink(`      LinkedIn`, p.linkedin))
    lines.push(boxRow(''))
  })

  lines.push(boxBottom())
  lines.push(blank())
  lines.push(roundBoxTop('How to explore'))
  lines.push(roundBoxRow('  Type  open <number>  to view'))
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
    return [line(`  Project #${args[0]} not found.`, 'output-error')]
  }
  const p = projects[idx]
  const label = `══ ${p.title} `
  const padLen = Math.max(0, BOX_W - label.length)
  const maxW = BOX_W - 4
  const descChunks = p.description.match(new RegExp(`.{1,${maxW}}(\s|$)`, 'g')) || [p.description]
  const techStr = p.technologies.join(' · ')
  const techChunks = techStr.match(new RegExp(`.{1,${maxW}}(\s|$)`, 'g')) || [techStr]
  const lines = [
    blank(),
    { type: 'text', text: `  ╔${label}${'═'.repeat(padLen)}╗`, className: 'output-accent output-border' },
    dblBoxRow(''),
    ...descChunks.map(c => dblBoxRow(`  ${c.trim()}`)),
    dblBoxRow(''),
    dblBoxRow('  Technologies:', ' '),
    ...techChunks.map(c => dblBoxRow(`    ${c.trim()}`)),
    dblBoxRow(''),
  ]
  if (p.github) lines.push(dblBoxRow(`  >> GitHub`))
  if (p.deployment) lines.push(dblBoxRow(`  >> Live`))
  if (p.linkedin) lines.push(dblBoxRow(`  >> LinkedIn`))
  if (p.github || p.deployment || p.linkedin) lines.push(dblBoxRow(''))
  lines.push(dblBoxBottom())
  lines.push(blank())
  return lines
}

async function resumeCommand() {
  const content = cachedContent || await fetchContent()
  return [
    blank(),
    boxTop('Resume'),
    boxRow(''),
    boxRow('  > Resume / CV', 'output-heading'),
    boxRow(''),
    boxLink('  -> Download PDF Resume', content.resumeUrl),
    boxLink('  -> View on LinkedIn', content.resumeLinkedIn),
    boxRow(''),
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
    boxRow(''),
    boxRow('  > Let\'s Connect!', 'output-heading'),
    boxRow(''),
    boxLink(`  @ ${c.email}`, `mailto:${c.email}`),
    boxLink(`  > GitHub`, c.github),
    boxLink(`  > LinkedIn`, c.linkedin),
    boxRow(''),
    boxBottom(),
    blank(),
  ]
}

async function coffeeCommand() {
  const content = cachedContent || await fetchContent()
  const url = content.coffeeUrl || 'https://buymeacoffee.com/shaan'
  return [
    blank(),
    boxTop('Buy Me a Coffee'),
    boxRow(''),
    boxRow('         ( (', 'output-warning'),
    boxRow('          ) )', 'output-warning'),
    boxRow('       ........', 'output-warning'),
    boxRow('       |      |]', 'output-warning'),
    boxRow('       \\      /', 'output-warning'),
    boxRow('        `----\'', 'output-warning'),
    boxRow(''),
    boxRow(' Enjoying this portfolio?', 'output-text'),
    boxRow(' Buy me a coffee!', 'output-text'),
    boxRow(''),
    boxLink(`  -> ${url}`, url),
    boxRow(''),
    boxRow(' Status: Caffeinated [ok]', 'output-success'),
    boxRow(''),
    boxBottom(),
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
      line('  [!] sudo: missing command', 'output-error'),
      line('  Hint: try "sudo hire shaan", "sudo meme", "sudo music", "sudo hobby"', 'output-muted'),
    ]
  }

  // Fetch content from backend
  const content = cachedContent || await fetchContent()

  if (full === 'hire shaan') {
    const msg = content.hireMessage || 'Hired! Start: Now. Salary: Yes please!'
    const msgW = BOX_W - 6
    const msgChunks = msg.match(new RegExp(`.{1,${msgW}}(\\s|$)`, 'g')) || [msg]
    return [
      blank(),
      dblBoxTopSuccess(),
      dblBoxRowSuccess('   [OK] DECISION: EXCELLENT'),
      dblBoxRowSuccess(''),
      ...msgChunks.map(c => dblBoxRowSuccess(`   ${c.trim()}`)),
      dblBoxRowSuccess(''),
      dblBoxBottomSuccess(),
      blank(),
    ]
  }

  if (full === 'music' || full === 'favourite music' || full === 'play') {
    const musicUrl = content.musicUrl || 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
    return [
      blank(),
      line('  [~] Opening the vibes...', 'output-success'),
      blank(),
      { type: 'action', action: 'openUrl', url: musicUrl },
      line('  ~ Now playing your favourite beats...', 'output-muted'),
      blank(),
    ]
  }

  if (full === 'meme' || full === 'favourite meme') {
    const output = [blank()]
    if (content.memeAudioUrl) {
      output.push({ type: 'audio', url: content.memeAudioUrl })
      output.push(line('  [>>] Playing your favourite meme sound...', 'output-success'))
    } else {
      output.push(line('  [>] "It works on my machine" -- Every Dev Ever', 'output-warning'))
    }
    output.push(blank())
    return output
  }

  if (full === 'hobby' || full === 'favourite hobby' || full === 'hobbies') {
    const hobbies = content.hobbies || []
    const output = [
      blank(),
      boxTop('Hobbies & Interests'),
      boxRow(''),
    ]
    hobbies.forEach(h => {
      output.push(boxRow(`  ${h}`))
    })
    output.push(boxRow(''))
    output.push(boxBottom())
    output.push(blank())
    return output
  }

  if (full === 'rm -rf /') {
    const rickrollUrl = content.rickrollUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    return [
      blank(),
      line('  [X] Initiating system destruction...', 'output-error'),
      line('  ██████████████████ 100%', 'output-error'),
      line('  ...', 'output-muted'),
      line('  Just kidding! ;)', 'output-success'),
      blank(),
      { type: 'action', action: 'openUrl', url: rickrollUrl },
      line('  [~] You\'ve been rickrolled!', 'output-warning'),
      blank(),
    ]
  }

  return [
    line('  [!] sudo: command not found', 'output-error'),
    line('  Hint: try "sudo hire shaan", "sudo meme", "sudo music", "sudo hobby"', 'output-muted'),
  ]
}
