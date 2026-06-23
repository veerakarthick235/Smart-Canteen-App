import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { FiShoppingCart, FiUser, FiLogOut, FiChevronDown, FiMenu, FiX, FiList, FiHome } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getInitials } from '../utils/helpers.js'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav
      className="sticky top-0 z-40 glass-strong"
      style={{
        boxShadow: '0 4px 30px rgba(37,99,235,0.04), 0 1px 3px rgba(0,0,0,0.03)',
        borderBottom: '1px solid rgba(37,99,235,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/student/home" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              }}
            >
              <span className="text-gray-900 font-bold text-lg">🍽</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-lg leading-tight font-display tracking-tight">Smart Canteen</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 rounded-2xl p-1" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(6,182,212,0.03))' }}>
            <Link
              to="/student/home"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-blue-600 hover:bg-white/70 transition-all duration-200 flex items-center gap-2"
            >
              <FiHome size={15} /> Home
            </Link>
            <Link
              to="/student/orders"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-blue-600 hover:bg-white/70 transition-all duration-200 flex items-center gap-2"
            >
              <FiList size={15} /> My Orders
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              to="/student/cart"
              className="relative p-2.5 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
            >
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[22px] h-[22px] text-[11px] font-bold rounded-full flex items-center justify-center text-white px-1 animate-badge-pop"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                    boxShadow: '0 2px 10px rgba(37,99,235,0.4), 0 0 20px rgba(6,182,212,0.2)',
                  }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <div
                  className="w-8 h-8 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-gray-900 text-sm font-bold shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                  }}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.fullName)
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user?.fullName?.split(' ')[0]}
                </span>
                <FiChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-60 glass-strong rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div
                      className="px-4 py-3 border-b border-gray-200"
                      style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)' }}
                    >
                      <p className="font-semibold text-gray-900 text-sm">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 mt mt-0.5">{user?.email}</p>
                      <p className="text-xs text-gray-400">{user?.studentId} · {user?.department}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/student/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors w-full"
                      >
                        <FiUser size={16} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                      >
                        <FiLogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-200 py-3 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link
                to="/student/home"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <FiHome size={16} /> Home
              </Link>
              <Link
                to="/student/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <FiList size={16} /> My Orders
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
