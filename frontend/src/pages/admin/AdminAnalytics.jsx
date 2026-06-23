import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { FiTrendingUp, FiPackage, FiPieChart, FiCalendar } from 'react-icons/fi'
import AdminLayout from '../../components/AdminLayout.jsx'
import StatCard from '../../components/StatCard.jsx'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import api from '../../api/axios.js'
import { formatCurrency } from '../../utils/helpers.js'
import toast from 'react-hot-toast'

const CHART_COLORS = ['#60A5FA', '#22D3EE', '#A78BFA', '#4ADE80', '#FBBF24', '#F87171', '#FB923C']

const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {prefix === '₹' && entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.05) return null
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function AdminAnalytics() {
  const [revenueData, setRevenueData] = useState([])
  const [productsData, setProductsData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [dashboardStats, setDashboardStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [revenueDays, setRevenueDays] = useState(30)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [revRes, prodRes, catRes, dashRes] = await Promise.all([
        api.get(`/api/admin/analytics/revenue?days=${revenueDays}`),
        api.get('/api/admin/analytics/products?limit=10'),
        api.get('/api/admin/analytics/categories'),
        api.get('/api/admin/dashboard'),
      ])
      setRevenueData(revRes.data.data || [])
      setProductsData(prodRes.data.data || [])
      setCategoryData(catRes.data.data || [])
      setDashboardStats(dashRes.data.data || null)
    } catch {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [revenueDays])

  const totalRevenue = revenueData.reduce((s, d) => s + (d.revenue || 0), 0)
  const totalOrders = revenueData.reduce((s, d) => s + (d.orders || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-full py-20">
        <LoadingSpinner />
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          className="flex items-start justify-between mb-8 gap-4 flex-wrap"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Analytics</h1>
            <p className="text-gray-500 mt mt-1">Revenue trends, top products, and sales distribution</p>
          </div>
          <motion.button
            onClick={fetchAll}
            className="btn-secondary text-sm gap-2 shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiTrendingUp size={16} /> Refresh
          </motion.button>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: 'Period Revenue', value: formatCurrency(totalRevenue), sub: `Last ${revenueDays} days`, color: '#60A5FA' },
            { label: 'Period Orders', value: totalOrders, sub: 'Paid + Completed', color: '#22D3EE' },
            { label: 'Avg Order Value', value: formatCurrency(avgOrderValue), sub: 'Per transaction', color: '#A78BFA' },
            {
              label: 'Collection Rate',
              value: dashboardStats
                ? dashboardStats.completedOrders + dashboardStats.paidOrders > 0
                  ? `${Math.round((dashboardStats.completedOrders / (dashboardStats.completedOrders + dashboardStats.paidOrders)) * 100)}%`
                  : '—'
                : '—',
              sub: 'Orders collected',
              color: '#4ADE80',
            },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <div className="card p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold font-display" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt mt-1">{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          className="card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FiTrendingUp size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-900 font-display">Daily Revenue</h2>
            </div>
            <div className="flex gap-2">
              {[7, 14, 30, 60].map(d => (
                <button
                  key={d}
                  onClick={() => setRevenueDays(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    revenueDays === d
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  style={revenueDays === d ? {
                    background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
                    boxShadow: '0 2px 10px rgba(37,99,235,0.2)',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {revenueData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FiCalendar size={40} className="mx-auto mb-3 opacity-30" />
                <p>No revenue data for this period</p>
                <p className="text-sm mt-1">Revenue appears after successful payments</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickFormatter={v => {
                    const d = new Date(v)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                  axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                  tickLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                />
                <YAxis
                  yAxisId="revenue"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                  axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                  tickLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                  tickLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13, fontWeight: 500, color: '#94A3B8' }} />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#60A5FA"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#60A5FA', stroke: '#0F172A', strokeWidth: 2 }}
                />
                <Area
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#4ADE80"
                  strokeWidth={2}
                  fill="url(#ordersGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#4ADE80', stroke: '#0F172A', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Bottom: Top Products + Category Sales side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <FiPackage size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-900 font-display">Top Products</h2>
            </div>

            {productsData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No product data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={productsData.map(p => ({ name: p.name?.slice(0, 18) || 'Unknown', quantity: p.totalQuantity, revenue: p.totalRevenue }))}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                    tickLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                    tickLine={{ stroke: 'rgba(0,0,0,0.06)' }}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      name === 'revenue' ? formatCurrency(val) : val,
                      name === 'revenue' ? 'Revenue' : 'Qty Sold',
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      fontSize: 13,
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F8FAFC',
                    }}
                    itemStyle={{ color: '#94A3B8' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                  />
                  <Bar dataKey="quantity" name="Qty Sold" fill="#60A5FA" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Category Sales Pie */}
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <FiPieChart size={18} className="text-cyan-400" />
              <h2 className="font-bold text-gray-900 font-display">Sales by Category</h2>
            </div>

            {categoryData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No category data available
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={CustomPieLabel}
                      stroke="rgba(15,23,42,0.8)"
                      strokeWidth={2}
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), 'Revenue']}
                      contentStyle={{
                        borderRadius: 12,
                        fontSize: 13,
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#F8FAFC',
                      }}
                      itemStyle={{ color: '#94A3B8' }}
                      labelStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="space-y-2 mt-2">
                  {categoryData.map((cat, i) => (
                    <div key={cat.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length], boxShadow: `0 0 6px ${CHART_COLORS[i % CHART_COLORS.length]}50` }} />
                        <span className="text-gray-900 font-medium">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{formatCurrency(cat.revenue)}</span>
                        <span className="text-gray-400 ml-2 text-xs">({cat.quantity} items)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Order Status Breakdown */}
        {dashboardStats && (
          <motion.div
            className="card p-6 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="font-bold text-gray-900 mb-5 font-display">Order Status Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Orders', value: dashboardStats.totalOrders, color: '#F8FAFC' },
                { label: "Today's Orders", value: dashboardStats.todayOrders, color: '#60A5FA' },
                { label: 'Paid', value: dashboardStats.paidOrders, color: '#60A5FA' },
                { label: 'Collected', value: dashboardStats.completedOrders, color: '#4ADE80' },
                { label: 'Pending', value: dashboardStats.pendingOrders, color: '#FBBF24' },
                { label: 'Cancelled', value: dashboardStats.cancelledOrders, color: '#F87171' },
              ].map(({ label, value, color }) => (
                <motion.div
                  key={label}
                  className="text-center p-4 rounded-xl"
                  style={{
                    background: 'rgba(248,250,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                  whileHover={{ borderColor: 'rgba(37,99,235,0.2)', y: -2 }}
                >
                  <p className="text-3xl font-bold font-display" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-400 mt mt-1 font-medium">{label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  )
}
