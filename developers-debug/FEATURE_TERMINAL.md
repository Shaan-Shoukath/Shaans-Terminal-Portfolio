# ⌨️ Terminal System

## What It Does

Each terminal is a glassmorphism window that mimics **Alacritty** (a popular Linux terminal emulator). Users type commands and see styled output.

## Files Involved

| File                            | Role                           |
| ------------------------------- | ------------------------------ |
| `src/components/Terminal.jsx`   | Renders one terminal window    |
| `src/store/terminalStore.js`    | Manages all terminal instances |
| `src/commands/commandParser.js` | Processes typed commands       |

## How a Command Flows

```
1. User types "help" → input state updates via onChange
2. User presses Enter → handleSubmit() fires
3. Current input added to history as a { type: 'prompt' } line
4. Command stored in commandHistory for arrow-key recall
5. executeCommand("help", store, termId) called
6. Returns array of output objects
7. store.addOutput(termId, output) adds them to state
8. React re-renders → renderLine() maps objects to JSX
9. useEffect auto-scrolls terminal body to bottom
```

## Terminal State (per terminal)

```js
{
  id: 1,                    // Unique ID
  history: [...],           // All displayed lines (output objects)
  commandHistory: ["help"], // Past commands for arrow navigation
  commandIndex: 1           // Current position in command history
}
```

## Output Object Types

```js
{ type: 'text', text: 'Hello', className: 'output-success' }  // Styled text
{ type: 'prompt', text: 'help' }                                // Prompt line
{ type: 'link', text: 'GitHub', url: '...', className: '...' } // Clickable link
{ type: 'neofetch' }                                            // Neofetch component
```

## Key Functions in Terminal.jsx

| Function              | What It Does                                   |
| --------------------- | ---------------------------------------------- |
| `handleSubmit(e)`     | Runs on Enter — executes command, clears input |
| `handleKeyDown(e)`    | Arrow Up/Down — navigates command history      |
| `handleFocus()`       | Clicking a terminal makes it the focused one   |
| `handleClose()`       | Red dot click — removes terminal               |
| `renderLine(item, i)` | Maps output objects to JSX elements            |

## Focus System

- Only the **focused** terminal receives keyboard input
- Focused terminal gets a purple glow border (`.focused` class)
- Click a terminal or use Alt+H/J/K/L to change focus
- `inputRef.current.focus()` auto-focuses the input field
