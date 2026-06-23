import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, getStatusStyle, getStatusLabel, formatOrderId } from '../../utils/helpers'
import { HiArrowLeft, HiDownload, HiCheckCircle, HiClock, HiCurrencyRupee } from 'react-icons/hi'

const STATUS_BADGE_MAP = {
  pending: 'badge-pending',
  paid: 'badge-paid',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`)
        setOrder(res.data.data || res.data)
      } catch (error) {
        toast.error('Order not found')
        navigate('/student/orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleDownloadQR = () => {
    if (!order?.qrCode) return
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${order.qrCode}`
    link.download = `order-${formatOrderId(order._id)}-qr.png`
    link.click()
  }

  const getBadgeClass = (status) => {
    return STATUS_BADGE_MAP[status?.toLowerCase()] || 'badge-pending'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/student/orders" className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200">
            <HiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight">Order Details</h1>
            <p className="text-gray-500 text-sm text-sm">{formatOrderId(order._id)}</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {/* Status Card */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${getBadgeClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order Date</p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {formatDate(order.createdAt, 'datetime')}
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mt-6 flex items-center">
              {['pending', 'paid', 'completed'].map((step, idx) => {
                const statuses = ['pending', 'paid', 'completed']
                const currentIdx = statuses.indexOf(order.status?.toLowerCase())
                const stepIdx = statuses.indexOf(step)
                const isCompleted = currentIdx >= stepIdx && order.status !== 'cancelled'
                const isActive = currentIdx === stepIdx

                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                          isCompleted
                            ? 'border-blue-500'
                            : 'border-white/[0.12]'
                        }`}
                        style={isCompleted ? { background: 'linear-gradient(135deg, #2563EB, #06B6D4)' } : { background: '#F8FAFC' }}
                      >
                        {isCompleted ? (
                          <HiCheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-blue-400' : 'bg-white/10'}`} />
                        )}
                      </div>
                      <p className={`text-xs mt-1 font-medium capitalize ${isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                        {step}
                      </p>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded-full ${currentIdx > stepIdx && order.status !== 'cancelled' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-100'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Items */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="text-base font-semibold text-gray-800 mb-4 font-display">Order Items</h2>
            <div className="space-y-3">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0">
                  <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200" style={{ background: '#F8FAFC' }}>
                    {item.product?.image || item.image ? (
                      <img
                        src={(item.product?.image || item.image).startsWith('http') || (item.product?.image || item.image).startsWith('data:') ? (item.product?.image || item.image) : `data:image/jpeg;base64,${item.product?.image || item.image}`}
                        alt={item.product?.name || item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 text-lg">🍽</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{item.product?.name || item.name || 'Item'}</p>
                    <p className="text-xs text-gray-400">{item.product?.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-600">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-2">
              <span className="text-base font-bold text-gray-900 font-display">Total Amount</span>
              <span className="text-2xl font-bold text-gradient-blue">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </motion.div>

          {/* Payment Info */}
          <motion.div
            className="glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <h2 className="text-base font-semibold text-gray-800 mb-4 font-display">Payment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Payment ID</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5 break-all">
                  {order.paymentId || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Payment Method</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">Razorpay</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order Number</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{formatOrderId(order._id)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Amount Paid</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* QR Code Section */}
          {order.qrCode && (
            <motion.div
              className="glass-strong rounded-2xl p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="gradient-border" />

              <div className="relative z-10">
                <h2 className="text-base font-semibold text-gray-800 mb-2 font-display">Collection QR Code</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Show this QR code at the canteen counter to collect your order
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="rounded-2xl p-3 bg-white shadow-lg" style={{ boxShadow: '0 0 40px rgba(37,99,235,0.15)' }}>
                      <img
                        src={`data:image/png;base64,${order.qrCode}`}
                        alt="Order QR Code"
                        className="h-48 w-48 object-contain"
                      />
                    </div>
                    <button
                      onClick={handleDownloadQR}
                      className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <HiDownload className="h-4 w-4" />
                      Download QR
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="flex-1">
                    <div className="rounded-xl p-4 border border-blue-500/20" style={{ background: 'rgba(37,99,235,0.08)' }}>
                      <h3 className="text-sm font-semibold text-blue-300 mb-3">How to collect</h3>
                      <ol className="space-y-2">
                        {[
                          'Go to the canteen counter',
                          'Show this QR code to the staff',
                          'Staff will scan the QR to verify',
                          'Collect your items',
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-blue-200/80">
                            <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-blue-500/30" style={{ background: 'rgba(37,99,235,0.2)', color: '#93C5FD' }}>
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {order.status === 'completed' && order.collectedAt && (
                      <div className="mt-3 rounded-xl p-4 border border-emerald-500/20" style={{ background: 'rgba(34,197,94,0.08)' }}>
                        <div className="flex items-center gap-2">
                          <HiCheckCircle className="h-5 w-5 text-emerald-400" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-300">Order Collected</p>
                            <p className="text-xs text-emerald-400/70 mt-0.5">
                              {formatDate(order.collectedAt, 'datetime')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
