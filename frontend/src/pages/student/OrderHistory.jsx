import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, getStatusStyle, getStatusLabel, formatOrderId } from '../../utils/helpers'
import { HiClipboardList, HiEye, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

const ITEMS_PER_PAGE = 8

const STATUS_BADGE_MAP = {
  pending: 'badge-pending',
  paid: 'badge-paid',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/api/orders/my-orders', {
        params: { page, limit: ITEMS_PER_PAGE },
      })
      const data = res.data.data || res.data
      if (Array.isArray(data)) {
        setOrders(data)
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE))
        setTotalOrders(data.length)
      } else {
        setOrders(data.orders || [])
        setTotalPages(data.totalPages || 1)
        setTotalOrders(data.total || 0)
      }
    } catch (error) {
      toast.error('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(currentPage)
  }, [currentPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getBadgeClass = (status) => {
    return STATUS_BADGE_MAP[status?.toLowerCase()] || 'badge-pending'
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-white font-display tracking-tight">Order History</h1>
          <p className="text-slate-400 text-sm mt-1">
            {totalOrders > 0 ? `${totalOrders} total order${totalOrders !== 1 ? 's' : ''}` : 'No orders yet'}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center min-h-[400px] text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-strong rounded-3xl p-12 relative overflow-hidden">
              <div className="gradient-border" />
              <div className="relative z-10">
                <div className="h-20 w-20 rounded-full flex items-center justify-center mb-4 mx-auto border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <HiClipboardList className="h-10 w-10 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-white font-display">No orders yet</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-xs">
                  Place your first order from the canteen!
                </p>
                <Link to="/student/home" className="btn-primary mt-5 inline-flex">
                  Browse Menu
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Desktop Table */}
            <motion.div
              className="hidden sm:block glass rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3.5">
                      Order ID
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3.5">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3.5">
                      Items
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3.5">
                      Total
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3.5">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3.5">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const itemCount = order.items?.length || 0

                    return (
                      <tr key={order._id} className="border-t border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-white">
                            {formatOrderId(order._id)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-300">
                            {formatDate(order.createdAt, 'short')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(order.createdAt, 'time')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-white">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${getBadgeClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/student/orders/${order._id}`}
                            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          >
                            <HiEye className="h-4 w-4" />
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </motion.div>

            {/* Mobile Cards */}
            <motion.div
              className="sm:hidden space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {orders.map((order) => {
                const itemCount = order.items?.length || 0

                return (
                  <motion.div
                    key={order._id}
                    className="glass rounded-2xl p-4"
                    variants={itemVariants}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">{formatOrderId(order._id)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt, 'datetime')}</p>
                      </div>
                      <span className={`badge ${getBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                        <p className="text-sm font-bold text-blue-400">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      <Link
                        to={`/student/orders/${order._id}`}
                        className="btn-secondary text-xs flex items-center gap-1"
                      >
                        <HiEye className="h-3.5 w-3.5" />
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-white/[0.08] text-slate-400 hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <HiChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-all ${
                        page === currentPage
                          ? 'text-white'
                          : 'border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                      style={page === currentPage ? {
                        background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                        boxShadow: '0 2px 10px rgba(37,99,235,0.3)',
                      } : { background: 'rgba(255,255,255,0.03)' }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-white/[0.08] text-slate-400 hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <HiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default OrderHistory
