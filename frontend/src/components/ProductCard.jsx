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

const PLACEHOLDER_COLORS = {
  Food: 'from-orange-50 to-orange-100',
  Beverages: 'from-cyan-50 to-cyan-100',
  Stationery: 'from-purple-50 to-purple-100',
}

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart()
  const [qty, setQty] = useState(1)

  const cartItem = cartItems.find(i => i._id === product._id)
  const cartQty = cartItem?.quantity || 0
  const isOutOfStock = product.stock === 0
  const remainingStock = product.stock - cartQty

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
      className="card-hover overflow-hidden flex flex-col group"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Product Image / Placeholder */}
      <div className={`relative h-44 flex items-center justify-center bg-gradient-to-br ${PLACEHOLDER_COLORS[product.category] || 'from-gray-50 to-gray-100'} overflow-hidden`}>
        {product.image ? (
          <img
            src={product.image.startsWith('http') || product.image.startsWith('data:') ? product.image : `data:image/jpeg;base64,${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <span className="text-6xl select-none">
            {CATEGORY_EMOJIS[product.category] || '📦'}
          </span>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge text-xs font-semibold shadow-sm backdrop-blur-sm ${getCategoryBadge(product.category)}`}>
            {product.category}
          </span>
        </div>
        {/* Stock indicator */}
        {!isOutOfStock && product.stock <= 5 && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-amber-50/90 text-amber-700 text-xs border border-amber-200 backdrop-blur-sm">
              Only {product.stock} left
            </span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="badge bg-red-50 text-red-600 text-sm border border-red-200 font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-textPrimary text-base leading-snug">{product.name}</h3>
        <p className="text-xs text-textSecondary mt-1 leading-relaxed flex-1">
          {truncateText(product.description, 70)}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-primary-600 font-display">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-textSecondary">
            {product.stock > 0 ? `${product.stock} in stock` : ''}
          </span>
        </div>

        {/* Add to cart controls */}
        {!isOutOfStock && (
          <div className="flex items-center gap-2 mt-3">
            {/* Quantity selector */}
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-textSecondary hover:bg-bgLight transition-colors"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-textPrimary">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(remainingStock, q + 1))}
                className="w-8 h-8 flex items-center justify-center text-textSecondary hover:bg-bgLight transition-colors"
              >
                <FiPlus size={14} />
              </button>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAdd}
              disabled={remainingStock <= 0}
              className="flex-1 btn-primary text-sm py-2 px-3"
            >
              <FiShoppingCart size={15} />
              {cartQty > 0 ? `Add More` : 'Add to Cart'}
            </button>
          </div>
        )}

        {/* Already in cart indicator */}
        {cartQty > 0 && (
          <p className="text-xs text-primary-600 font-medium mt-2 text-center">
            ✓ {cartQty} in cart
          </p>
        )}
      </div>
    </motion.div>
  )
}
