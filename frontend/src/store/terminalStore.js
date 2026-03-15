import { create } from 'zustand'

let nextId = 1

function getMaxTerminals() {
  const w = window.innerWidth
  if (w <= 480) return 1    // Phones → 1 terminal only
  if (w <= 1024) return 2   // Tablets → up to 2 side-by-side
  return 4                  // Desktop / Laptop → up to 4
}

const useTerminalStore = create((set, get) => ({
  terminals: [],
  focusedId: null,
  matrixMode: false,
  maxTerminals: getMaxTerminals(),

  addTerminal: () => {
    const { terminals, maxTerminals } = get()
    if (terminals.length >= maxTerminals) return false
    const id = nextId++
    set(state => ({
      terminals: [...state.terminals, { id, history: [], commandHistory: [], commandIndex: -1 }],
      focusedId: id,
    }))
    return true
  },

  removeTerminal: (id) => {
    set(state => {
      const newTerminals = state.terminals.filter(t => t.id !== id)
      return {
        terminals: newTerminals,
        focusedId: newTerminals.length > 0
          ? newTerminals[newTerminals.length - 1].id
          : null,
      }
    })
  },

  setFocused: (id) => set({ focusedId: id }),

  addOutput: (termId, lines) => {
    set(state => ({
      terminals: state.terminals.map(t =>
        t.id === termId
          ? { ...t, history: [...t.history, ...lines] }
          : t
      ),
    }))
  },

  clearTerminal: (termId) => {
    set(state => ({
      terminals: state.terminals.map(t =>
        t.id === termId ? { ...t, history: [] } : t
      ),
    }))
  },

  addCommandToHistory: (termId, command) => {
    set(state => ({
      terminals: state.terminals.map(t =>
        t.id === termId
          ? {
              ...t,
              commandHistory: [...t.commandHistory, command],
              commandIndex: t.commandHistory.length + 1,
            }
          : t
      ),
    }))
  },

  navigateHistory: (termId, direction) => {
    const state = get()
    const terminal = state.terminals.find(t => t.id === termId)
    if (!terminal || terminal.commandHistory.length === 0) return ''

    let newIndex = terminal.commandIndex + direction
    if (newIndex < 0) newIndex = 0
    if (newIndex >= terminal.commandHistory.length) newIndex = terminal.commandHistory.length

    set(state => ({
      terminals: state.terminals.map(t =>
        t.id === termId ? { ...t, commandIndex: newIndex } : t
      ),
    }))

    return newIndex < terminal.commandHistory.length
      ? terminal.commandHistory[newIndex]
      : ''
  },

  toggleMatrix: () => set(state => ({ matrixMode: !state.matrixMode })),

  focusDirection: (dir) => {
    const { terminals, focusedId } = get()
    if (terminals.length <= 1) return
    const idx = terminals.findIndex(t => t.id === focusedId)
    const count = terminals.length

    let newIdx = idx
    if (dir === 'left') newIdx = idx % 2 === 1 ? idx - 1 : idx
    else if (dir === 'right') newIdx = idx % 2 === 0 && idx + 1 < count ? idx + 1 : idx
    else if (dir === 'up') newIdx = idx >= 2 ? idx - 2 : idx
    else if (dir === 'down') newIdx = idx + 2 < count ? idx + 2 : idx

    if (newIdx !== idx && terminals[newIdx]) {
      set({ focusedId: terminals[newIdx].id })
    }
  },
}))

// Update max terminals on resize, and trim excess terminals
window.addEventListener('resize', () => {
  const max = getMaxTerminals()
  const state = useTerminalStore.getState()
  const updates = { maxTerminals: max }

  // If we now have more terminals than allowed, close extras
  if (state.terminals.length > max) {
    const kept = state.terminals.slice(0, max)
    updates.terminals = kept
    updates.focusedId = kept.length > 0 ? kept[kept.length - 1].id : null
  }

  useTerminalStore.setState(updates)
})

export default useTerminalStore
