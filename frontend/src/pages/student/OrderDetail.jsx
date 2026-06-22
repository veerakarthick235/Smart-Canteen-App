import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, getStatusStyle, getStatusLabel, formatOrderId } from '../../utils/helpers'
import { HiArrowLeft, HiDownload, HiCheckCircle, HiClock, HiCurrencyRupee } from 'react-icons/hi'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!order) return null

  const statusStyle = getStatusStyle(order.status)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/student/orders" className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-700 transition-colors">
            <HiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500 text-sm">{formatOrderId(order._id)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
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
                            ? 'bg-primary-600 border-primary-600'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {isCompleted ? (
                          <HiCheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-primary-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <p className={`text-xs mt-1 font-medium capitalize ${isCompleted ? 'text-primary-600' : 'text-gray-400'}`}>
                        {step}
                      </p>
                    </div>
                    {idx < 2 && (
                      <div className={`flex-1 h-0.5 mx-1 ${currentIdx > stepIdx && order.status !== 'cancelled' ? 'bg-primary-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product?.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300 text-lg">🍽</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.product?.name || item.name || 'Item'}</p>
                    <p className="text-xs text-gray-500">{item.product?.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-primary-600">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
              <span className="text-base font-bold text-gray-900">Total Amount</span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Payment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Payment ID</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5 break-all">
                  {order.paymentId || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">Razorpay</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Order Number</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{formatOrderId(order._id)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount Paid</p>
                <p className="text-sm font-bold text-green-600 mt-0.5">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {order.qrCode && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Collection QR Code</h2>
              <p className="text-sm text-gray-500 mb-5">
                Show this QR code at the canteen counter to collect your order
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="border-4 border-primary-100 rounded-2xl p-3 bg-white shadow-inner">
                    <img
                      src={`data:image/png;base64,${order.qrCode}`}
                      alt="Order QR Code"
                      className="h-48 w-48 object-contain"
                    />
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    className="mt-3 flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <HiDownload className="h-4 w-4" />
                    Download QR
                  </button>
                </div>

                {/* Instructions */}
                <div className="flex-1">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-800 mb-3">How to collect</h3>
                    <ol className="space-y-2">
                      {[
                        'Go to the canteen counter',
                        'Show this QR code to the staff',
                        'Staff will scan the QR to verify',
                        'Collect your items',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                          <span className="h-5 w-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {order.status === 'completed' && order.collectedAt && (
                    <div className="mt-3 bg-green-50 rounded-xl p-4 border border-green-100">
                      <div className="flex items-center gap-2">
                        <HiCheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-800">Order Collected</p>
                          <p className="text-xs text-green-600 mt-0.5">
                            {formatDate(order.collectedAt, 'datetime')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
