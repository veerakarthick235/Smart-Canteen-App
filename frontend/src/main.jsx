import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "placeholder-client-id"}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  borderRadius: '14px',
                  background: 'rgba(30,41,59,0.9)',
                  backdropFilter: 'blur(16px)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                },
                success: {
                  iconTheme: { primary: '#22C55E', secondary: '#0F172A' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#0F172A' },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
