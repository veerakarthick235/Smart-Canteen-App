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
    <nav className="bg-white border-b border-border sticky top-0 z-40 shadow-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/student/home" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍽</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-textPrimary text-lg leading-tight font-display">Smart Canteen</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/student/home" className="px-4 py-2 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-bgLight transition-colors flex items-center gap-2">
              <FiHome size={16} /> Home
            </Link>
            <Link to="/student/orders" className="px-4 py-2 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-bgLight transition-colors flex items-center gap-2">
              <FiList size={16} /> My Orders
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/student/cart" className="relative p-2.5 rounded-xl hover:bg-bgLight transition-colors text-textSecondary hover:text-primary-600">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold animate-badge-pop">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-bgLight transition-colors"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-primary-600 text-white text-sm font-bold">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.fullName)
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-textPrimary max-w-[120px] truncate">
                  {user?.fullName?.split(' ')[0]}
                </span>
                <FiChevronDown size={14} className={`text-textSecondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-border overflow-hidden"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-textPrimary text-sm">{user?.fullName}</p>
                      <p className="text-xs text-textSecondary mt-0.5">{user?.email}</p>
                      <p className="text-xs text-textSecondary">{user?.studentId} · {user?.department}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/student/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-textPrimary hover:bg-bgLight transition-colors w-full"
                      >
                        <FiUser size={16} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-danger hover:bg-red-50 transition-colors w-full"
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
              className="md:hidden p-2 rounded-xl hover:bg-bgLight text-textSecondary"
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
              className="md:hidden border-t border-border py-3 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link to="/student/home" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-textPrimary hover:bg-bgLight">
                <FiHome size={16} /> Home
              </Link>
              <Link to="/student/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-textPrimary hover:bg-bgLight">
                <FiList size={16} /> My Orders
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
