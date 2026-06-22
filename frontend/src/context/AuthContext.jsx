import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('canteen_token')
    const storedUser = localStorage.getItem('canteen_user')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch {
        localStorage.removeItem('canteen_token')
        localStorage.removeItem('canteen_user')
      }
    }
    setLoading(false)
  }, [])

  const login = ({ token: newToken, user: newUser }) => {
    localStorage.setItem('canteen_token', newToken)
    localStorage.setItem('canteen_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('canteen_token')
    localStorage.removeItem('canteen_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('canteen_user', JSON.stringify(updated))
  }

  const isAuthenticated = !!token && !!user
  const isAdmin = isAuthenticated && user?.role === 'admin'
  const isStudent = isAuthenticated && user?.role === 'student'

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, updateUser,
      isAuthenticated, isAdmin, isStudent,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
