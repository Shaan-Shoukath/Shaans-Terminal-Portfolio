import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import useTerminalStore from '../store/terminalStore'
import { executeCommand } from '../commands/commandParser'
import Neofetch from './Neofetch'

// Track which action items have already been executed so we don't re-run on re-render
const executedActions = new Set()
let actionCounter = 0

export default function Terminal({ terminal }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const store = useTerminalStore()
  const isFocused = store.focusedId === terminal.id

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [terminal.history])

  // Auto-focus input when terminal is focused
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const cmd = input.trim()

    // Add the input line to history
    store.addOutput(terminal.id, [
      { type: 'prompt', text: cmd },
    ])

    if (cmd) {
      store.addCommandToHistory(terminal.id, cmd)
      const output = await executeCommand(cmd, store, terminal.id)
      // Tag action items with unique IDs so we can track execution
      const taggedOutput = output.map(item => {
        if (item && (item.type === 'action' || item.type === 'audio')) {
          return { ...item, _actionId: ++actionCounter }
        }
        return item
      })
      if (taggedOutput.length > 0) {
        store.addOutput(terminal.id, taggedOutput)
      }
    }

    setInput('')
  }, [input, terminal.id, store])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const cmd = store.navigateHistory(terminal.id, -1)
      setInput(cmd)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const cmd = store.navigateHistory(terminal.id, 1)
      setInput(cmd)
    }
  }, [terminal.id, store])

  const handleFocus = () => store.setFocused(terminal.id)
  const handleClose = () => store.removeTerminal(terminal.id)

  const renderLine = (item, i) => {
    if (!item) return null

    if (item.type === 'prompt') {
      return (
        <div className="terminal-line" key={i}>
          <span className="prompt-user">shaan</span>
          <span className="prompt-at">@</span>
          <span className="prompt-host">portfolio</span>
          <span className="prompt-path"> ~</span>
          <span className="prompt-symbol"> $ </span>
          <span>{item.text}</span>
        </div>
      )
    }

    if (item.type === 'neofetch') {
      return <Neofetch key={i} />
    }

    if (item.type === 'link') {
      return (
        <div className="terminal-line" key={i}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={item.className || 'output-link'}
            onClick={(e) => e.stopPropagation()}
          >
            {item.text}
          </a>
        </div>
      )
    }

    if (item.type === 'action') {
      // Execute action only once, not on every re-render
      if (item._actionId && !executedActions.has(item._actionId)) {
        executedActions.add(item._actionId)
        if (item.action === 'openUrl') {
          // window.open works here because it's triggered by user input (Enter key)
          setTimeout(() => window.open(item.url, '_blank'), 100)
        }
      }
      return null
    }

    if (item.type === 'audio') {
      // Play audio only once
      if (item._actionId && !executedActions.has(item._actionId)) {
        executedActions.add(item._actionId)
        try {
          const audio = new Audio(item.url)
          audio.play().catch(() => {})
        } catch { /* ignore */ }
      }
      return null
    }

    return (
      <div className={`terminal-line ${item.className || ''}`} key={i}>
        {item.text}
      </div>
    )
  }

  return (
    <motion.div
      className={`glass-terminal ${isFocused ? 'focused' : ''}`}
      onClick={handleFocus}
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Title bar */}
      <div className="terminal-titlebar">
        <div className="titlebar-dots">
          <div className="titlebar-dot red" onClick={handleClose} title="Close" />
          <div className="titlebar-dot yellow" title="Minimize" />
          <div className="titlebar-dot green" title="Maximize" />
        </div>
        <div className="titlebar-title">
          shaan@portfolio : ~
        </div>
      </div>

      {/* Body */}
      <div
        className="terminal-body"
        ref={bodyRef}
        onClick={() => inputRef.current?.focus()}
      >
        {terminal.history.map((item, i) => renderLine(item, i))}

        {/* Input line */}
        <div className="terminal-line input-line">
          <span className="prompt-user">shaan</span>
          <span className="prompt-at">@</span>
          <span className="prompt-host">portfolio</span>
          <span className="prompt-path"> ~</span>
          <span className="prompt-symbol"> $ </span>
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <input
              ref={inputRef}
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus={isFocused}
              spellCheck={false}
              autoComplete="off"
            />
            {isFocused && <span className="cursor-blink" />}
          </form>
        </div>
      </div>
    </motion.div>
  )
}
