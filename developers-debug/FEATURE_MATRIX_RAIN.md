# 🟢 Matrix Rain

## What It Does

Typing `matrix` in the terminal toggles a **Matrix-style falling character animation** behind all terminals using HTML Canvas.

## File: `src/components/MatrixRain.jsx`

## How It Works

```
1. A <canvas> element covers the entire screen (position: fixed)
2. The canvas is divided into columns (width / fontSize)
3. Each column has a "drop" position tracking where the next character goes
4. Every 40ms, the draw() function:
   a. Fills the canvas with semi-transparent black (creates the trail fade)
   b. Picks a random character for each column
   c. Draws it at the drop position
   d. Moves the drop down by 1
   e. If drop goes past the bottom, randomly reset to top
```

## Character Set

```
Japanese Katakana: アイウエオカキクケコサシスセソ...
Numbers: 0123456789
Hex: ABCDEF
Code symbols: <>{} []|/\=+*~
```

## Key Settings

| Setting      | Value              | Effect                          |
| ------------ | ------------------ | ------------------------------- |
| `fontSize`   | 14px               | Column width & character size   |
| Interval     | 40ms               | ~25 FPS animation speed         |
| Fade         | `rgba(0,0,0,0.05)` | How quickly trails disappear    |
| Reset chance | `> 0.975`          | Randomizes when columns restart |
| Color        | `#0f8`             | Classic Matrix green            |

## Toggle Flow

```
User types "matrix" → executeCommand() → store.toggleMatrix()
  → matrixMode state flips true/false
    → Desktop.jsx reads matrixMode
      → If true: <MatrixRain /> renders
      → If false: component unmounts, canvas removed
```

## z-index Layering

```
Wallpaper:  z-index: 0
Matrix:     z-index: 1   ← Behind terminals, in front of wallpaper
Terminals:  z-index: 10
Taskbar:    z-index: 100
```

`pointer-events: none` ensures you can still click through the canvas.

## Performance Notes

- Canvas is lightweight — no DOM nodes created per character
- `setInterval` is cleaned up on component unmount
- Window resize listener updates canvas dimensions
