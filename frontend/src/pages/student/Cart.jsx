import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag, FiCreditCard } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency, getCategoryBadge } from '../../utils/helpers.js'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

async function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    setLoading(true)
    try {
      const isLoaded = await loadRazorpay()
      if (!isLoaded) {
        toast.error('Payment gateway could not be loaded. Please try again.')
        return
      }

      // Create order on backend
      const orderRes = await api.post('/api/payments/create-order', {
        items: cartItems.map(i => ({ productId: i._id, quantity: i.quantity })),
      })

      if (!orderRes.data.success) {
        toast.error(orderRes.data.message || 'Failed to create order')
        return
      }

      const { razorpayOrderId, amount, orderId } = orderRes.data.data
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || orderRes.data.data.keyId

      const options = {
        key: razorpayKey,
        amount,
        currency: 'INR',
        name: 'Smart Canteen',
        description: `Order of ${cartItems.length} item(s)`,
        image: '',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            })

            if (verifyRes.data.success) {
              clearCart()
              toast.success('Payment successful! Your QR code is ready.')
              navigate(`/student/orders/${verifyRes.data.data._id}`)
            } else {
              toast.error('Payment verification failed. Contact support.')
            }
          } catch {
            toast.error('Payment verification error. Please contact support.')
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
        },
        notes: {
          studentId: user?.studentId || '',
          department: user?.department || '',
        },
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled.', { icon: 'ℹ️' })
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`)
      })
      rzp.open()
    } catch (err) {
      const msg = err.response?.data?.message || 'Checkout failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <motion.div
            className="glass-strong rounded-3xl p-12 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="gradient-border" />
            <div className="relative z-10">
              <span className="text-8xl block">🛒</span>
              <h2 className="text-2xl font-bold text-white mt-6 font-display">Your cart is empty</h2>
              <p className="text-slate-400 mt-2">Browse products and add them to your cart</p>
              <motion.button
                onClick={() => navigate('/student/home')}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiShoppingBag size={18} /> Browse Products
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors border border-white/[0.08]">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white font-display">Your Cart</h1>
            <p className="text-slate-400 text-sm">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item, idx) => (
              <motion.div
                key={item._id}
                className="glass rounded-2xl p-4 flex items-center gap-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
              >
                {/* Item image / icon */}
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 text-3xl overflow-hidden border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {item.image
                    ? <img src={item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    : (item.category === 'Food' ? '🍱' : item.category === 'Beverages' ? '☕' : '✏️')
                  }
                </div>

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">{item.name}</h3>
                  <span className={`badge text-xs mt-1 ${getCategoryBadge(item.category)}`}>{item.category}</span>
                  <p className="text-blue-400 font-bold mt-1">{formatCurrency(item.price)}</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center border border-white/[0.08] rounded-xl overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-white/[0.08] transition-colors"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-white/[0.08] transition-colors disabled:opacity-40"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[72px]">
                  <p className="font-bold text-white">{formatCurrency(item.price * item.quantity)}</p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </motion.div>
            ))}

            <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors">
              Clear all items
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="glass-strong rounded-2xl p-6 sticky top-20 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="gradient-border" />

              <div className="relative z-10">
                <h2 className="font-bold text-white text-lg mb-4 font-display">Order Summary</h2>

                <div className="space-y-2.5 mb-4">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-slate-400 truncate pr-2">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-slate-200 shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/[0.08] pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-lg">Total</span>
                    <span className="font-bold text-2xl text-gradient-blue">{formatCurrency(cartTotal)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Includes all taxes</p>
                </div>

                <motion.button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-3 text-base font-bold text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}
                  whileHover={{ scale: 1.02, boxShadow: '0 6px 28px rgba(37,99,235,0.5)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-xl">
                    <span className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] animate-[shine_3s_ease-in-out_infinite]" />
                  </span>
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Preparing checkout…
                      </>
                    ) : (
                      <>
                        <FiCreditCard size={18} />
                        Pay {formatCurrency(cartTotal)}
                      </>
                    )}
                  </span>
                </motion.button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                  <span>🔒</span>
                  <span>Secured by Razorpay</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
