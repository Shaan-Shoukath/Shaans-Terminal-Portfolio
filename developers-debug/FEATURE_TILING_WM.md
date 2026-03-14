# 🪟 Tiling Window Manager

## What It Does

Mimics **Hyprland** — a dynamic tiling compositor for Linux. Terminals automatically arrange in a grid layout that changes based on how many are open.

## Layouts

```
1 terminal     2 terminals     3 terminals       4 terminals
┌──────────┐  ┌─────┬─────┐  ┌─────┬─────┐    ┌─────┬─────┐
│          │  │     │     │  │     │  2  │    │  1  │  2  │
│    1     │  │  1  │  2  │  │  1  ├─────┤    ├─────┼─────┤
│          │  │     │     │  │     │  3  │    │  3  │  4  │
└──────────┘  └─────┴─────┘  └─────┴─────┘    └─────┴─────┘
```

## How It Works

CSS Grid handles the layout. The `data-count` attribute on `.terminal-container` switches the grid:

```css
[data-count="1"] {
  grid-template-columns: 1fr;
} /* Full width */
[data-count="2"] {
  grid-template-columns: 1fr 1fr;
} /* 2 columns */
[data-count="3"] {
  grid-template-columns: 1fr 1fr;
} /* 2 cols, first spans both rows */
[data-count="3"] > :first-child {
  grid-row: 1 / -1;
}
[data-count="4"] {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
```

## Framer Motion Animations

When a terminal is added/removed, the `layout` prop on `<motion.div>` tells Framer Motion to **animate the size/position change** smoothly:

```jsx
<motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
```

`AnimatePresence` wraps the terminal list to animate enter/exit.

## Keybindings (Desktop.jsx)

| Shortcut  | Action                 | Store Function                    |
| --------- | ---------------------- | --------------------------------- |
| Alt+Enter | Open new terminal      | `store.addTerminal()`             |
| Alt+Q     | Close focused terminal | `store.removeTerminal(focusedId)` |
| Alt+H     | Focus left terminal    | `store.focusDirection('left')`    |
| Alt+L     | Focus right terminal   | `store.focusDirection('right')`   |
| Alt+K     | Focus above terminal   | `store.focusDirection('up')`      |
| Alt+J     | Focus below terminal   | `store.focusDirection('down')`    |

## Terminal Limits

| Device            | Max | Enforced By                          |
| ----------------- | --- | ------------------------------------ |
| Phone (≤1024px)   | 1   | `getMaxTerminals()` in terminalStore |
| Tablet (≤1024px)  | 1   | Same function                        |
| Desktop (>1024px) | 4   | Same function                        |

On resize, excess terminals are **auto-trimmed** to stay within the limit.

## Focus Direction Logic

```js
// 4-terminal grid indexed as:
//   0  1
//   2  3
// "left" from 1 → 0 (idx % 2 === 1 → idx - 1)
// "right" from 0 → 1 (idx % 2 === 0 → idx + 1)
// "up" from 2 → 0 (idx >= 2 → idx - 2)
// "down" from 0 → 2 (idx + 2 < count → idx + 2)
```
