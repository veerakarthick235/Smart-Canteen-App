import { useState, useEffect } from 'react'
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

      const res = await api.get('/api/orders', { params })
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
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus })
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
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <HiCheck className="h-3.5 w-3.5" />}
            Complete
          </button>
        )}
        {(order.status === 'pending' || order.status === 'paid') && (
          <button
            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500 text-sm mt-1">
              {totalOrders} total order{totalOrders !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => fetchOrders(currentPage)}
            className="flex items-center gap-2 btn-secondary text-sm"
          >
            <HiRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
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
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] bg-white rounded-xl border border-gray-100 shadow-card">
            <p className="text-gray-400 font-medium">No orders found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Order</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Student</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Items</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Total</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Date</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => {
                      const statusStyle = getStatusStyle(order.status)
                      return (
                        <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatOrderId(order._id)}
                            </span>
                            {order.paymentId && (
                              <p className="text-xs text-gray-400 truncate max-w-[100px] mt-0.5">
                                {order.paymentId}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-medium text-gray-900">
                              {order.student?.fullName || '—'}
                            </p>
                            <p className="text-xs text-gray-500">{order.student?.studentId}</p>
                          </td>
                          <td className="px-5 py-3.5">
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
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
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
                          <td className="px-5 py-3.5">
                            <p className="text-xs text-gray-600">{formatDate(order.createdAt, 'short')}</p>
                            <p className="text-xs text-gray-400">{formatDate(order.createdAt, 'time')}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <HiChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium ${
                        p === currentPage ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <HiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
          <div className="space-y-4">
            {/* Student Info */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Student Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.student?.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student ID</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.student?.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.student?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.student?.department}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Items</h3>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 overflow-hidden">
                        {item.product?.image ? (
                          <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">📦</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product?.name || item.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Payment & Dates */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Payment ID</p>
                  <p className="text-xs font-medium text-gray-900 break-all">{selectedOrder.paymentId || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedOrder.createdAt, 'datetime')}</p>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Status</p>
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
