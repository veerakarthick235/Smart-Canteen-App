import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'

// Auth pages
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

// Student pages
import StudentHome from './pages/student/StudentHome.jsx'
import Cart from './pages/student/Cart.jsx'
import OrderDetail from './pages/student/OrderDetail.jsx'
import OrderHistory from './pages/student/OrderHistory.jsx'
import Profile from './pages/student/Profile.jsx'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminScanner from './pages/admin/AdminScanner.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'

function RootRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/student/home" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student routes */}
      <Route path="/student/home" element={
        <ProtectedRoute role="student"><StudentHome /></ProtectedRoute>
      } />
      <Route path="/student/cart" element={
        <ProtectedRoute role="student"><Cart /></ProtectedRoute>
      } />
      <Route path="/student/orders" element={
        <ProtectedRoute role="student"><OrderHistory /></ProtectedRoute>
      } />
      <Route path="/student/orders/:id" element={
        <ProtectedRoute role="student"><OrderDetail /></ProtectedRoute>
      } />
      <Route path="/student/profile" element={
        <ProtectedRoute role="student"><Profile /></ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute role="admin"><AdminProducts /></ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>
      } />
      <Route path="/admin/scanner" element={
        <ProtectedRoute role="admin"><AdminScanner /></ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>
      } />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
