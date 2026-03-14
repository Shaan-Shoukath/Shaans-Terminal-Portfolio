# 📱 Responsive Design

## What It Does

Optimizes the portfolio for **every device size** — from small phones to ultra-wide monitors. Phones and tablets are restricted to 1 terminal.

## File: `src/index.css` (responsive section) + `src/store/terminalStore.js`

## Breakpoint Map

| Breakpoint  | Devices                      | Terminals | Font Size | Key Changes                                  |
| ----------- | ---------------------------- | --------- | --------- | -------------------------------------------- |
| ≤480px      | Phones                       | 1         | 11.5px    | Minimal padding, tiny ASCII, 30px taskbar    |
| ≤768px      | Large phones / small tablets | 1         | 12.5px    | Stacked neofetch, compact taskbar            |
| ≤1024px     | Tablets (iPad etc.)          | 1         | 13px      | Single-column forced, extra terminals hidden |
| 1025–1366px | Small laptops                | 4         | 13px      | Tighter spacing, reduced boot padding        |
| 1367–1599px | Standard laptops/desktops    | 4         | 14px      | Default design                               |
| ≥1600px     | Large monitors               | 4         | 15px      | More breathing room, larger elements         |
| ≥2000px     | Ultra-wide                   | 4         | 16px      | Maximum spacing and sizing                   |

## Special Media Queries

### Touch Devices `(hover: none) and (pointer: coarse)`

- Larger tap targets (44px minimum — Apple's recommendation)
- Bigger title bar dots
- Thinner scrollbar

### Landscape Phones `(max-height: 500px) and (orientation: landscape)`

- Ultra-compact title bar and taskbar
- Reduced boot screen padding
- Smaller font sizes

## Terminal Limit Enforcement

Two layers of enforcement:

### 1. JavaScript (terminalStore.js)

```js
function getMaxTerminals() {
  if (window.innerWidth <= 1024) return 1; // Phone + Tablet
  return 4; // Desktop
}
```

On window resize, excess terminals are automatically closed:

```js
if (state.terminals.length > max) {
  const kept = state.terminals.slice(0, max); // Keep first N
}
```

### 2. CSS (index.css)

```css
@media (max-width: 1024px) {
  /* Force single column */
  .terminal-container[data-count="2"],
  .terminal-container[data-count="3"],
  .terminal-container[data-count="4"] {
    grid-template-columns: 1fr;
  }

  /* Hide extra terminals visually as safety net */
  .glass-terminal:nth-child(n + 2) {
    display: none;
  }
}
```

## Mobile Safari Fix

```css
html,
body,
#root {
  height: 100dvh;
}
```

`dvh` (dynamic viewport height) accounts for Safari's address bar that shrinks/grows on scroll — prevents the UI from being cut off.

## Taskbar Clearance

Every breakpoint sets `inset-block-end` on `.terminal-container` to ensure terminals don't overlap with the taskbar:

```
Desktop:    48px clearance
Tablet:     42px clearance
Phone 768:  38px clearance
Phone 480:  34px clearance
Landscape:  28px clearance
```

## Testing Responsive

1. Open Chrome DevTools (F12)
2. Click the **device toolbar** icon (or Ctrl+Shift+M)
3. Select devices: iPhone SE, iPad, Pixel 7, etc.
4. Or drag the viewport width handles manually
