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
    <div
      className="flex flex-col h-full"
      style={{
        background: 'rgba(17,24,39,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          }}
        >
          <span className="text-white font-bold text-lg">🍽</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-white text-base leading-tight font-display tracking-tight">Smart Canteen</p>
            <p className="text-[11px] text-slate-500 font-medium">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.06]" />

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
                 ? 'text-white font-bold'
                 : 'text-slate-400 hover:bg-white/5 hover:text-white'
               }
               ${collapsed ? 'justify-center px-3' : ''}`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3), 0 0 20px rgba(6,182,212,0.1)',
            } : undefined}
          >
            <Icon size={19} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        {!collapsed && (
          <div
            className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl"
            style={{
              background: 'rgba(30,41,59,0.5)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                boxShadow: '0 2px 10px rgba(37,99,235,0.3)',
              }}
            >
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
              <p className="text-[11px] text-slate-500 truncate">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full ${collapsed ? 'justify-center px-3' : ''}`}
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              className="absolute left-0 top-0 h-full w-72"
              style={{ boxShadow: '4px 0 30px rgba(0,0,0,0.5)' }}
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl glass-strong"
        style={{
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX size={20} className="text-white" /> : <FiMenu size={20} className="text-slate-300" />}
      </button>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: 'rgba(30,41,59,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <span className={`text-slate-400 text-xs transition-transform ${collapsed ? '' : 'rotate-180'}`}>›</span>
        </button>
      </div>
    </>
  )
}
