import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Desktop from './components/Desktop'
import AdminPage from './components/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Desktop />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
