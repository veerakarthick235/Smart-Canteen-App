import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, getStatusStyle, getStatusLabel, formatOrderId, truncateText } from '../../utils/helpers'
import {
  HiSearch, HiEye, HiRefresh, HiCheck, HiBan, HiChevronLeft, HiChevronRight
} from 'react-icons/hi'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const ITEMS_PER_PAGE = 12

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: ITEMS_PER_PAGE }
      if (statusFilter) params.status = statusFilter
      if (search) params.search = search

      const res = await api.get('/api/admin/orders', { params })
      const data = res.data.data || res.data
      if (Array.isArray(data)) {
        setOrders(data)
        setTotalPages(1)
        setTotalOrders(data.length)
      } else {
        setOrders(data.orders || [])
        setTotalPages(data.totalPages || 1)
        setTotalOrders(data.total || 0)
      }
    } catch {
      toast.error('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    fetchOrders(1)
  }, [statusFilter, search])

  useEffect(() => {
    fetchOrders(currentPage)
  }, [currentPage])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(orderId)
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus })
      toast.success(`Order marked as ${newStatus}`)
      fetchOrders(currentPage)
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const StatusActions = ({ order }) => {
    const isLoading = updatingStatus === order._id
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {order.status === 'paid' && (
          <button
            onClick={() => handleStatusUpdate(order._id, 'completed')}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
            style={{
              background: 'rgba(34,197,94,0.1)',
              color: '#4ADE80',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)' }}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <HiCheck className="h-3.5 w-3.5" />}
            Complete
          </button>
        )}
        {(order.status === 'pending' || order.status === 'paid') && (
          <button
            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl transition-all disabled:opacity-50"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#F87171',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
          >
            <HiBan className="h-3.5 w-3.5" />
            Cancel
          </button>
        )}
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Orders</h1>
            <p className="text-gray-500 text-sm text-sm mt-1">
              {totalOrders} total order{totalOrders !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => fetchOrders(currentPage)}
            className="btn-secondary text-sm"
          >
            <HiRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="card p-4 mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-9"
              />
            </div>
          </div>
          {/* Status Tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {STATUS_TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === value
                    ? 'text-white shadow-lg'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                style={statusFilter === value ? {
                  background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
                  boxShadow: '0 2px 10px rgba(37,99,235,0.2)',
                } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            className="card flex flex-col items-center justify-center min-h-[250px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-400 font-medium">No orders found</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Student</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const statusStyle = getStatusStyle(order.status)
                      return (
                        <tr key={order._id}>
                          <td>
                            <span className="text-sm font-semibold text-gray-800">
                              {formatOrderId(order._id)}
                            </span>
                            {order.paymentId && (
                              <p className="text-xs text-gray-400 truncate truncate max-w-[100px] mt-0.5 font-mono">
                                {order.paymentId}
                              </p>
                            )}
                          </td>
                          <td>
                            <p className="text-sm font-medium text-gray-700">
                              {order.student?.fullName || '—'}
                            </p>
                            <p className="text-xs text-gray-400">{order.student?.studentId}</p>
                          </td>
                          <td>
                            <div>
                              {(order.items || []).slice(0, 2).map((item, i) => (
                                <p key={i} className="text-xs text-gray-600">
                                  {truncateText(item.product?.name || item.name || 'Item', 20)} ×{item.quantity}
                                </p>
                              ))}
                              {order.items?.length > 2 && (
                                <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </td>
                          <td>
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text,
                                border: `1px solid ${statusStyle.border}`,
                              }}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td>
                            <p className="text-xs text-gray-600">{formatDate(order.createdAt, 'short')}</p>
                            <p className="text-xs text-gray-400">{formatDate(order.createdAt, 'time')}</p>
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 rounded-xl text-blue-600 hover:bg-gray-50 transition-colors"
                                title="View Order"
                              >
                                <HiEye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex items-center justify-between mt-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <HiChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-9 w-9 rounded-xl text-sm font-medium transition-all ${
                        p === currentPage ? 'text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={p === currentPage ? {
                        background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
                        boxShadow: '0 2px 10px rgba(37,99,235,0.2)',
                      } : {
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <HiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${formatOrderId(selectedOrder?._id)}`}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Student Info */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(248,250,255,0.8)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Student Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-700">{selectedOrder.student?.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Student ID</p>
                  <p className="text-sm font-medium text-gray-700">{selectedOrder.student?.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-700">{selectedOrder.student?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm font-medium text-gray-700">{selectedOrder.student?.department}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Items</h3>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl overflow-hidden" style={{ background: 'rgba(248,250,255,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {item.product?.image ? (
                          <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">📦</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{item.product?.name || item.name}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gradient-blue">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Payment & Dates */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(248,250,255,0.8)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Payment</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Payment ID</p>
                  <p className="text-xs font-medium text-gray-700 break-all font-mono">{selectedOrder.paymentId || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Order Date</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(selectedOrder.createdAt, 'datetime')}</p>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Current Status</p>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: getStatusStyle(selectedOrder.status).bg,
                    color: getStatusStyle(selectedOrder.status).text,
                    border: `1px solid ${getStatusStyle(selectedOrder.status).border}`,
                  }}
                >
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>
              <StatusActions order={selectedOrder} />
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default AdminOrders
