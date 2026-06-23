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
    <nav className="sticky top-0 z-40" style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(226,232,240,0.6)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.03)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/student/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105" style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
            }}>
              <span className="text-white font-bold text-lg">🍽</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-textPrimary text-lg leading-tight font-display tracking-tight">Smart Canteen</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-gray-50/80 rounded-2xl p-1">
            <Link to="/student/home" className="px-4 py-2 rounded-xl text-sm font-medium text-textSecondary hover:text-primary-600 hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center gap-2">
              <FiHome size={15} /> Home
            </Link>
            <Link to="/student/orders" className="px-4 py-2 rounded-xl text-sm font-medium text-textSecondary hover:text-primary-600 hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center gap-2">
              <FiList size={15} /> My Orders
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/student/cart" className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 text-textSecondary hover:text-primary-600">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] text-[11px] font-bold rounded-full flex items-center justify-center text-white px-1 animate-badge-pop" style={{
                  background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
                }}>
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
                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                }}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.fullName)
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-textPrimary max-w-[120px] truncate">
                  {user?.fullName?.split(' ')[0]}
                </span>
                <FiChevronDown size={14} className={`text-textSecondary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)' }}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)' }}>
                      <p className="font-semibold text-textPrimary text-sm">{user?.fullName}</p>
                      <p className="text-xs text-textSecondary mt-0.5">{user?.email}</p>
                      <p className="text-xs text-textSecondary">{user?.studentId} · {user?.department}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/student/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-textPrimary hover:bg-gray-50 transition-colors w-full"
                      >
                        <FiUser size={16} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-red-50 transition-colors w-full"
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
              className="md:hidden p-2 rounded-xl hover:bg-gray-50 text-textSecondary"
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
              className="md:hidden border-t border-gray-100 py-3 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link to="/student/home" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-textPrimary hover:bg-gray-50">
                <FiHome size={16} /> Home
              </Link>
              <Link to="/student/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-textPrimary hover:bg-gray-50">
                <FiList size={16} /> My Orders
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
