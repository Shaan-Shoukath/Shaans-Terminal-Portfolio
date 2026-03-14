# 💻 Command System

## What It Does

Parses user-typed commands and returns formatted output. This is the "brain" of the terminal experience.

## File: `src/commands/commandParser.js`

## All 14 Commands

| Command       | Function            | Output                                                      |
| ------------- | ------------------- | ----------------------------------------------------------- |
| `help`        | `helpCommand()`     | Lists all available commands with descriptions              |
| `about`       | `aboutCommand()`    | Developer bio, education, location, interests               |
| `skills`      | `skillsCommand()`   | Tech stack grouped by category                              |
| `projects`    | `projectsCommand()` | Fetches project list from API (or fallback)                 |
| `open <n>`    | `openCommand(args)` | Detailed view of project #n                                 |
| `resume`      | `resumeCommand()`   | Links to PDF resume and LinkedIn                            |
| `contact`     | `contactCommand()`  | Email, GitHub, LinkedIn links                               |
| `clear`       | —                   | Clears terminal output (calls `store.clearTerminal()`)      |
| `neofetch`    | `neofetchCommand()` | Returns `{ type: 'neofetch' }` → renders Neofetch component |
| `newterm`     | `newtermCommand()`  | Opens new terminal (calls `store.addTerminal()`)            |
| `exit`        | —                   | Closes terminal (calls `store.removeTerminal()`)            |
| `matrix`      | —                   | Toggles matrix rain (calls `store.toggleMatrix()`)          |
| `coffee`      | `coffeeCommand()`   | ASCII art coffee cup + message                              |
| `hyprland`    | `hyprlandCommand()` | Info about the tiling WM                                    |
| `sudo <args>` | `sudoCommand(args)` | Easter eggs (see below)                                     |

## Easter Eggs

```
"sudo hire shaan"  → Congratulatory hiring message ✅
"sudo rm -rf /"    → "This portfolio is indestructible" ☠️
"sudo <anything>"  → "Permission denied. Hint: try sudo hire shaan"
```

## How Project Fetching Works

```
projectsCommand()
  └→ fetchProjects()
       ├→ Try: axios.get('/api/projects') — from backend
       └→ Catch: use fallbackProjects.js — local data
```

The `cachedProjects` variable stores the last fetch result so `open <n>` doesn't need another API call.

## Output Formatting Pattern

Every command returns an array of **line objects**:

```js
function line(text, className = "output-text") {
  return { type: "text", text, className };
}

// Box drawing characters for styled output
line("  ┌─── About Me ───┐", "output-accent");
line("    Hello world", "output-text");
line("  └─────────────────┘", "output-accent");
```

## Adding a New Command

1. Add a case in the `switch` statement in `executeCommand()`
2. Create a function that returns an array of line objects
3. Done! The terminal will automatically render it.

```js
// Example: adding a "date" command
case 'date':
  return [line(`  ${new Date().toLocaleString()}`, 'output-text')]
```
