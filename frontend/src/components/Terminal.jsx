import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import useTerminalStore from '../store/terminalStore'
import { BOX_INNER_PADDING, executeCommand, displayWidth, getBoxContentWidth, getBoxWidth, pad, wrapContentLines } from '../commands/commandParser'
import Neofetch from './Neofetch'

// Track which action items have already been executed so we don't re-run on re-render
const executedActions = new Set()
let actionCounter = 0
const DEFAULT_TERMINAL_COLUMNS = 48
const TOP_BORDERS = {
  '┌': { right: '┐', fill: '─' },
  '╭': { right: '╮', fill: '─' },
  '╔': { right: '╗', fill: '═' },
}
const BOTTOM_BORDERS = {
  '└': { right: '┘', fill: '─' },
  '╰': { right: '╯', fill: '─' },
  '╚': { right: '╝', fill: '═' },
}
const SIDE_BORDERS = {
  '│': { right: '│' },
  '║': { right: '║' },
}

function trimEndSpaces(text) {
  return text.replace(/\s+$/, '')
}

function extractBorderTitle(middle, fillChar) {
  const escapedFill = fillChar === '═' ? '═' : '─'
  return middle
    .replace(new RegExp(`[${escapedFill}]+`, 'g'), ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitWrapPrefix(content) {
  const trimmed = trimEndSpaces(content)
  if (!trimmed) {
    return { text: '', prefix: '', nextPrefix: '' }
  }

  const numbered = trimmed.match(/^(\s*\[\d+\]\s+)(.*)$/)
  if (numbered) {
    return {
      prefix: numbered[1],
      nextPrefix: ' '.repeat(displayWidth(numbered[1])),
      text: numbered[2],
    }
  }

  const commandStyle = trimmed.match(/^(\s*(?:>>|->|[@>*•▸])\s+)(.*)$/)
  if (commandStyle) {
    return {
      prefix: commandStyle[1],
      nextPrefix: ' '.repeat(displayWidth(commandStyle[1])),
      text: commandStyle[2],
    }
  }

  const spaced = trimmed.match(/^(\s+)(.*)$/)
  if (spaced) {
    return {
      prefix: spaced[1],
      nextPrefix: spaced[1],
      text: spaced[2],
    }
  }

  return { text: trimmed, prefix: '', nextPrefix: '' }
}

function getContentClassName(className = '') {
  if (className.includes('output-link') || className.includes('output-heading')) {
    return 'output-border-heading'
  }
  if (className.includes('output-success')) {
    return 'output-border-success'
  }
  if (className.includes('output-warning')) {
    return 'output-border-warning'
  }
  if (className.includes('output-error')) {
    return 'output-border-error'
  }
  if (className.includes('output-muted')) {
    return 'output-border-muted'
  }
  return 'output-border-text'
}

function getSideBorderClassName(borderChar, className = '') {
  if (borderChar === '│') {
    return 'output-border-side'
  }

  if (className.includes('output-success')) {
    return 'output-success output-border-side'
  }

  return 'output-accent output-border-side'
}

function getBorderLineClassName(className = '') {
  if (className.includes('output-success')) {
    return 'output-border-success'
  }
  if (className.includes('output-warning')) {
    return 'output-border-warning'
  }
  if (className.includes('output-error')) {
    return 'output-border-error'
  }
  if (className.includes('output-muted')) {
    return 'output-border-muted'
  }
  return 'output-border-accent'
}

export default function Terminal({ terminal }) {
  const [input, setInput] = useState('')
  const [terminalColumns, setTerminalColumns] = useState(DEFAULT_TERMINAL_COLUMNS)
  const [terminalCharWidth, setTerminalCharWidth] = useState(8)
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

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    const measureColumns = () => {
      const styles = window.getComputedStyle(body)
      const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
      const availableWidth = Math.max(0, body.clientWidth - paddingX)
      const font = `${styles.fontStyle} ${styles.fontVariant} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`

      if (context) {
        context.font = font
      }

      const charWidth = context?.measureText('M').width || parseFloat(styles.fontSize) * 0.65
      setTerminalCharWidth(Math.max(1, charWidth))
      const columns = Math.max(26, Math.floor(availableWidth / charWidth))
      setTerminalColumns(columns)
    }

    measureColumns()

    const observer = new ResizeObserver(measureColumns)
    observer.observe(body)

    return () => observer.disconnect()
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const cmd = input.trim()

    // Add the input line to history
    store.addOutput(terminal.id, [
      { type: 'prompt', text: cmd },
    ])

    if (cmd) {
      store.addCommandToHistory(terminal.id, cmd)
      const output = await executeCommand(cmd, store, terminal.id, { maxColumns: terminalColumns })
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
  }, [input, terminal.id, store, terminalColumns])

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
  const boxWidth = getBoxWidth(terminalColumns)

  const renderResponsiveBorderItem = (item, i) => {
    const rawText = item.text.startsWith('  ') ? item.text.slice(2) : item.text
    const firstChar = rawText[0]
    const lastChar = rawText[rawText.length - 1]
    const contentWidth = getBoxContentWidth(boxWidth)
    const horizontalPadding = ' '.repeat(BOX_INNER_PADDING)
    const borderGridTemplate = `${terminalCharWidth * 2}px ${terminalCharWidth}px ${terminalCharWidth * boxWidth}px ${terminalCharWidth}px`

    if (TOP_BORDERS[firstChar] && TOP_BORDERS[firstChar].right === lastChar) {
      const { fill } = TOP_BORDERS[firstChar]
      const title = extractBorderTitle(rawText.slice(1, -1), fill)
      const label = title ? `${fill.repeat(3)} ${title} ` : ''
      const borderLineClassName = getBorderLineClassName(item.className)
      return (
        <div
          className="terminal-line output-border-row"
          key={i}
          style={{ gridTemplateColumns: borderGridTemplate }}
        >
          <span className="output-border-indent">{'  '}</span>
          <span className={borderLineClassName}>{firstChar}</span>
          <span className={`${borderLineClassName} output-border-cell`}>
            {`${label}${fill.repeat(Math.max(0, boxWidth - displayWidth(label)))}`}
          </span>
          <span className={borderLineClassName}>{lastChar}</span>
        </div>
      )
    }

    if (BOTTOM_BORDERS[firstChar] && BOTTOM_BORDERS[firstChar].right === lastChar) {
      const { fill } = BOTTOM_BORDERS[firstChar]
      const borderLineClassName = getBorderLineClassName(item.className)
      return (
        <div
          className="terminal-line output-border-row"
          key={i}
          style={{ gridTemplateColumns: borderGridTemplate }}
        >
          <span className="output-border-indent">{'  '}</span>
          <span className={borderLineClassName}>{firstChar}</span>
          <span className={`${borderLineClassName} output-border-cell`}>
            {fill.repeat(boxWidth)}
          </span>
          <span className={borderLineClassName}>{lastChar}</span>
        </div>
      )
    }

    if (SIDE_BORDERS[firstChar] && SIDE_BORDERS[firstChar].right === lastChar) {
      const { prefix, nextPrefix, text } = splitWrapPrefix(rawText.slice(1, -1))
      const wrappedLines = text
        ? wrapContentLines(text, contentWidth, prefix, nextPrefix)
        : ['']
      const contentClassName = getContentClassName(item.className)
      const sideBorderClassName = getSideBorderClassName(firstChar, item.className)

      if (item.type === 'link') {
        return (
          <React.Fragment key={i}>
            {wrappedLines.map((wrappedLine, idx) => {
              return (
                <div
                  className="terminal-line output-border-row"
                  key={`${i}-${idx}`}
                  style={{ gridTemplateColumns: borderGridTemplate }}
                >
                  <span className="output-border-indent">{'  '}</span>
                  <span className={sideBorderClassName}>{firstChar}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${contentClassName} output-border-cell`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {`${horizontalPadding}${pad(wrappedLine, contentWidth)}${horizontalPadding}`}
                  </a>
                  <span className={sideBorderClassName}>{lastChar}</span>
                </div>
              )
            })}
          </React.Fragment>
        )
      }

      return (
        <React.Fragment key={i}>
          {wrappedLines.map((wrappedLine, idx) => {
            return (
              <div
                className="terminal-line output-border-row"
                key={`${i}-${idx}`}
                style={{ gridTemplateColumns: borderGridTemplate }}
              >
                <span className="output-border-indent">{'  '}</span>
                <span className={sideBorderClassName}>{firstChar}</span>
                <span className={`${contentClassName} output-border-cell`}>
                  {`${horizontalPadding}${pad(wrappedLine, contentWidth)}${horizontalPadding}`}
                </span>
                <span className={sideBorderClassName}>{lastChar}</span>
              </div>
            )
          })}
        </React.Fragment>
      )
    }

    const fillChar = rawText.includes('═') ? '═' : '─'
    if (item.className?.includes('output-border') && rawText.startsWith(fillChar.repeat(3))) {
      const title = extractBorderTitle(rawText, fillChar)
      const label = title ? `${fillChar.repeat(3)} ${title} ` : ''
      const lineText = `  ${label}${fillChar.repeat(Math.max(0, boxWidth - displayWidth(label) + 2))}`
      return (
        <div className={`terminal-line ${item.className || ''}`} key={i}>
          {lineText}
        </div>
      )
    }

    return null
  }

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

    if (item.className?.includes('output-border')) {
      const responsiveBorderItem = renderResponsiveBorderItem(item, i)
      if (responsiveBorderItem) {
        return responsiveBorderItem
      }
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
          // Redirect directly in the same tab
          setTimeout(() => { window.location.href = item.url }, 100)
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
