import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const bootLines = [
  { text: '', delay: 200 },
  { text: '  ▄▄▄▄▄  ▄▄   ▄▄  ▄▄▄▄▄  ▄▄▄▄▄  ▄▄   ▄  ▄▄▄▄▄  ▄▄▄▄▄', delay: 100, className: 'output-accent' },
  { text: '  █   ▀█ █  █ █  █ █   █  █   █  █  █  █ █   █  █', delay: 50, className: 'output-accent' },
  { text: '  ▀▀▀▀█  █▄▄█ █▄▄█ █▄▄▄█  █   █  █  ██ █ █   █  ▀▀▀▀█', delay: 50, className: 'output-accent' },
  { text: '  █▄▄▄█  █  █ █  █ █   █  █   █  █  █ ██ █▄▄▄█  █▄▄▄█', delay: 50, className: 'output-accent' },
  { text: '', delay: 100 },
  { text: '  Booting ShaanOS v2.0...', delay: 400 },
  { text: '', delay: 100 },
  { text: '  [  OK  ] Loading kernel modules...', delay: 300 },
  { text: '  [  OK  ] Initializing terminal subsystem...', delay: 250 },
  { text: '  [  OK  ] Mounting portfolio filesystem...', delay: 350 },
  { text: '  [  OK  ] Starting Hyprland compositor...', delay: 200 },
  { text: '  [  OK  ] Loading glassmorphism shaders...', delay: 300 },
  { text: '  [  OK  ] Connecting to project database...', delay: 250 },
  { text: '  [  OK  ] Starting network services...', delay: 200 },
  { text: '', delay: 100 },
  { text: '  ✨ System ready. Welcome to ShaanOS.', delay: 400, className: 'output-success' },
  { text: '', delay: 200 },
]

export default function BootScreen({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    let timeout
    let currentLine = 0
    let totalDelay = 0

    bootLines.forEach((line, i) => {
      totalDelay += line.delay
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line])
        if (i === bootLines.length - 1) {
          setTimeout(() => setDone(true), 600)
        }
      }, totalDelay)
    })

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (done) {
      const t = setTimeout(onComplete, 400)
      return () => clearTimeout(t)
    }
  }, [done, onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="boot-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              className={`boot-line ${line.className || ''}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
            >
              {line.text}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
