import axios from 'axios'
import fallbackProjects from './fallbackProjects'
import config from '../config'

let cachedProjects = null

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

function makeLink(url, label) {
  return { type: 'link', url, label }
}

function line(text, className = 'output-text') {
  return { type: 'text', text, className }
}

function blank() {
  return line('')
}

export async function executeCommand(cmd, store, termId) {
  const input = cmd.trim()
  if (!input) return []

  const [command, ...args] = input.split(/\s+/)
  const lower = command.toLowerCase()

  switch (lower) {
    case 'help':
      return helpCommand()
    case 'about':
      return aboutCommand()
    case 'skills':
      return skillsCommand()
    case 'projects':
      return await projectsCommand()
    case 'resume':
      return resumeCommand()
    case 'contact':
      return contactCommand()
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
      return sudoCommand(args)
    case 'matrix':
      store.toggleMatrix()
      return [line('  ⟩ Matrix mode toggled.', 'output-success')]
    case 'coffee':
      return coffeeCommand()
    case 'hyprland':
      return hyprlandCommand()
    default:
      return [
        line(`  zsh: command not found: ${command}`, 'output-error'),
        line(`  Type 'help' to see available commands.`, 'output-muted'),
      ]
  }
}

function helpCommand() {
  return [
    blank(),
    line('  ╔══════════════════════════════════════════╗', 'output-accent'),
    line('  ║          AVAILABLE COMMANDS               ║', 'output-accent'),
    line('  ╚══════════════════════════════════════════╝', 'output-accent'),
    blank(),
    line('  about       → Who is Shaan?', 'output-text'),
    line('  skills      → Tech stack & expertise', 'output-text'),
    line('  projects    → Browse portfolio projects', 'output-text'),
    line('  open <id>   → View project details', 'output-text'),
    line('  resume      → Open resume / CV', 'output-text'),
    line('  contact     → Get in touch', 'output-text'),
    line('  neofetch    → System information', 'output-text'),
    line('  newterm     → Open new terminal (Alt+Enter)', 'output-text'),
    line('  exit        → Close this terminal (Alt+Q)', 'output-text'),
    line('  clear       → Clear terminal', 'output-text'),
    line('  matrix      → Toggle matrix rain effect', 'output-text'),
    line('  coffee      → ☕ A developer essential', 'output-text'),
    line('  hyprland    → About this desktop environment', 'output-text'),
    line('  sudo <cmd>  → Try your luck...', 'output-muted'),
    blank(),
    line('  ─── Keybindings ───', 'output-muted'),
    line('  Alt+Enter → New terminal    Alt+Q → Close', 'output-muted'),
    line('  Alt+H/J/K/L → Navigate terminals', 'output-muted'),
    blank(),
  ]
}

function aboutCommand() {
  return [
    blank(),
    line('  ┌─── About Me ───────────────────────────┐', 'output-accent'),
    blank(),
    line('    👋 Hey, I\'m Shaan Shoukath', 'output-heading'),
    blank(),
    line('    Full-stack developer & tech enthusiast passionate', 'output-text'),
    line('    about building innovative solutions that make', 'output-text'),
    line('    a real-world impact.', 'output-text'),
    blank(),
    line('    🎓 Education: Computer Science & Engineering', 'output-text'),
    line('    📍 Location: India', 'output-text'),
    line('    🔭 Focus: AI/ML, Robotics, Web Development', 'output-text'),
    blank(),
    line('    I love exploring the intersection of hardware', 'output-text'),
    line('    and software — from autonomous drones to', 'output-text'),
    line('    interactive web experiences like this one.', 'output-text'),
    blank(),
    line('  └─────────────────────────────────────────┘', 'output-accent'),
    blank(),
  ]
}

function skillsCommand() {
  return [
    blank(),
    line('  ┌─── Skills & Technologies ─────────────────┐', 'output-accent'),
    blank(),
    line('    ▸ Languages', 'output-warning'),
    line('      Python · JavaScript · TypeScript · C++ · Rust', 'output-text'),
    blank(),
    line('    ▸ Frontend', 'output-warning'),
    line('      React · Next.js · TailwindCSS · Framer Motion', 'output-text'),
    blank(),
    line('    ▸ Backend', 'output-warning'),
    line('      Node.js · Express · FastAPI · Django', 'output-text'),
    blank(),
    line('    ▸ Database', 'output-warning'),
    line('      MongoDB · PostgreSQL · Redis · Firebase', 'output-text'),
    blank(),
    line('    ▸ DevOps & Tools', 'output-warning'),
    line('      Docker · Git · Linux · Nginx · CI/CD', 'output-text'),
    blank(),
    line('    ▸ AI / ML / Robotics', 'output-warning'),
    line('      TensorFlow · PyTorch · OpenCV · ROS2', 'output-text'),
    blank(),
    line('  └────────────────────────────────────────────┘', 'output-accent'),
    blank(),
  ]
}

async function projectsCommand() {
  const projects = await fetchProjects()
  const lines = [
    blank(),
    line('  ┌─── Projects ─────────────────────────────┐', 'output-accent'),
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

  lines.push(line(`  ─── Type 'open <number>' for details ───`, 'output-muted'))
  lines.push(line('  └────────────────────────────────────────┘', 'output-accent'))
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
  const lines = [
    blank(),
    line(`  ╔══ ${p.title} ══╗`, 'output-accent'),
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
  lines.push(line(`  ╚${'═'.repeat(p.title.length + 6)}╝`, 'output-accent'))
  lines.push(blank())
  return lines
}

function resumeCommand() {
  return [
    blank(),
    line('  ┌─── Resume ──────────────────────────────┐', 'output-accent'),
    blank(),
    line('    📄 Resume / CV', 'output-heading'),
    blank(),
    { type: 'link', text: '    → Download PDF Resume', url: '/resume.pdf', className: 'output-link' },
    { type: 'link', text: '    → View on LinkedIn', url: 'https://linkedin.com/in/shaan-shoukath', className: 'output-link' },
    blank(),
    line('  └──────────────────────────────────────────┘', 'output-accent'),
    blank(),
  ]
}

function contactCommand() {
  return [
    blank(),
    line('  ┌─── Contact ─────────────────────────────┐', 'output-accent'),
    blank(),
    line('    📬 Let\'s Connect!', 'output-heading'),
    blank(),
    { type: 'link', text: '    📧 Email: shaan@example.com', url: 'mailto:shaan@example.com', className: 'output-link' },
    { type: 'link', text: '    🐙 GitHub: github.com/shaan-shoukath', url: 'https://github.com/shaan-shoukath', className: 'output-link' },
    { type: 'link', text: '    💼 LinkedIn: linkedin.com/in/shaan-shoukath', url: 'https://linkedin.com/in/shaan-shoukath', className: 'output-link' },
    blank(),
    line('  └──────────────────────────────────────────┘', 'output-accent'),
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

function sudoCommand(args) {
  const full = args.join(' ').toLowerCase()
  if (full === 'hire shaan') {
    return [
      blank(),
      line('  ╔═══════════════════════════════════════════╗', 'output-success'),
      line('  ║                                           ║', 'output-success'),
      line('  ║   ✅ DECISION: EXCELLENT                  ║', 'output-success'),
      line('  ║                                           ║', 'output-success'),
      line('  ║   Shaan has been hired!                   ║', 'output-success'),
      line('  ║   Starting date: Immediately              ║', 'output-success'),
      line('  ║   Salary: Yes, please 🚀                  ║', 'output-success'),
      line('  ║                                           ║', 'output-success'),
      line('  ╚═══════════════════════════════════════════╝', 'output-success'),
      blank(),
    ]
  }
  if (full === 'rm -rf /') {
    return [
      line('  ☠️  Nice try! This portfolio is indestructible.', 'output-error'),
      line('  (But I appreciate the Linux spirit)', 'output-muted'),
    ]
  }
  return [
    line('  ⚠️  sudo: permission denied', 'output-error'),
    line('  Hint: try "sudo hire shaan"', 'output-muted'),
  ]
}

function coffeeCommand() {
  return [
    blank(),
    line('         ( (', 'output-warning'),
    line('          ) )', 'output-warning'),
    line('       ........', 'output-warning'),
    line('       |      |]', 'output-warning'),
    line('       \\      /', 'output-warning'),
    line('        `----\'', 'output-warning'),
    blank(),
    line('  ☕ Coffee is the fuel of great code.', 'output-text'),
    line('  Current status: Caffeinated ✓', 'output-success'),
    blank(),
  ]
}

function hyprlandCommand() {
  return [
    blank(),
    line('  ┌─── Hyprland Terminal Desktop ────────────┐', 'output-accent'),
    blank(),
    line('    This portfolio simulates Hyprland, a dynamic', 'output-text'),
    line('    tiling Wayland compositor for Linux.', 'output-text'),
    blank(),
    line('    ▸ Window Manager: Hyprland-style tiling', 'output-warning'),
    line('    ▸ Terminal: Alacritty-inspired glassmorphism', 'output-warning'),
    line('    ▸ Max Windows: 4 (desktop) / 1 (mobile)', 'output-warning'),
    line('    ▸ Animations: Framer Motion layout transitions', 'output-warning'),
    blank(),
    line('    Keybindings:', 'output-heading'),
    line('    Alt+Enter  → New terminal', 'output-text'),
    line('    Alt+Q      → Close terminal', 'output-text'),
    line('    Alt+H/J/K/L → Navigate focus', 'output-text'),
    blank(),
    line('  └────────────────────────────────────────────┘', 'output-accent'),
    blank(),
  ]
}
