import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingSpinner from './LoadingSpinner.jsx'

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isAdmin, isStudent, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role === 'admin' && !isAdmin) {
    return <Navigate to="/student/home" replace />
  }

  if (role === 'student' && !isStudent) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}
