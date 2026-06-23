import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  FiGrid, FiPackage, FiShoppingBag, FiCamera, FiBarChart2,
  FiLogOut, FiMenu, FiX,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { getInitials } from '../utils/helpers.js'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { path: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
  { path: '/admin/products', icon: FiPackage, label: 'Products' },
  { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { path: '/admin/scanner', icon: FiCamera, label: 'QR Scanner' },
  { path: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md" style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
        }}>
          <span className="text-white font-bold text-lg">🍽</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-textPrimary text-base leading-tight font-display tracking-tight">Smart Canteen</p>
            <p className="text-[11px] text-textSecondary font-medium">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gray-100" />

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
               ${isActive
                 ? 'text-white font-bold shadow-lg'
                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
               }
               ${collapsed ? 'justify-center px-3' : ''}`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            } : undefined}
          >
            <Icon size={19} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm" style={{
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            }}>
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-textPrimary truncate">{user?.fullName}</p>
              <p className="text-[11px] text-textSecondary truncate">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all w-full ${collapsed ? 'justify-center px-3' : ''}`}
        >
          <FiLogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40"
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-100"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col border-r border-gray-100 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
        style={{ boxShadow: '1px 0 8px rgba(0,0,0,0.02)' }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
        >
          <span className={`text-gray-500 text-xs transition-transform ${collapsed ? '' : 'rotate-180'}`}>›</span>
        </button>
      </div>
    </>
  )
}
