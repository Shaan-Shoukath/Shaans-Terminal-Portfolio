import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import config from '../config'

export default function AdminDashboard({ token, onLogout }) {
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', technologies: '', github: '', deployment: '', linkedin: '', image: '' })
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  // ASCII Profile state
  const [asciiImage, setAsciiImage] = useState(null)
  const [asciiWidth, setAsciiWidth] = useState(50)
  const [asciiPreview, setAsciiPreview] = useState('')
  const [asciiLoading, setAsciiLoading] = useState(false)
  const [currentAscii, setCurrentAscii] = useState('')

  // Site Content state
  const [content, setContent] = useState(null)
  const [contentSaving, setContentSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('projects')

  const api = axios.create({
    baseURL: config.apiUrl,
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

  const fetchCurrentAscii = async () => {
    try {
      const res = await api.get('/api/profile/ascii')
      setCurrentAscii(res.data.asciiArt || '')
    } catch (err) { /* no profile yet */ }
  }

  const fetchContent = async () => {
    try {
      const res = await api.get('/api/content')
      setContent(res.data)
    } catch (err) {
      // Defaults if backend is offline
      setContent({
        about: { name: '', tagline: '', education: '', location: '', focus: '' },
        skills: [{ category: '', items: '' }],
        contact: { email: '', github: '', linkedin: '' },
        coffeeUrl: '',
        resumeUrl: '',
        resumeLinkedIn: '',
      })
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchCurrentAscii()
    fetchContent()
  }, [])

  const flash = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  // ── Projects CRUD ──────────────────────────────────

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
        flash('✓ Project updated')
      } else {
        await api.post('/api/projects', data)
        flash('✓ Project created')
      }
      resetForm()
      fetchProjects()
    } catch (err) {
      flash('Error: ' + (err.response?.data?.message || 'Failed to save'))
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
      flash('✓ Project deleted')
      fetchProjects()
    } catch (err) {
      flash('Error deleting project')
    }
  }

  // ── ASCII upload ───────────────────────────────────

  const handleAsciiUpload = async () => {
    if (!asciiImage) {
      flash('Please select an image first')
      return
    }
    setAsciiLoading(true)
    const formData = new FormData()
    formData.append('image', asciiImage)
    formData.append('width', asciiWidth.toString())
    try {
      const res = await api.post('/api/profile/ascii', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      })
      setAsciiPreview(res.data.asciiArt)
      setCurrentAscii(res.data.asciiArt)
      flash('✓ Neofetch ASCII profile updated!')
    } catch (err) {
      flash('Error: ' + (err.response?.data?.message || 'Upload failed'))
    }
    setAsciiLoading(false)
  }

  // ── Site Content ───────────────────────────────────

  const updateContent = (path, value) => {
    setContent(prev => {
      const copy = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let target = copy
      for (let i = 0; i < keys.length - 1; i++) {
        target = target[keys[i]]
      }
      target[keys[keys.length - 1]] = value
      return copy
    })
  }

  const addSkill = () => {
    setContent(prev => ({
      ...prev,
      skills: [...prev.skills, { category: '', items: '' }],
    }))
  }

  const removeSkill = (idx) => {
    setContent(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }))
  }

  const updateSkill = (idx, field, value) => {
    setContent(prev => ({
      ...prev,
      skills: prev.skills.map((s, i) => i === idx ? { ...s, [field]: value } : s),
    }))
  }

  const saveContent = async () => {
    setContentSaving(true)
    try {
      await api.put('/api/content', content)
      flash('✓ Site content saved!')
    } catch (err) {
      flash('Error: ' + (err.response?.data?.message || 'Save failed'))
    }
    setContentSaving(false)
  }

  // ── Label helper ───────────────────────────────────
  const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>
      {children}
    </label>
  )

  // ── Render ─────────────────────────────────────────

  return (
    <div className="admin-container">
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 50%), #0a0a0f', zIndex: 0 }} />
      <div className="admin-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: 'var(--accent-purple)', fontSize: 22, fontWeight: 600 }}>
              ⬡ Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
              Manage your portfolio
            </p>
          </div>
          <button className="admin-btn danger" onClick={onLogout}>
            ⏻ Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
          {[
            { key: 'projects', label: '◈ Projects', icon: '' },
            { key: 'content', label: '✎ Site Content', icon: '' },
            { key: 'ascii', label: '🎨 ASCII Profile', icon: '' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                background: activeTab === tab.key ? 'rgba(139,92,246,0.15)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--accent-purple)' : '2px solid transparent',
                color: activeTab === tab.key ? 'var(--accent-purple)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
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

        {/* ═══ PROJECTS TAB ═══ */}
        {activeTab === 'projects' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="admin-btn success" onClick={() => { resetForm(); setShowForm(true) }}>
                + New Project
              </button>
            </div>

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
                        <Label>Title</Label>
                        <input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Technologies (comma-separated)</Label>
                        <input className="admin-input" value={form.technologies} onChange={e => setForm({ ...form, technologies: e.target.value })} required />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <Label>Description</Label>
                        <textarea className="admin-input" style={{ minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                      </div>
                      <div>
                        <Label>GitHub URL</Label>
                        <input className="admin-input" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
                      </div>
                      <div>
                        <Label>Deployment URL</Label>
                        <input className="admin-input" value={form.deployment} onChange={e => setForm({ ...form, deployment: e.target.value })} />
                      </div>
                      <div>
                        <Label>LinkedIn URL</Label>
                        <input className="admin-input" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} />
                      </div>
                      <div>
                        <Label>Image URL</Label>
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
          </>
        )}

        {/* ═══ SITE CONTENT TAB ═══ */}
        {activeTab === 'content' && content && (
          <>
            {/* About Section */}
            <div className="admin-glass" style={{ marginBottom: 24 }}>
              <h3 style={{ color: 'var(--accent-cyan)', fontSize: 16, marginBottom: 16 }}>
                👤 About Me
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <Label>Name</Label>
                  <input className="admin-input" value={content.about.name} onChange={e => updateContent('about.name', e.target.value)} />
                </div>
                <div>
                  <Label>Location</Label>
                  <input className="admin-input" value={content.about.location} onChange={e => updateContent('about.location', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <Label>Tagline / Bio</Label>
                  <textarea className="admin-input" style={{ minHeight: 60, resize: 'vertical' }} value={content.about.tagline} onChange={e => updateContent('about.tagline', e.target.value)} />
                </div>
                <div>
                  <Label>Education</Label>
                  <input className="admin-input" value={content.about.education} onChange={e => updateContent('about.education', e.target.value)} />
                </div>
                <div>
                  <Label>Focus Areas</Label>
                  <input className="admin-input" value={content.about.focus} onChange={e => updateContent('about.focus', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="admin-glass" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: 'var(--accent-cyan)', fontSize: 16 }}>
                  ⚡ Skills ({content.skills.length})
                </h3>
                <button className="admin-btn success" style={{ padding: '4px 12px', fontSize: 12 }} onClick={addSkill}>
                  + Add Skill
                </button>
              </div>
              {content.skills.map((skill, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                  <div>
                    {idx === 0 && <Label>Category</Label>}
                    <input className="admin-input" value={skill.category} onChange={e => updateSkill(idx, 'category', e.target.value)} placeholder="e.g. Frontend" />
                  </div>
                  <div>
                    {idx === 0 && <Label>Items (· separated)</Label>}
                    <input className="admin-input" value={skill.items} onChange={e => updateSkill(idx, 'items', e.target.value)} placeholder="e.g. React · Vue · Angular" />
                  </div>
                  <button className="admin-btn danger" style={{ padding: '6px 10px', fontSize: 12, marginBottom: 2 }} onClick={() => removeSkill(idx)}>✕</button>
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="admin-glass" style={{ marginBottom: 24 }}>
              <h3 style={{ color: 'var(--accent-cyan)', fontSize: 16, marginBottom: 16 }}>
                📬 Contact
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <Label>Email</Label>
                  <input className="admin-input" value={content.contact.email} onChange={e => updateContent('contact.email', e.target.value)} />
                </div>
                <div>
                  <Label>GitHub URL</Label>
                  <input className="admin-input" value={content.contact.github} onChange={e => updateContent('contact.github', e.target.value)} />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <input className="admin-input" value={content.contact.linkedin} onChange={e => updateContent('contact.linkedin', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Links Section */}
            <div className="admin-glass" style={{ marginBottom: 24 }}>
              <h3 style={{ color: 'var(--accent-cyan)', fontSize: 16, marginBottom: 16 }}>
                🔗 Links
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <Label>Buy Me a Coffee URL</Label>
                  <input className="admin-input" value={content.coffeeUrl} onChange={e => updateContent('coffeeUrl', e.target.value)} placeholder="https://buymeacoffee.com/shaan" />
                </div>
                <div>
                  <Label>Resume PDF URL</Label>
                  <input className="admin-input" value={content.resumeUrl} onChange={e => updateContent('resumeUrl', e.target.value)} placeholder="/resume.pdf" />
                </div>
                <div>
                  <Label>Resume LinkedIn URL</Label>
                  <input className="admin-input" value={content.resumeLinkedIn} onChange={e => updateContent('resumeLinkedIn', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Hobbies Section */}
            <div className="admin-glass" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: 'var(--accent-cyan)', fontSize: 16 }}>
                  🎮 Hobbies ({(content.hobbies || []).length})
                </h3>
                <button className="admin-btn success" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => {
                  setContent(prev => ({ ...prev, hobbies: [...(prev.hobbies || []), ''] }))
                }}>
                  + Add Hobby
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
                Shown when users type <code style={{ color: 'var(--accent-green)' }}>sudo hobby</code>. Include emojis for flair!
              </p>
              {(content.hobbies || []).map((hobby, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input className="admin-input" value={hobby} onChange={e => {
                    setContent(prev => ({
                      ...prev,
                      hobbies: prev.hobbies.map((h, i) => i === idx ? e.target.value : h),
                    }))
                  }} placeholder="🎮  Gaming (when I should be coding)" />
                  <button className="admin-btn danger" style={{ padding: '6px 10px', fontSize: 12, flexShrink: 0 }} onClick={() => {
                    setContent(prev => ({ ...prev, hobbies: prev.hobbies.filter((_, i) => i !== idx) }))
                  }}>✕</button>
                </div>
              ))}
            </div>

            {/* Easter Eggs Section */}
            <div className="admin-glass" style={{ marginBottom: 24 }}>
              <h3 style={{ color: 'var(--accent-cyan)', fontSize: 16, marginBottom: 16 }}>
                🥚 Easter Eggs
              </h3>

              {/* Meme Audio Upload */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Label>🔊 Meme Audio (sudo meme)</Label>
                <p style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 8 }}>Upload an MP3 that plays when user types sudo meme</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="file" accept="audio/*" id="meme-audio-upload" style={{ display: 'none' }} onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    const formData = new FormData()
                    formData.append('audio', file)
                    try {
                      setMessage('Uploading meme audio...')
                      await api.post('/api/content/audio/meme', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                      setMessage('✓ Meme audio uploaded!')
                      const res = await api.get('/api/content')
                      setContent(res.data)
                    } catch (err) {
                      setMessage('Error: ' + (err.response?.data?.message || err.message))
                    }
                  }} />
                  <button className="admin-btn" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => document.getElementById('meme-audio-upload').click()}>
                    📁 Upload MP3
                  </button>
                  {content.memeAudioUrl && (
                    <>
                      <button className="admin-btn" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => {
                        const a = new Audio(content.memeAudioUrl); a.play().catch(() => {})
                      }}>▶ Preview</button>
                      <button className="admin-btn danger" style={{ padding: '6px 14px', fontSize: 12 }} onClick={async () => {
                        await api.delete('/api/content/audio/meme')
                        setContent(prev => ({ ...prev, memeAudioUrl: '' }))
                        setMessage('Meme audio removed')
                      }}>✕ Remove</button>
                      <span style={{ color: 'var(--accent-green)', fontSize: 11 }}>✓ Audio uploaded</span>
                    </>
                  )}
                </div>
              </div>

              {/* Shake Audio Upload */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Label>📱 Shake Audio (phone shake)</Label>
                <p style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 8 }}>Upload an MP3 that plays when user shakes their phone aggressively (3+ times). Leave empty for rickroll redirect.</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="file" accept="audio/*" id="shake-audio-upload" style={{ display: 'none' }} onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    const formData = new FormData()
                    formData.append('audio', file)
                    try {
                      setMessage('Uploading shake audio...')
                      await api.post('/api/content/audio/shake', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                      setMessage('✓ Shake audio uploaded!')
                      const res = await api.get('/api/content')
                      setContent(res.data)
                    } catch (err) {
                      setMessage('Error: ' + (err.response?.data?.message || err.message))
                    }
                  }} />
                  <button className="admin-btn" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => document.getElementById('shake-audio-upload').click()}>
                    📁 Upload MP3
                  </button>
                  {content.shakeAudioUrl && (
                    <>
                      <button className="admin-btn" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => {
                        const a = new Audio(content.shakeAudioUrl); a.play().catch(() => {})
                      }}>▶ Preview</button>
                      <button className="admin-btn danger" style={{ padding: '6px 14px', fontSize: 12 }} onClick={async () => {
                        await api.delete('/api/content/audio/shake')
                        setContent(prev => ({ ...prev, shakeAudioUrl: '' }))
                        setMessage('Shake audio removed')
                      }}>✕ Remove</button>
                      <span style={{ color: 'var(--accent-green)', fontSize: 11 }}>✓ Audio uploaded</span>
                    </>
                  )}
                </div>
              </div>

              {/* Music URL */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Label>🎵 Music URL (sudo music)</Label>
                <input className="admin-input" value={content.musicUrl || ''} onChange={e => updateContent('musicUrl', e.target.value)} placeholder="https://youtube.com/watch?v=jfKfPfyJRdk" />
                <p style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4 }}>YouTube/Spotify link opened when user types sudo music</p>
              </div>

              {/* Hire Message */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Label>✅ Hire Message (sudo hire shaan)</Label>
                <input className="admin-input" value={content.hireMessage || ''} onChange={e => updateContent('hireMessage', e.target.value)} placeholder="Shaan has been hired! Starting date: Immediately." />
                <p style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4 }}>Message shown in the success box when user types sudo hire shaan</p>
              </div>

              {/* Rickroll URL */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Label>🎵 Rickroll URL (sudo rm -rf /)</Label>
                <input className="admin-input" value={content.rickrollUrl || ''} onChange={e => updateContent('rickrollUrl', e.target.value)} placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ" />
                <p style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4 }}>YouTube link user gets redirected to on sudo rm -rf /</p>
              </div>
            </div>

            {/* Save Button */}
            <button
              className="admin-btn success"
              onClick={saveContent}
              disabled={contentSaving}
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 14, opacity: contentSaving ? 0.5 : 1 }}
            >
              {contentSaving ? '⟳ Saving...' : '✓ Save All Content'}
            </button>
          </>
        )}

        {/* ═══ ASCII PROFILE TAB ═══ */}
        {activeTab === 'ascii' && (
          <div className="admin-glass">
            <h3 style={{ color: 'var(--accent-cyan)', fontSize: 16, marginBottom: 16 }}>
              🎨 Neofetch ASCII Profile
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
              Upload an image to convert it to ASCII art. This will be displayed when users type <code style={{ color: 'var(--accent-green)' }}>neofetch</code> in the terminal.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Upload controls */}
              <div>
                <Label>Select Image</Label>
                <input
                  className="admin-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setAsciiImage(e.target.files[0])
                    setAsciiPreview('')
                  }}
                  style={{ padding: '8px' }}
                />

                <Label style={{ marginTop: 12 }}>Width (characters): {asciiWidth}</Label>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={asciiWidth}
                  onChange={(e) => setAsciiWidth(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>30 (small)</span>
                  <span>80 (detailed)</span>
                </div>

                <button
                  className="admin-btn success"
                  onClick={handleAsciiUpload}
                  disabled={asciiLoading || !asciiImage}
                  style={{ marginTop: 12, width: '100%', opacity: (!asciiImage || asciiLoading) ? 0.5 : 1 }}
                >
                  {asciiLoading ? '⟳ Converting...' : '⬡ Convert to ASCII'}
                </button>
              </div>

              {/* Preview */}
              <div>
                <Label>{asciiPreview ? 'New Preview' : currentAscii ? 'Current ASCII Art' : 'Preview'}</Label>
                <pre style={{
                  background: 'rgba(0,0,0,0.5)',
                  padding: '8px',
                  borderRadius: 8,
                  fontSize: '6px',
                  lineHeight: '7px',
                  overflow: 'auto',
                  maxHeight: '250px',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  whiteSpace: 'pre',
                }}>
                  {asciiPreview || currentAscii || '  No ASCII art yet.\n  Upload an image to get started.'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
