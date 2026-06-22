import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiShoppingCart } from 'react-icons/fi'
import Navbar from '../../components/Navbar.jsx'
import ProductCard from '../../components/ProductCard.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { formatCurrency } from '../../utils/helpers.js'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Food', 'Beverages', 'Stationery']

const CATEGORY_DESCRIPTIONS = {
  All: 'Everything from the canteen',
  Food: 'Fresh meals & snacks',
  Beverages: 'Hot & cold drinks',
  Stationery: 'Notebooks, pens & more',
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

  // Reset to page 1 when filter changes
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

  return (
    <div className="min-h-screen bg-bgLight">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-textPrimary">Order Now</h1>
          <p className="text-textSecondary mt-0.5">{CATEGORY_DESCRIPTIONS[category]}</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-lg">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
            <input
              type="text"
              placeholder="Search for food, beverages, stationery…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="form-input pl-11 pr-24 py-3 text-base shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                category === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-textSecondary border border-border hover:border-primary-600 hover:text-primary-600'
              }`}
            >
              {cat === 'All' && '🍽 '}
              {cat === 'Food' && '🍱 '}
              {cat === 'Beverages' && '☕ '}
              {cat === 'Stationery' && '✏️ '}
              {cat}
            </button>
          ))}
        </div>

        {/* Search results label */}
        {search && (
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm text-textSecondary">
              Showing results for "<strong className="text-textPrimary">{search}</strong>"
            </p>
            <button
              onClick={() => { setSearch(''); setSearchInput('') }}
              className="text-xs text-danger hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="card p-16 text-center">
            <span className="text-6xl">🔍</span>
            <h3 className="text-lg font-semibold text-textPrimary mt-4">No products found</h3>
            <p className="text-textSecondary mt-1">Try a different search or category</p>
            <button onClick={() => handleCategoryChange('All')} className="btn-secondary mt-4">
              Show All Products
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-border text-textSecondary hover:border-primary-600 hover:text-primary-600'
                    }`}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-slide-up">
          <Link
            to="/student/cart"
            className="flex items-center gap-4 bg-primary-600 text-white px-6 py-3.5 rounded-2xl shadow-card-lg hover:bg-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FiShoppingCart size={20} />
              <span className="font-semibold">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="w-px h-5 bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="font-bold">{formatCurrency(cartTotal)}</span>
              <span className="text-white/80 text-sm">→ View Cart</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
