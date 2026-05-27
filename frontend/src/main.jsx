import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Warn if Google Client ID is missing in production
if (!googleClientId && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  console.error(
    '%c🚨 VITE_GOOGLE_CLIENT_ID is not set!\n%cGoogle Sign-In will not work in production.\n%cMake sure it is set in Vercel project settings (Environment Variables → VITE_GOOGLE_CLIENT_ID).',
    'font-size: 16px; font-weight: bold; color: #ef4444;',
    'font-size: 13px; color: #f97316;',
    'font-size: 13px; color: #3b82f6;'
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
