import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/admin/login', { username, password })
      localStorage.setItem('adminToken', res.data.token)
      onLogin(res.data.token)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 50%), #0a0a0f', zIndex: 0 }} />
      <motion.div
        className="admin-glass"
        style={{ maxWidth: 400, width: '100%', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ color: 'var(--accent-purple)', marginBottom: 8, fontSize: 20, fontWeight: 600 }}>
          ⬡ Admin Access
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
          Authenticate to manage portfolio projects
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Username
            </label>
            <input
              className="admin-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Password
            </label>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p style={{ color: 'var(--accent-rose)', fontSize: 13, marginBottom: 16 }}>
              ⚠ {error}
            </p>
          )}

          <button
            className="admin-btn"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
          >
            {loading ? '◌ Authenticating...' : '→ Login'}
          </button>
        </form>

        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 20, textAlign: 'center' }}>
          ShaanOS Admin Panel v2.0
        </p>
      </motion.div>
    </div>
  )
}
