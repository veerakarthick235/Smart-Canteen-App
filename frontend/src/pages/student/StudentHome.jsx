import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiShoppingCart, FiArrowRight } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency } from '../../utils/helpers.js'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Food', 'Beverages', 'Stationery']

const CATEGORY_CONFIG = {
  All: { emoji: '🍽', desc: 'Browse everything available', color: 'from-blue-500 to-cyan-500' },
  Food: { emoji: '🍱', desc: 'Fresh meals & snacks', color: 'from-orange-400 to-amber-500' },
  Beverages: { emoji: '☕', desc: 'Hot & cold drinks', color: 'from-cyan-400 to-blue-500' },
  Stationery: { emoji: '✏️', desc: 'Notebooks, pens & more', color: 'from-violet-400 to-purple-500' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function StudentHome() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { cartCount, cartTotal } = useCart()
  const { user } = useAuth()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'All') params.set('category', category)
      if (search) params.set('search', search)
      params.set('page', page)
      params.set('limit', '12')

      const res = await api.get(`/api/products?${params}`)
      setProducts(res.data.data.products)
      setTotalPages(res.data.data.totalPages)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [category, search, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setPage(1) }, [category, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handleCategoryChange = (cat) => {
    setCategory(cat)
    setSearch('')
    setSearchInput('')
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Vibrant gradient bg with decorative orbs */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.06) 30%, rgba(139,92,246,0.05) 60%, rgba(236,72,153,0.04) 100%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-500 text-sm font-semibold mb-1.5 tracking-wide">
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'} 👋
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-gradient">
              Order Now
            </h1>
            <p className="text-gray-500 mt-2 text-base max-w-lg">
              {CATEGORY_CONFIG[category].desc}
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSearch}
            className="mt-6 max-w-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for food, beverages, stationery…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-14 pr-28 py-4 text-base rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)' }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', boxShadow: '0 2px 10px rgba(37,99,235,0.2)' }}
              >
                Search
              </button>
            </div>
          </motion.form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category tabs */}
        <motion.div
          className="flex gap-3 mb-8 overflow-x-auto pb-1 -mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {CATEGORIES.map(cat => {
            const config = CATEGORY_CONFIG[cat]
            const isActive = category === cat
            return (
              <motion.button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:shadow-md'
                }`}
                style={isActive ? {
                  background: '#2563EB',
                } : {
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-base">{config.emoji}</span>
                {cat}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Search results label */}
        {search && (
          <div className="flex items-center gap-2 mb-4 px-1">
            <p className="text-sm text-gray-500">
              Showing results for "<strong className="text-gray-900">{search}</strong>"
            </p>
            <button
              onClick={() => { setSearch(''); setSearchInput('') }}
              className="text-xs text-red-500 hover:underline font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <motion.div
            className="glass rounded-3xl p-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-7xl block mb-4">🔍</span>
            <h3 className="text-xl font-bold text-gray-900 font-display">No products found</h3>
            <p className="text-gray-500 mt mt-2">Try a different search or category</p>
            <button onClick={() => handleCategoryChange('All')} className="btn-secondary mt-5">
              Show All Products
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={`${category}-${search}-${page}`}
            >
              {products.map(product => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-11 h-11 rounded-xl text-sm font-bold transition-all duration-200 ${
                      page === p
                        ? 'text-gray-900'
                        : 'border border-gray-200 text-gray-500 hover:border-blue-500/30 hover:text-blue-600'
                    }`}
                    style={page === p ? {
                      background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                    } : { background: '#F8FAFC' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Link
            to="/student/cart"
            className="flex items-center gap-4 text-white px-7 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.4), 0 0 60px rgba(6,182,212,0.15)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <FiShoppingCart size={20} />
              <span className="font-bold">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="w-px h-6 bg-white/25" />
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-lg">{formatCurrency(cartTotal)}</span>
              <FiArrowRight size={18} className="opacity-70" />
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
