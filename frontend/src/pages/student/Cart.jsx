import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag, FiCreditCard } from 'react-icons/fi'
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
        name: 'Smart Canteen',           // ← your business name shown on payment page
        description: `Order of ${cartItems.length} item(s)`,
        image: '',                        // ← optional: URL to your logo (https://...)
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
      <div className="min-h-screen bg-bgLight">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="card p-12">
            <span className="text-8xl">🛒</span>
            <h2 className="text-2xl font-bold text-textPrimary mt-6">Your cart is empty</h2>
            <p className="text-textSecondary mt-2">Browse products and add them to your cart</p>
            <button onClick={() => navigate('/student/home')} className="btn-primary mt-6 gap-2">
              <FiShoppingBag size={18} /> Browse Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bgLight">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">Your Cart</h1>
            <p className="text-textSecondary text-sm">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div key={item._id} className="card p-4 flex items-center gap-4 animate-fade-in">
                {/* Item image / icon */}
                <div className="w-16 h-16 bg-bgLight rounded-xl flex items-center justify-center shrink-0 text-3xl overflow-hidden">
                  {item.image
                    ? <img src={`data:image/jpeg;base64,${item.image}`} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    : (item.category === 'Food' ? '🍱' : item.category === 'Beverages' ? '☕' : '✏️')
                  }
                </div>

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-textPrimary text-sm truncate">{item.name}</h3>
                  <span className={`badge text-xs mt-1 ${getCategoryBadge(item.category)}`}>{item.category}</span>
                  <p className="text-primary-600 font-bold mt-1">{formatCurrency(item.price)}</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center border border-border rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-textSecondary hover:bg-bgLight transition-colors"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-textPrimary">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-8 h-8 flex items-center justify-center text-textSecondary hover:bg-bgLight transition-colors disabled:opacity-40"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[72px]">
                  <p className="font-bold text-textPrimary">{formatCurrency(item.price * item.quantity)}</p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-2 text-textSecondary hover:text-danger hover:bg-red-50 rounded-xl transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}

            <button onClick={clearCart} className="text-sm text-danger hover:underline">
              Clear all items
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="font-bold text-textPrimary text-lg mb-4">Order Summary</h2>

              <div className="space-y-2.5 mb-4">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-textSecondary truncate pr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-textPrimary shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-textPrimary text-lg">Total</span>
                  <span className="font-bold text-primary-600 text-xl">{formatCurrency(cartTotal)}</span>
                </div>
                <p className="text-xs text-textSecondary mt-1">Includes all taxes</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn-primary w-full py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Preparing checkout…
                  </span>
                ) : (
                  <>
                    <FiCreditCard size={18} />
                    Pay {formatCurrency(cartTotal)}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-textSecondary">
                <span>🔒</span>
                <span>Secured by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
