import axios from "axios";
import fallbackProjects from "./fallbackProjects";
import config from "../config";

let cachedProjects = null;
let cachedContent = null;

// ── Data fetchers ──────────────────────────────────────────────

async function fetchProjects() {
  try {
    const res = await axios.get(`${config.apiUrl}/api/projects`);
    cachedProjects = res.data;
    return cachedProjects;
  } catch {
    cachedProjects = fallbackProjects;
    return cachedProjects;
  }
}

async function fetchContent() {
  try {
    const res = await axios.get(`${config.apiUrl}/api/content`);
    cachedContent = res.data;
    return cachedContent;
  } catch {
    // Return defaults when backend is offline
    cachedContent = {
      about: {
        name: "Shaan Shoukath",
        tagline:
          "Full-stack developer & tech enthusiast passionate about building innovative solutions that make a real-world impact.",
        education: "Computer Science & Engineering",
        location: "India",
        focus: "AI/ML, Robotics, Web Development",
      },
      skills: [
        {
          category: "Languages",
          items: "Python · JavaScript · TypeScript · C++ · Rust",
        },
        {
          category: "Frontend",
          items: "React · Next.js · TailwindCSS · Framer Motion",
        },
        { category: "Backend", items: "Node.js · Express · FastAPI · Django" },
        {
          category: "Database",
          items: "MongoDB · PostgreSQL · Redis · Firebase",
        },
        {
          category: "DevOps & Tools",
          items: "Docker · Git · Linux · Nginx · CI/CD",
        },
        {
          category: "AI / ML / Robotics",
          items: "TensorFlow · PyTorch · OpenCV · ROS2",
        },
      ],
      contact: {
        email: "shaan@example.com",
        github: "https://github.com/shaan-shoukath",
        linkedin: "https://linkedin.com/in/shaan-shoukath",
      },
      coffeeUrl: "https://buymeacoffee.com/shaan",
      resumeUrl: "/resume.pdf",
      resumeLinkedIn: "https://linkedin.com/in/shaan-shoukath",
    };
    return cachedContent;
  }
}

// ── Helpers ─────────────────────────────────────────────────────

const BOX_W = 42; // default inner character count between corners
const MIN_BOX_W = 22;
const MAX_BOX_W = 72;
export const BOX_INNER_PADDING = 1;

function line(text, className = "output-text") {
  return { type: "text", text, className };
}

function blank() {
  return line("");
}

// Emoji-aware display width: emojis render as 2 chars in monospace
const emojiRx = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
export function displayWidth(str) {
  let w = 0;
  for (const ch of str) {
    w += emojiRx.test(ch) ? 2 : 1;
    emojiRx.lastIndex = 0; // reset regex state
  }
  return w;
}

export function getBoxWidth(maxColumns) {
  if (!Number.isFinite(maxColumns)) return BOX_W;
  return Math.max(MIN_BOX_W, Math.min(MAX_BOX_W, Math.floor(maxColumns) - 8));
}

export function getBoxContentWidth(width = BOX_W) {
  return Math.max(1, width - BOX_INNER_PADDING * 2);
}

export function pad(content, width = BOX_W, ch = " ") {
  return content + ch.repeat(Math.max(0, width - displayWidth(content)));
}

function truncateToWidth(text, maxWidth) {
  if (displayWidth(text) <= maxWidth) return text;
  const ellipsis = "...";
  let truncated = "";
  for (const ch of text) {
    if (displayWidth(truncated + ch + ellipsis) > maxWidth) break;
    truncated += ch;
  }
  return `${truncated}${ellipsis}`;
}

function takeWrappedChunk(text, maxWidth) {
  let chunk = "";
  let consumedIndex = 0;
  let lastBreakChunk = "";
  let lastBreakIndex = -1;

  for (let i = 0; i < text.length; ) {
    const codePoint = text.codePointAt(i);
    const ch = String.fromCodePoint(codePoint);
    const nextIndex = i + ch.length;

    if (displayWidth(chunk + ch) > maxWidth) break;

    chunk += ch;
    consumedIndex = nextIndex;

    if (/\s/.test(ch)) {
      lastBreakChunk = chunk.trimEnd();
      lastBreakIndex = nextIndex;
    }

    i = nextIndex;
  }

  if (!chunk) {
    const firstCodePoint = text.codePointAt(0);
    const firstChar = String.fromCodePoint(firstCodePoint);
    return {
      chunk: firstChar,
      rest: text.slice(firstChar.length).trimStart(),
    };
  }

  if (consumedIndex < text.length && lastBreakIndex > -1) {
    return {
      chunk: lastBreakChunk,
      rest: text.slice(lastBreakIndex).trimStart(),
    };
  }

  return {
    chunk: chunk.trimEnd(),
    rest: text.slice(consumedIndex).trimStart(),
  };
}

export function wrapContentLines(
  text,
  width,
  prefix = "",
  nextPrefix = prefix,
) {
  const lines = [];
  let remaining = text.trim();
  let currentPrefix = prefix;

  while (remaining) {
    const availableWidth = Math.max(1, width - displayWidth(currentPrefix));
    const { chunk, rest } = takeWrappedChunk(remaining, availableWidth);
    lines.push(`${currentPrefix}${chunk}`);
    remaining = rest;
    currentPrefix = nextPrefix;
  }

  return lines.length > 0 ? lines : [prefix];
}

function wrapListItems(
  items,
  width,
  prefix = "",
  nextPrefix = prefix,
  separator = ", ",
) {
  const cleanItems = items.map((item) => String(item).trim()).filter(Boolean);
  if (cleanItems.length === 0) return [prefix];

  const lines = [];
  let currentPrefix = prefix;
  let currentLine = "";

  const pushCurrentLine = () => {
    if (!currentLine) return;
    lines.push(`${currentPrefix}${currentLine}`);
    currentPrefix = nextPrefix;
    currentLine = "";
  };

  cleanItems.forEach((item, index) => {
    const suffix = index < cleanItems.length - 1 ? separator : "";
    const segment = `${item}${suffix}`;
    const availableWidth = Math.max(1, width - displayWidth(currentPrefix));
    const candidate = currentLine ? `${currentLine} ${segment}` : segment;

    if (displayWidth(candidate) <= availableWidth) {
      currentLine = candidate;
      return;
    }

    pushCurrentLine();

    const nextAvailableWidth = Math.max(1, width - displayWidth(currentPrefix));
    if (displayWidth(segment) <= nextAvailableWidth) {
      currentLine = segment;
      return;
    }

    const wrappedSegmentLines = wrapContentLines(
      segment,
      width,
      currentPrefix,
      nextPrefix,
    );
    lines.push(...wrappedSegmentLines);
    currentPrefix = nextPrefix;
  });

  pushCurrentLine();
  return lines.length > 0 ? lines : [prefix];
}

// ── Box drawing generators (guarantees matched top/bottom) ──────

function boxTop(title, width = BOX_W) {
  const label = `─── ${title} `;
  return {
    type: "text",
    text: `  ┌${label}${"─".repeat(Math.max(0, width - displayWidth(label)))}┐`,
    className: "output-accent output-border",
  };
}
function boxBottom(width = BOX_W) {
  return {
    type: "text",
    text: `  └${"─".repeat(width)}┘`,
    className: "output-accent output-border",
  };
}
function dblBoxTop(width = BOX_W) {
  return {
    type: "text",
    text: `  ╔${"═".repeat(width)}╗`,
    className: "output-accent output-border",
  };
}
function dblBoxBottom(width = BOX_W) {
  return {
    type: "text",
    text: `  ╚${"═".repeat(width)}╝`,
    className: "output-accent output-border",
  };
}
function dblBoxRow(content, p = " ", width = BOX_W) {
  return {
    type: "text",
    text: `  ║${pad(content, width)}║`,
    className: "output-accent output-border",
  };
}
function divider(title, cls = "output-muted output-border", width = BOX_W) {
  const label = `─── ${title} `;
  return {
    type: "text",
    text: `  ${label}${"─".repeat(Math.max(0, width - displayWidth(label) + 2))}`,
    className: cls,
  };
}
function boxRow(content, cls = "output-text", width = BOX_W) {
  return line(`  │${pad(content, width)}│`, `${cls} output-border`);
}
function boxLink(content, url, width = BOX_W) {
  return {
    type: "link",
    text: `  │${pad(content, width)}│`,
    url,
    className: "output-link output-border",
  };
}
function roundBoxTop(title, width = BOX_W) {
  const label = `─── ${title} `;
  return {
    type: "text",
    text: `  ╭${label}${"─".repeat(Math.max(0, width - displayWidth(label)))}╮`,
    className: "output-muted output-border",
  };
}
function roundBoxBottom(width = BOX_W) {
  return {
    type: "text",
    text: `  ╰${"─".repeat(width)}╯`,
    className: "output-muted output-border",
  };
}
function roundBoxRow(content, width = BOX_W) {
  return line(`  │${pad(content, width)}│`, "output-muted output-border");
}
function dblBoxTopSuccess(width = BOX_W) {
  return {
    type: "text",
    text: `  ╔${"═".repeat(width)}╗`,
    className: "output-success output-border",
  };
}
function dblBoxBottomSuccess(width = BOX_W) {
  return {
    type: "text",
    text: `  ╚${"═".repeat(width)}╝`,
    className: "output-success output-border",
  };
}
function dblBoxRowSuccess(content, p = " ", width = BOX_W) {
  return {
    type: "text",
    text: `  ║${pad(content, width)}║`,
    className: "output-success output-border",
  };
}

// ── Command dispatcher ─────────────────────────────────────────

export async function executeCommand(cmd, store, termId, options = {}) {
  const input = cmd.trim();
  if (!input) return [];

  const [command, ...args] = input.split(/\s+/);
  const lower = command.toLowerCase();

  switch (lower) {
    case "help":
      return helpCommand();
    case "about":
      return await aboutCommand(options);
    case "skills":
      return await skillsCommand(options);
    case "projects":
      return await projectsCommand(options);
    case "resume":
      return await resumeCommand();
    case "contact":
      return await contactCommand();
    case "clear":
      store.clearTerminal(termId);
      return [];
    case "neofetch":
      return neofetchCommand();
    case "newterm":
      return newtermCommand(store);
    case "exit":
      store.removeTerminal(termId);
      return [];
    case "open":
      return await openCommand(args, options);
    case "sudo":
      return await sudoCommand(args);
    case "matrix":
      store.toggleMatrix();
      return [line("  ⟩ Matrix mode toggled.", "output-success")];
    case "coffee":
      return await coffeeCommand();
    default:
      return [
        line(`  zsh: command not found: ${command}`, "output-error"),
        line(`  Type 'help' to see available commands.`, "output-muted"),
      ];
  }
}

// ── Commands ────────────────────────────────────────────────────

function helpCommand() {
  return [
    blank(),
    dblBoxTop(),
    dblBoxRow("          AVAILABLE COMMANDS"),
    dblBoxBottom(),
    blank(),
    boxRow(" about      → Who is Shaan?"),
    boxRow(" skills     → Tech stack & expertise"),
    boxRow(" projects   → Browse portfolio projects"),
    boxRow(" open <id>  → View project details"),
    boxRow(" resume     → Open resume / CV"),
    boxRow(" contact    → Get in touch"),
    boxRow(" coffee     -> Buy me a coffee"),
    boxRow(" neofetch   → System information"),
    boxRow(" matrix     → Toggle matrix rain"),
    boxRow(" newterm    → New terminal (Alt+Enter)"),
    boxRow(" exit       → Close terminal (Alt+Q)"),
    boxRow(" clear      → Clear terminal"),
    boxRow(" sudo <cmd> → Try your luck...", "output-muted"),
    boxBottom(),
    blank(),
    divider("Keybindings"),
    boxRow(" Alt+Enter → New terminal", "output-muted"),
    boxRow(" Alt+Q     → Close terminal", "output-muted"),
    boxRow(" Alt+W/A/S/D → Navigate", "output-muted"),
    boxBottom(),
    blank(),
  ];
}

async function aboutCommand(options = {}) {
  const content = cachedContent || (await fetchContent());
  const a = content.about;
  const boxW = getBoxWidth(options.maxColumns);
  const boxContentW = getBoxContentWidth(boxW);
  const taglineLines = wrapContentLines(a.tagline, boxContentW, "  ", "  ");
  return [
    blank(),
    boxTop("About Me", boxW),
    boxRow("", "output-text", boxW),
    boxRow(`  > Hey, I'm ${a.name}`, "output-heading", boxW),
    boxRow("", "output-text", boxW),
    ...taglineLines.map((taglineLine) =>
      boxRow(taglineLine, "output-text", boxW),
    ),
    boxRow("", "output-text", boxW),
    boxRow(`  * Education: ${a.education}`, "output-text", boxW),
    boxRow(`  * Location: ${a.location}`, "output-text", boxW),
    boxRow(`  * Focus: ${a.focus}`, "output-text", boxW),
    boxRow("", "output-text", boxW),
    boxBottom(boxW),
    blank(),
  ];
}

async function skillsCommand(options = {}) {
  const content = cachedContent || (await fetchContent());
  const boxW = getBoxWidth(options.maxColumns);
  const boxContentW = getBoxContentWidth(boxW);
  const lines = [
    blank(),
    boxTop("Skills & Technologies", boxW),
    boxRow("", "output-text", boxW),
  ];

  content.skills.forEach((skill) => {
    lines.push(boxRow(`  ▸ ${skill.category}`, "output-warning"));
    wrapContentLines(skill.items, boxContentW, "    ", "    ").forEach(
      (chunk) => lines.push(boxRow(chunk, "output-text", boxW)),
    );
    lines.push(boxRow("", "output-text", boxW));
  });

  lines.push(boxBottom(boxW));
  lines.push(blank());
  return lines;
}

async function projectsCommand(options = {}) {
  const projects = await fetchProjects();
  const boxW = getBoxWidth(options.maxColumns);
  const boxContentW = getBoxContentWidth(boxW);
  const lines = [
    blank(),
    boxTop("Projects", boxW),
    boxRow("", "output-text", boxW),
  ];

  projects.forEach((p, i) => {
    const titlePrefix = `  [${i + 1}] `;
    const titleLines = wrapContentLines(
      p.title,
      boxContentW,
      titlePrefix,
      " ".repeat(displayWidth(titlePrefix)),
    );
    titleLines.forEach((titleLine) =>
      lines.push(boxRow(titleLine, "output-heading", boxW)),
    );

    const techPrefix = "      Tech: ";
    const techLines = wrapListItems(
      p.technologies,
      boxContentW,
      techPrefix,
      " ".repeat(displayWidth(techPrefix)),
      ", ",
    );
    techLines.forEach((techLine) =>
      lines.push(boxRow(techLine, "output-muted", boxW)),
    );
    lines.push(boxRow("", "output-text", boxW));
  });

  lines.push(boxBottom(boxW));
  lines.push(blank());
  lines.push(line("  Use open <id> to know more.", "output-muted"));
  lines.push(blank());

  return lines;
}

async function openCommand(args, options = {}) {
  if (!args[0]) {
    return [line("  Usage: open <project-number>", "output-warning")];
  }
  const idx = parseInt(args[0]) - 1;
  const projects = cachedProjects || (await fetchProjects());
  if (idx < 0 || idx >= projects.length) {
    return [line(`  Project #${args[0]} not found.`, "output-error")];
  }
  const p = projects[idx];
  const boxW = getBoxWidth(options.maxColumns);
  const boxContentW = getBoxContentWidth(boxW);
  const descLines = wrapContentLines(p.description, boxContentW, "  ", "  ");
  const techLines = wrapListItems(
    p.technologies,
    boxContentW,
    "    ",
    "    ",
    " · ",
  );
  const lines = [
    blank(),
    dblBoxTop(boxW),
    ...wrapContentLines(p.title, boxContentW, "  ", "  ").map((titleLine) =>
      dblBoxRow(titleLine, " ", boxW),
    ),
    dblBoxRow("", " ", boxW),
    ...descLines.map((descLine) => dblBoxRow(descLine, " ", boxW)),
    dblBoxRow("", " ", boxW),
    dblBoxRow("  Technologies:", " ", boxW),
    ...techLines.map((techLine) => dblBoxRow(techLine, " ", boxW)),
    dblBoxRow("", " ", boxW),
  ];
  if (p.github) lines.push(dblBoxRow("  >> GitHub", " ", boxW));
  if (p.deployment) lines.push(dblBoxRow("  >> Live", " ", boxW));
  if (p.linkedin) lines.push(dblBoxRow("  >> LinkedIn", " ", boxW));
  if (p.github || p.deployment || p.linkedin)
    lines.push(dblBoxRow("", " ", boxW));
  lines.push(dblBoxBottom(boxW));
  lines.push(blank());
  return lines;
}

async function resumeCommand() {
  const content = cachedContent || (await fetchContent());
  return [
    blank(),
    boxTop("Resume"),
    boxRow(""),
    boxRow("  > Resume / CV", "output-heading"),
    boxRow(""),
    boxLink("  -> Download PDF Resume", content.resumeUrl),
    boxLink("  -> View on LinkedIn", content.resumeLinkedIn),
    boxRow(""),
    boxBottom(),
    blank(),
  ];
}

async function contactCommand() {
  const content = cachedContent || (await fetchContent());
  const c = content.contact;
  return [
    blank(),
    boxTop("Contact"),
    boxRow(""),
    boxRow("  > Let's Connect!", "output-heading"),
    boxRow(""),
    boxLink(`  @ ${c.email}`, `mailto:${c.email}`),
    boxLink(`  > GitHub`, c.github),
    boxLink(`  > LinkedIn`, c.linkedin),
    boxRow(""),
    boxBottom(),
    blank(),
  ];
}

async function coffeeCommand() {
  const content = cachedContent || (await fetchContent());
  const url = content.coffeeUrl || "https://buymeacoffee.com/shaan";
  return [
    blank(),
    boxTop("Buy Me a Coffee"),
    boxRow(""),
    boxRow("         ( (", "output-warning"),
    boxRow("          ) )", "output-warning"),
    boxRow("       ........", "output-warning"),
    boxRow("       |      |]", "output-warning"),
    boxRow("       \\      /", "output-warning"),
    boxRow("        `----'", "output-warning"),
    boxRow(""),
    boxRow(" Enjoying this portfolio?", "output-text"),
    boxRow(" Buy me a coffee!", "output-text"),
    boxRow(""),
    boxLink(`  -> ${url}`, url),
    boxRow(""),
    boxRow(" Status: Caffeinated [ok]", "output-success"),
    boxRow(""),
    boxBottom(),
    blank(),
  ];
}

function neofetchCommand() {
  return [{ type: "neofetch" }];
}

function newtermCommand(store) {
  const success = store.addTerminal();
  if (!success) {
    return [line("  Maximum terminals reached.", "output-warning")];
  }
  return [line("  ⟩ New terminal opened.", "output-success")];
}

async function sudoCommand(args) {
  const full = args.join(" ").toLowerCase();
  if (!full) {
    return [
      line("  [!] sudo: missing command", "output-error"),
      line(
        '  Hint: try "sudo hire shaan", "sudo meme", "sudo music", "sudo hobby"',
        "output-muted",
      ),
    ];
  }

  // Fetch content from backend
  const content = cachedContent || (await fetchContent());

  if (full === "hire shaan") {
    const msg = content.hireMessage || "Hired! Start: Now. Salary: Yes please!";
    const msgW = BOX_W - 6;
    const msgChunks = msg.match(new RegExp(`.{1,${msgW}}(\\s|$)`, "g")) || [
      msg,
    ];
    return [
      blank(),
      dblBoxTopSuccess(),
      dblBoxRowSuccess("   [OK] DECISION: EXCELLENT"),
      dblBoxRowSuccess(""),
      ...msgChunks.map((c) => dblBoxRowSuccess(`   ${c.trim()}`)),
      dblBoxRowSuccess(""),
      dblBoxBottomSuccess(),
      blank(),
    ];
  }

  if (full === "music" || full === "favourite music" || full === "play") {
    const musicUrl =
      content.musicUrl || "https://www.youtube.com/watch?v=jfKfPfyJRdk";
    return [
      blank(),
      line("  [~] Opening the vibes...", "output-success"),
      blank(),
      { type: "action", action: "openUrl", url: musicUrl },
      line("  ~ Now playing your favourite beats...", "output-muted"),
      blank(),
    ];
  }

  if (full === "meme" || full === "favourite meme") {
    const output = [blank()];
    if (content.memeAudioUrl) {
      output.push({ type: "audio", url: content.memeAudioUrl });
      output.push(
        line("  [>>] Playing your favourite meme sound...", "output-success"),
      );
    } else {
      output.push(
        line(
          '  [>] "It works on my machine" -- Every Dev Ever',
          "output-warning",
        ),
      );
    }
    output.push(blank());
    return output;
  }

  if (full === "hobby" || full === "favourite hobby" || full === "hobbies") {
    const hobbies = content.hobbies || [];
    const output = [blank(), boxTop("Hobbies & Interests"), boxRow("")];
    hobbies.forEach((h) => {
      output.push(boxRow(`  ${h}`));
    });
    output.push(boxRow(""));
    output.push(boxBottom());
    output.push(blank());
    return output;
  }

  if (full === "rm -rf /") {
    const rickrollUrl =
      content.rickrollUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    return [
      blank(),
      line("  [X] Initiating system destruction...", "output-error"),
      line("  ██████████████████ 100%", "output-error"),
      line("  ...", "output-muted"),
      line("  Just kidding! ;)", "output-success"),
      blank(),
      { type: "action", action: "openUrl", url: rickrollUrl },
      line("  [~] You've been rickrolled!", "output-warning"),
      blank(),
    ];
  }

  return [
    line("  [!] sudo: command not found", "output-error"),
    line(
      '  Hint: try "sudo hire shaan", "sudo meme", "sudo music", "sudo hobby"',
      "output-muted",
    ),
  ];
}
