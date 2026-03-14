import React, { useEffect, useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import useTerminalStore from '../store/terminalStore'
import Terminal from './Terminal'
import Taskbar from './Taskbar'
import MatrixRain from './MatrixRain'
import BootScreen from './BootScreen'
import { executeCommand } from '../commands/commandParser'

export default function Desktop() {
  const store = useTerminalStore()
  const terminals = useTerminalStore(s => s.terminals)
  const matrixMode = useTerminalStore(s => s.matrixMode)
  const [booting, setBooting] = useState(true)

  // Initialize first terminal after boot
  const handleBootComplete = useCallback(() => {
    setBooting(false)
    // Add default terminal with boot sequence
    store.addTerminal()
    const firstTerminal = useTerminalStore.getState().terminals[0]
    if (firstTerminal) {
      // Show welcome + neofetch
      store.addOutput(firstTerminal.id, [
        { type: 'text', text: '  Welcome to ShaanOS! 🚀', className: 'output-success' },
        { type: 'text', text: '', className: 'output-text' },
        { type: 'neofetch' },
        { type: 'text', text: '', className: 'output-text' },
        { type: 'text', text: "  Type 'help' to explore.", className: 'output-muted' },
        { type: 'text', text: '', className: 'output-text' },
      ])
    }
  }, [store])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault()
            store.addTerminal()
            break
          case 'q':
          case 'Q':
            e.preventDefault()
            if (store.focusedId) {
              store.removeTerminal(store.focusedId)
            }
            break
          case 'h':
          case 'H':
            e.preventDefault()
            store.focusDirection('left')
            break
          case 'l':
          case 'L':
            e.preventDefault()
            store.focusDirection('right')
            break
          case 'k':
          case 'K':
            e.preventDefault()
            store.focusDirection('up')
            break
          case 'j':
          case 'J':
            e.preventDefault()
            store.focusDirection('down')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [store])

  if (booting) {
    return <BootScreen onComplete={handleBootComplete} />
  }

  return (
    <div className="desktop">
      <div className="wallpaper" />

      {matrixMode && <MatrixRain />}

      <div className="terminal-container" data-count={Math.min(terminals.length, 4)}>
        <AnimatePresence mode="popLayout">
          {terminals.map(term => (
            <Terminal key={term.id} terminal={term} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {terminals.length === 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          fontSize: '14px',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <span style={{ fontSize: '24px', opacity: 0.3 }}>⬡</span>
          <span>Press <span style={{ color: 'var(--accent-purple)' }}>Alt + Enter</span> to open a terminal</span>
        </div>
      )}

      <Taskbar />
    </div>
  )
}
