# 🚀 Boot Sequence

## What It Does

On first visit, plays a **staged boot animation** that mimics a Linux system booting up. After the boot completes, the actual desktop with terminal appears.

## File: `src/components/BootScreen.jsx`

## Boot Lines

Each line has a text, delay (ms before showing), and optional CSS class:

```
[ASCII art banner]              → output-accent (purple)
"Booting ShaanOS v2.0..."      → default green
"[  OK  ] Loading kernel..."   → default green (300ms delay)
"[  OK  ] Starting Hyprland.." → default green (200ms delay)
"✨ System ready."              → output-success (bright green)
```

## How It Works

```
1. BootScreen mounts → useEffect starts
2. Loop through bootLines array
3. For each line, schedule a setTimeout with cumulative delay
4. Each timeout adds the line to visibleLines state
5. React re-renders → new line appears with fade animation
6. After last line: wait 600ms → set done=true
7. done triggers second useEffect → calls onComplete() after 400ms
8. Parent (Desktop.jsx) sets booting=false → unmounts BootScreen
9. AnimatePresence fades out the boot screen
10. Desktop with terminal appears
```

## Animation

Each boot line uses Framer Motion:

```jsx
<motion.div
  initial={{ opacity: 0, x: -10 }} // Start invisible, slightly left
  animate={{ opacity: 1, x: 0 }} // Fade in, slide right
  transition={{ duration: 0.15 }} // Fast appear
/>
```

## Timing

Total boot time ≈ **3.5 seconds**:

- ASCII art: ~350ms
- System messages: ~2200ms
- Final "ready" message: 400ms
- Fade-out: 500ms

## Customizing

Edit the `bootLines` array in `BootScreen.jsx`:

```js
{ text: '  [  OK  ] Your custom message...', delay: 300 }
{ text: '  [FAIL] Something broke!', delay: 200, className: 'output-error' }
```
