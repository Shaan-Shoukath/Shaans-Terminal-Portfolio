import React, { useState } from 'react'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null)

  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
  }

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />
}
