# 🧊 Glassmorphism UI

## What It Does

Creates a **frosted glass** effect on terminal windows, making them look semi-transparent with a blur behind them — a modern design trend.

## The 4 Pillars of Glassmorphism

```css
.glass-terminal {
  /* 1. BLUR — blurs everything behind the element */
  backdrop-filter: blur(24px) saturate(1.2);

  /* 2. TRANSPARENCY — semi-transparent background */
  background: rgba(12, 12, 20, 0.65);

  /* 3. BORDER — subtle light edge */
  border: 1px solid rgba(255, 255, 255, 0.08);

  /* 4. SHADOW/GLOW — depth when focused */
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
}
```

## How `backdrop-filter` Works

```
┌─── Wallpaper (radial gradients, colors) ───────┐
│                                                  │
│   ┌─── Glass Terminal ──────────────────┐       │
│   │  backdrop-filter: blur(24px)        │       │
│   │  ↑ This blurs ONLY the wallpaper    │       │
│   │    that's visible behind this box   │       │
│   │                                      │       │
│   │  The terminal text on top is sharp  │       │
│   └──────────────────────────────────────┘       │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Gradient Border Effect

The `::before` pseudo-element creates a **gradient border** on the top-left corner:

```css
.glass-terminal::before {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    transparent 50%
  );
  mask-composite: exclude; /* Creates a border from the gradient */
}
```

## Focus Glow

When a terminal is active (focused), it gets a purple glow:

```css
.glass-terminal.focused {
  border-color: rgba(139, 92, 246, 0.4); /* Purple border */
  box-shadow:
    0 0 20px rgba(139, 92, 246, 0.15),
    /* Outer glow */ inset 0 0 30px rgba(139, 92, 246, 0.03); /* Inner glow */
}
```

## Wallpaper Gradient Stack

The desktop wallpaper uses **layered radial gradients** for depth:

```css
.wallpaper {
  background:
    radial-gradient(at 20% 50%, purple-ish 0%, transparent 50%),
    /* Left blob */ radial-gradient(at 80% 20%, cyan-ish 0%, transparent 50%),
    /* Right blob */ radial-gradient(at 50% 80%, green-ish 0%, transparent 50%),
    /* Bottom blob */ linear-gradient(135deg, dark colors...); /* Base */
}
```

## Color System (CSS Variables)

All colors are defined in `:root` and reused everywhere:

```
--accent-purple: #8b5cf6  → Focus, headings, accents
--accent-cyan:   #06b6d4  → Links, neofetch, host name
--accent-green:  #10b981  → Success messages, user name
--accent-amber:  #f59e0b  → Warnings, skill categories
--accent-rose:   #f43f5e  → Errors, delete buttons
```

## Files

| File                                | What It Styles                                 |
| ----------------------------------- | ---------------------------------------------- |
| `src/index.css`                     | All glassmorphism CSS (lines 125–168)          |
| `src/components/Terminal.jsx`       | Applies `.glass-terminal` + `.focused` classes |
| `src/components/AdminLogin.jsx`     | Uses `.admin-glass` for login card             |
| `src/components/AdminDashboard.jsx` | Uses `.admin-glass` for panels                 |
