import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

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
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-2xl font-extrabold font-display text-white tracking-tight">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Overview of canteen operations</p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            <HiRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {statCards.map((card) => (
                <motion.div key={card.label} variants={cardVariants}>
                  <StatCard {...card} />
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h2 className="text-base font-semibold font-display text-white mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { to: '/admin/scanner', label: 'Scan QR Code', icon: '📷', gradient: 'from-blue-600 to-cyan-500' },
                  { to: '/admin/orders', label: 'Manage Orders', icon: '📋', gradient: 'from-purple-600 to-violet-500' },
                  { to: '/admin/products', label: 'Add Product', icon: '➕', gradient: 'from-emerald-600 to-green-500' },
                  { to: '/admin/analytics', label: 'View Analytics', icon: '📊', gradient: 'from-orange-600 to-amber-500' },
                ].map(({ to, label, icon, gradient }) => (
                  <motion.div key={to} whileHover={{ y: -4, borderColor: 'rgba(37,99,235,0.2)' }}>
                    <Link
                      to={to}
                      className="card flex flex-col items-center justify-center gap-3 p-5 rounded-2xl hover:border-blue-500/20 transition-all duration-300 group"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                        style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}
                      >
                        <span className="text-xl">{icon}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-300 text-center group-hover:text-white transition-colors">{label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-base font-semibold font-display text-white">Recent Orders</h2>
                <Link
                  to="/admin/orders"
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  View all →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <HiShoppingBag className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No orders yet</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Student</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        const statusStyle = getStatusStyle(order.status)
                        return (
                          <tr key={order._id}>
                            <td>
                              <span className="text-sm font-semibold text-white">
                                {formatOrderId(order._id)}
                              </span>
                            </td>
                            <td>
                              <p className="text-sm font-medium text-slate-200">
                                {order.student?.fullName || '—'}
                              </p>
                              <p className="text-xs text-slate-500">{order.student?.studentId}</p>
                            </td>
                            <td>
                              <span className="text-sm text-slate-300">
                                {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                              </span>
                            </td>
                            <td>
                              <span className="text-sm font-bold text-white">
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
                              <p className="text-sm text-slate-300">{formatDate(order.createdAt, 'short')}</p>
                              <p className="text-xs text-slate-500">{formatDate(order.createdAt, 'time')}</p>
                            </td>
                            <td className="text-right">
                              <Link
                                to="/admin/orders"
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
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
