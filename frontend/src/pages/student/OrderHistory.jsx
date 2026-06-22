import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, getStatusStyle, getStatusLabel, formatOrderId } from '../../utils/helpers'
import { HiClipboardList, HiEye, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

const ITEMS_PER_PAGE = 8

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalOrders > 0 ? `${totalOrders} total order${totalOrders !== 1 ? 's' : ''}` : 'No orders yet'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <HiClipboardList className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">No orders yet</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              Place your first order from the canteen!
            </p>
            <Link to="/student/home" className="mt-5 btn-primary">
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3.5">
                      Order ID
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3.5">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3.5">
                      Items
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3.5">
                      Total
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3.5">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3.5">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => {
                    const statusStyle = getStatusStyle(order.status)
                    const itemCount = order.items?.length || 0

                    return (
                      <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatOrderId(order._id)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">
                            {formatDate(order.createdAt, 'short')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(order.createdAt, 'time')}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/student/orders/${order._id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
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
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {orders.map((order) => {
                const statusStyle = getStatusStyle(order.status)
                const itemCount = order.items?.length || 0

                return (
                  <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{formatOrderId(order._id)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt, 'datetime')}</p>
                      </div>
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
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                        <p className="text-sm font-bold text-primary-600">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      <Link
                        to={`/student/orders/${order._id}`}
                        className="btn-secondary text-xs flex items-center gap-1"
                      >
                        <HiEye className="h-3.5 w-3.5" />
                        View Details
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <HiChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
