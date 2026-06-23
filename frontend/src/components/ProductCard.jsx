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

const CATEGORY_COLORS = {
  Food: { bg: 'from-orange-400 to-amber-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Beverages: { bg: 'from-cyan-400 to-blue-500', light: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  Stationery: { bg: 'from-violet-400 to-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
}

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart()
  const [qty, setQty] = useState(1)

  const cartItem = cartItems.find(i => i._id === product._id)
  const cartQty = cartItem?.quantity || 0
  const isOutOfStock = product.stock === 0
  const remainingStock = product.stock - cartQty
  const catColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Food

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
      className="group relative bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        border: '1px solid rgba(226,232,240,0.8)',
      }}
      whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.04)' }}
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
          <div className={`w-full h-full bg-gradient-to-br ${catColor.bg} flex items-center justify-center`}>
            <span className="text-6xl select-none opacity-80 drop-shadow-lg">
              {CATEGORY_EMOJIS[product.category] || '📦'}
            </span>
          </div>
        )}

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge - top left */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg ${catColor.light} ${catColor.text} ${catColor.border} border`}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {CATEGORY_EMOJIS[product.category]} {product.category}
          </span>
        </div>

        {/* Stock indicator - top right */}
        {!isOutOfStock && product.stock <= 5 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-bold bg-red-500 text-white shadow-lg"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            >
              🔥 Only {product.stock} left
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-textPrimary text-base leading-snug font-display tracking-tight">{product.name}</h3>
        <p className="text-xs text-textSecondary mt-1.5 leading-relaxed flex-1">
          {truncateText(product.description, 70)}
        </p>

        {/* Price row */}
        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="text-2xl font-extrabold font-display tracking-tight" style={{
              background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {formatCurrency(product.price)}
            </span>
          </div>
          <span className="text-xs text-textSecondary font-medium">
            {product.stock > 0 ? `${product.stock} in stock` : ''}
          </span>
        </div>

        {/* Add to cart controls */}
        {!isOutOfStock && (
          <div className="flex items-center gap-2.5 mt-4">
            {/* Quantity selector */}
            <div className="flex items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-textSecondary hover:bg-gray-100 hover:text-textPrimary transition-colors"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-bold text-textPrimary">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(remainingStock, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-textSecondary hover:bg-gray-100 hover:text-textPrimary transition-colors"
              >
                <FiPlus size={14} />
              </button>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAdd}
              disabled={remainingStock <= 0}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              }}
              onMouseEnter={(e) => { if (!e.target.disabled) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 16px rgba(37,99,235,0.4)' }}}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 2px 8px rgba(37,99,235,0.3)' }}
            >
              <FiShoppingCart size={15} />
              {cartQty > 0 ? `Add More` : 'Add to Cart'}
            </button>
          </div>
        )}

        {/* Already in cart indicator */}
        {cartQty > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-green-50 border border-green-200">
            <span className="text-xs text-green-700 font-bold">✓ {cartQty} in cart</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
