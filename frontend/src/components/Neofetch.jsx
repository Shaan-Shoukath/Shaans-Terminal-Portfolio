import React, { useState, useEffect } from 'react'
import axios from 'axios'
import config from '../config'

// Default fallback ASCII if API has no profile or is offline
const defaultAscii = String.raw`
                   -
                  .o+
                 .ooo+
                .ooooo+
               .oooo++++
              .oooo++oooo.
             .oooo++    ++.
            .oo++          +.
           .o+     :+oo+.   +.
          .o:    .ooooooo.   o.
         +:    +oooooooooo+  .o
        +:   .ooooo+   +ooo. o+
       +:   .ooo+         +. o+
      ++   .ooo:            .o+
     ++   .oo.             .oo.
    ++    ..              .oo.
   ++                   .oo.
  ++.                 .ooo.
   +oooooooooooooooooooo+
`.trim()

const colors = [
  '#ff5f57', '#febc2e', '#28c840', '#06b6d4',
  '#8b5cf6', '#f43f5e', '#f59e0b', '#e2e8f0',
]

export default function Neofetch() {
  const [ascii, setAscii] = useState(defaultAscii)

  useEffect(() => {
    // Try to fetch custom ASCII from backend
    axios.get(`${config.apiUrl}/api/profile/ascii`)
      .then(res => {
        if (res.data.asciiArt && res.data.asciiArt.trim().length > 0) {
          setAscii(res.data.asciiArt)
        }
      })
      .catch(() => {
        // API offline — use default
      })
  }, [])

  const info = [
    { label: 'OS', value: 'Arch Linux x86_64' },
    { label: 'Host', value: 'Terminal Portfolio v2.0' },
    { label: 'Kernel', value: 'React 19 + Vite 6' },
    { label: 'Shell', value: 'zsh 5.9 (shaan@portfolio)' },
    { label: 'WM', value: 'Hyprland (Dynamic Tiling)' },
    { label: 'Terminal', value: 'Alacritty' },
    { label: 'Theme', value: 'Catppuccin Mocha [Dark]' },
    { label: 'Font', value: 'JetBrains Mono 14px' },
    { label: 'CPU', value: 'One brain solving one problem.' },
    { label: 'GPU', value: '10,000 tiny brains arguing about the same pixel. 🎨' },
    { label: 'Memory', value: 'Unlimited Ideas' },
    { label: 'Uptime', value: 'Since first Hello World' },
  ]

  return (
    <div className="neofetch-container">
      <pre className="neofetch-ascii">{ascii}</pre>
      <div className="neofetch-info">
        <div className="info-line">
          <span className="info-label">shaan</span>
          <span className="info-value">@</span>
          <span className="info-label">portfolio</span>
        </div>
        <div className="info-line" style={{ color: 'var(--text-muted)' }}>
          {'─'.repeat(24)}
        </div>
        {info.map((item, i) => (
          <div className="info-line" key={i}>
            <span className="info-label">{item.label}: </span>
            <span className="info-value">{item.value}</span>
          </div>
        ))}
        <div className="neofetch-colors">
          {colors.map((c, i) => (
            <span key={i} style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  )
}
