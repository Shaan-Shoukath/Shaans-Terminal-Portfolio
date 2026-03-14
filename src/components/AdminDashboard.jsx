import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminDashboard({ token, onLogout }) {
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', technologies: '', github: '', deployment: '', linkedin: '', image: '' })
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  })

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects')
      setProjects(res.data)
    } catch (err) {
      setMessage('Failed to fetch projects')
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const resetForm = () => {
    setForm({ title: '', description: '', technologies: '', github: '', deployment: '', linkedin: '', image: '' })
    setEditing(null)
    setShowForm(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const data = {
      ...form,
      technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean),
    }
    try {
      if (editing) {
        await api.put(`/api/projects/${editing}`, data)
        setMessage('✓ Project updated')
      } else {
        await api.post('/api/projects', data)
        setMessage('✓ Project created')
      }
      resetForm()
      fetchProjects()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || 'Failed to save'))
    }
  }

  const handleEdit = (project) => {
    setForm({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      github: project.github || '',
      deployment: project.deployment || '',
      linkedin: project.linkedin || '',
      image: project.image || '',
    })
    setEditing(project._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await api.delete(`/api/projects/${id}`)
      setMessage('✓ Project deleted')
      fetchProjects()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error deleting project')
    }
  }

  return (
    <div className="admin-container">
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 50%), #0a0a0f', zIndex: 0 }} />
      <div className="admin-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: 'var(--accent-purple)', fontSize: 22, fontWeight: 600 }}>
              ⬡ Project Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              Manage your portfolio projects
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn success" onClick={() => { resetForm(); setShowForm(true) }}>
              + New Project
            </button>
            <button className="admin-btn danger" onClick={onLogout}>
              ⏻ Logout
            </button>
          </div>
        </div>

        {/* Status message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: '10px 16px',
                marginBottom: 16,
                borderRadius: 8,
                background: message.startsWith('✓') ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                border: `1px solid ${message.startsWith('✓') ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                color: message.startsWith('✓') ? 'var(--accent-green)' : 'var(--accent-rose)',
                fontSize: 13,
              }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="admin-glass"
              style={{ marginBottom: 24 }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 style={{ color: 'var(--accent-cyan)', fontSize: 16, marginBottom: 16 }}>
                {editing ? '✎ Edit Project' : '+ New Project'}
              </h3>
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Title</label>
                    <input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Technologies (comma-separated)</label>
                    <input className="admin-input" value={form.technologies} onChange={e => setForm({ ...form, technologies: e.target.value })} required />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Description</label>
                    <textarea className="admin-input" style={{ minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>GitHub URL</label>
                    <input className="admin-input" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Deployment URL</label>
                    <input className="admin-input" value={form.deployment} onChange={e => setForm({ ...form, deployment: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>LinkedIn URL</label>
                    <input className="admin-input" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Image URL</label>
                    <input className="admin-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button className="admin-btn success" type="submit">
                    {editing ? '✓ Update' : '+ Create'}
                  </button>
                  <button className="admin-btn" type="button" onClick={resetForm}>
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects table */}
        <div className="admin-glass">
          <h3 style={{ color: 'var(--accent-cyan)', fontSize: 16, marginBottom: 16 }}>
            ◈ Projects ({projects.length})
          </h3>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              No projects yet. Click "New Project" to add one.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Technologies</th>
                    <th>Links</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr key={p._id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{p.title}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {p.technologies.slice(0, 3).join(', ')}
                        {p.technologies.length > 3 && ` +${p.technologies.length - 3}`}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                          {p.github && <a href={p.github} target="_blank" rel="noopener" style={{ color: 'var(--accent-cyan)' }}>GitHub</a>}
                          {p.deployment && <a href={p.deployment} target="_blank" rel="noopener" style={{ color: 'var(--accent-green)' }}>Live</a>}
                          {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener" style={{ color: 'var(--accent-purple)' }}>LinkedIn</a>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="admin-btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleEdit(p)}>
                            ✎ Edit
                          </button>
                          <button className="admin-btn danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(p._id)}>
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
