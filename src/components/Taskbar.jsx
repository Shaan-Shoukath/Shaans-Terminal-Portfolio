import React, { useState, useEffect } from 'react'
import useTerminalStore from '../store/terminalStore'

export default function Taskbar() {
  const terminals = useTerminalStore(s => s.terminals)
  const focusedId = useTerminalStore(s => s.focusedId)
  const matrixMode = useTerminalStore(s => s.matrixMode)
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="taskbar">
      <div className="taskbar-left">
        <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>⬡ ShaanOS</span>
        <span style={{ color: 'var(--text-muted)' }}>
          {terminals.length} terminal{terminals.length !== 1 ? 's' : ''}
        </span>
        {matrixMode && (
          <span style={{ color: 'var(--accent-green)' }}>⊞ Matrix</span>
        )}
      </div>
      <div className="taskbar-center">
        {terminals.map(t => (
          <div
            key={t.id}
            className={`taskbar-indicator ${t.id === focusedId ? 'active' : ''}`}
          />
        ))}
      </div>
      <div className="taskbar-right">
        <span>⌨ hyprland</span>
        <span style={{ color: 'var(--accent-cyan)' }}>{time}</span>
      </div>
    </div>
  )
}
