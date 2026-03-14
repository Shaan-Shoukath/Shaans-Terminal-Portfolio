const config = {
  // Empty in local dev so Vite proxy can handle /api routes.
  apiUrl: (import.meta.env.VITE_API_URL || '').replace(/\/+$/, ''),
}

export default config