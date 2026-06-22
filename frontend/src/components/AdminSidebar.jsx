import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  FiGrid, FiPackage, FiShoppingBag, FiCamera, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiChevronRight,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { getInitials } from '../utils/helpers.js'

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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">🍽</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-textPrimary text-base leading-tight">Smart Canteen</p>
            <p className="text-xs text-textSecondary">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-primary-600 text-white shadow-sm'
                 : 'text-textSecondary hover:bg-bgLight hover:text-textPrimary'
               }
               ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-border">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-bgLight">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(user?.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-textPrimary truncate">{user?.fullName}</p>
              <p className="text-xs text-textSecondary truncate">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
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
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-card-lg" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-card border border-border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col bg-white border-r border-border transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-bgLight transition-colors"
        >
          <FiChevronRight size={12} className={`text-textSecondary transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </>
  )
}
