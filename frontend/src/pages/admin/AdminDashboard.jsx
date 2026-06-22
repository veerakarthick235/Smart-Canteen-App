import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import StatCard from '../../components/StatCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, getStatusStyle, getStatusLabel, formatOrderId } from '../../utils/helpers'
import {
  HiCurrencyRupee, HiShoppingBag, HiClock, HiCheckCircle,
  HiRefresh, HiClipboardList, HiBan, HiEye
} from 'react-icons/hi'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/orders', { params: { limit: 10, sort: '-createdAt' } }),
      ])
      setStats(statsRes.data.data || statsRes.data)
      const ordersData = ordersRes.data.data || ordersRes.data
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 10) : ordersData.orders?.slice(0, 10) || [])
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const statCards = stats
    ? [
        {
          label: 'Total Revenue',
          value: stats.totalRevenue || 0,
          icon: HiCurrencyRupee,
          iconBg: 'bg-green-50',
          iconColor: 'text-green-600',
          prefix: '₹',
        },
        {
          label: 'Total Orders',
          value: stats.totalOrders || 0,
          icon: HiShoppingBag,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
        },
        {
          label: "Today's Orders",
          value: stats.todayOrders || 0,
          icon: HiClipboardList,
          iconBg: 'bg-purple-50',
          iconColor: 'text-purple-600',
        },
        {
          label: 'Paid Orders',
          value: stats.paidOrders || 0,
          icon: HiCheckCircle,
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
        },
        {
          label: 'Completed Orders',
          value: stats.completedOrders || 0,
          icon: HiCheckCircle,
          iconBg: 'bg-teal-50',
          iconColor: 'text-teal-600',
        },
        {
          label: 'Pending Orders',
          value: stats.pendingOrders || 0,
          icon: HiClock,
          iconBg: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
        },
      ]
    : []

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Overview of canteen operations</p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 btn-secondary text-sm"
          >
            <HiRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { to: '/admin/scanner', label: 'Scan QR Code', icon: '📷', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
                  { to: '/admin/orders', label: 'Manage Orders', icon: '📋', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
                  { to: '/admin/products', label: 'Add Product', icon: '➕', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
                  { to: '/admin/analytics', label: 'View Analytics', icon: '📊', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
                ].map(({ to, label, icon, bg, text, border }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${border} ${bg} hover:shadow-sm transition-all`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className={`text-xs font-semibold ${text} text-center`}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-card">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
                <Link
                  to="/admin/orders"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <HiShoppingBag className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No orders yet</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Order ID</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Student</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Items</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Total</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentOrders.map((order) => {
                        const statusStyle = getStatusStyle(order.status)
                        return (
                          <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3.5">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatOrderId(order._id)}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <p className="text-sm font-medium text-gray-900">
                                {order.student?.fullName || '—'}
                              </p>
                              <p className="text-xs text-gray-500">{order.student?.studentId}</p>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-sm text-gray-700">
                                {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-sm font-bold text-gray-900">
                                {formatCurrency(order.totalAmount)}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
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
                            <td className="px-6 py-3.5">
                              <p className="text-sm text-gray-600">{formatDate(order.createdAt, 'short')}</p>
                              <p className="text-xs text-gray-400">{formatDate(order.createdAt, 'time')}</p>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <Link
                                to="/admin/orders"
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
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
