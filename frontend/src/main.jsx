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
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(16px)',
                  color: '#1E293B',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                },
                success: {
                  iconTheme: { primary: '#16A34A', secondary: 'white' },
                },
                error: {
                  iconTheme: { primary: '#DC2626', secondary: 'white' },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
