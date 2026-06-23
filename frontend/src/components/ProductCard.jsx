import { useState } from 'react'
import { FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi'
import { useCart } from '../context/CartContext.jsx'
import { formatCurrency, getCategoryBadge, truncateText } from '../utils/helpers.js'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const CATEGORY_EMOJIS = {
  Food: '🍱',
  Beverages: '☕',
  Stationery: '✏️',
}

const CATEGORY_GRADIENTS = {
  Food: 'from-orange-500 to-amber-600',
  Beverages: 'from-cyan-500 to-blue-600',
  Stationery: 'from-violet-500 to-purple-600',
}

const CATEGORY_BADGE_CLASS = {
  Food: 'badge-food',
  Beverages: 'badge-beverages',
  Stationery: 'badge-stationery',
}

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart()
  const [qty, setQty] = useState(1)

  const cartItem = cartItems.find(i => i._id === product._id)
  const cartQty = cartItem?.quantity || 0
  const isOutOfStock = product.stock === 0
  const remainingStock = product.stock - cartQty
  const catGradient = CATEGORY_GRADIENTS[product.category] || CATEGORY_GRADIENTS.Food
  const badgeClass = CATEGORY_BADGE_CLASS[product.category] || 'badge-food'

  const handleAdd = () => {
    if (remainingStock <= 0) {
      toast.error('Maximum stock added to cart')
      return
    }
    addToCart(product, qty)
    toast.success(`${product.name} added to cart!`, { duration: 2000 })
    setQty(1)
  }

  return (
    <motion.div
      className="group relative card-hover flex flex-col overflow-hidden"
      whileHover={{
        y: -6,
        borderColor: 'rgba(37,99,235,0.2)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3), 0 0 30px rgba(37,99,235,0.08)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        {product.image ? (
          <img
            src={product.image.startsWith('http') || product.image.startsWith('data:') ? product.image : `data:image/jpeg;base64,${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${catGradient} flex items-center justify-center`}>
            <span className="text-6xl select-none opacity-80 drop-shadow-lg">
              {CATEGORY_EMOJIS[product.category] || '📦'}
            </span>
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge - top left */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${badgeClass}`}>
            {CATEGORY_EMOJIS[product.category]} {product.category}
          </span>
        </div>

        {/* Low stock indicator - top right */}
        {!isOutOfStock && product.stock <= 5 && (
          <div className="absolute top-3 right-3">
            <span
              className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-bold bg-red-500/90 text-white"
              style={{
                animation: 'pulse 2s ease-in-out infinite',
                boxShadow: '0 0 16px rgba(239,68,68,0.4)',
              }}
            >
              🔥 Only {product.stock} left
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-slate-800/90 text-gray-900 text-sm font-bold border border-gray-200">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug font-display tracking-tight">{product.name}</h3>
        <p className="text-xs text-gray-500 mt mt-1.5 leading-relaxed flex-1">
          {truncateText(product.description, 70)}
        </p>

        {/* Price row */}
        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="text-2xl font-extrabold font-display tracking-tight text-gradient-blue">
              {formatCurrency(product.price)}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {product.stock > 0 ? `${product.stock} in stock` : ''}
          </span>
        </div>

        {/* Add to cart controls */}
        {!isOutOfStock && (
          <div className="flex items-center gap-2.5 mt-4">
            {/* Quantity selector */}
            <div
              className="flex items-center rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(remainingStock, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <FiPlus size={14} />
              </button>
            </div>

            {/* Add to cart button */}
            <motion.button
              onClick={handleAdd}
              disabled={remainingStock <= 0}
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiShoppingCart size={15} />
              {cartQty > 0 ? `Add More` : 'Add to Cart'}
            </motion.button>
          </div>
        )}

        {/* Already in cart indicator */}
        {cartQty > 0 && (
          <div
            className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-xl"
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            <span className="text-xs text-green-600 font-bold">✓ {cartQty} in cart</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
