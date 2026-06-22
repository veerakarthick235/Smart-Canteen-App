import { useState, useEffect } from 'react'
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

const CHART_COLORS = ['#2563EB', '#16A34A', '#EA580C', '#7C3AED', '#0891B2', '#DC2626', '#CA8A04']

const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-xl shadow-card-lg px-4 py-3 text-sm">
        <p className="font-semibold text-textPrimary mb-1">{label}</p>
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
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">Analytics</h1>
            <p className="text-textSecondary mt-1">Revenue trends, top products, and sales distribution</p>
          </div>
          <button onClick={fetchAll} className="btn-secondary text-sm gap-2 shrink-0">
            <FiTrendingUp size={16} /> Refresh
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">Period Revenue</p>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-textSecondary mt-1">Last {revenueDays} days</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">Period Orders</p>
            <p className="text-2xl font-bold text-textPrimary">{totalOrders}</p>
            <p className="text-xs text-textSecondary mt-1">Paid + Completed</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">Avg Order Value</p>
            <p className="text-2xl font-bold text-textPrimary">{formatCurrency(avgOrderValue)}</p>
            <p className="text-xs text-textSecondary mt-1">Per transaction</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide mb-1">Collection Rate</p>
            <p className="text-2xl font-bold text-success">
              {dashboardStats
                ? dashboardStats.completedOrders + dashboardStats.paidOrders > 0
                  ? `${Math.round((dashboardStats.completedOrders / (dashboardStats.completedOrders + dashboardStats.paidOrders)) * 100)}%`
                  : '—'
                : '—'
              }
            </p>
            <p className="text-xs text-textSecondary mt-1">Orders collected</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FiTrendingUp size={18} className="text-primary-600" />
              <h2 className="font-bold text-textPrimary">Daily Revenue</h2>
            </div>
            <div className="flex gap-2">
              {[7, 14, 30, 60].map(d => (
                <button
                  key={d}
                  onClick={() => setRevenueDays(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    revenueDays === d
                      ? 'bg-primary-600 text-white'
                      : 'bg-bgLight text-textSecondary hover:bg-border'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {revenueData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-textSecondary">
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
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={v => {
                    const d = new Date(v)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                />
                <YAxis
                  yAxisId="revenue"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                />
                <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13, fontWeight: 500 }} />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#2563EB' }}
                />
                <Area
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fill="url(#ordersGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#16A34A' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bottom: Top Products + Category Sales side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <FiPackage size={18} className="text-primary-600" />
              <h2 className="font-bold text-textPrimary">Top Products</h2>
            </div>

            {productsData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-textSecondary text-sm">
                No product data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={productsData.map(p => ({ name: p.name?.slice(0, 18) || 'Unknown', quantity: p.totalQuantity, revenue: p.totalRevenue }))}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val, name) => [
                      name === 'revenue' ? formatCurrency(val) : val,
                      name === 'revenue' ? 'Revenue' : 'Qty Sold',
                    ]}
                    contentStyle={{ borderRadius: 12, fontSize: 13, border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="quantity" name="Qty Sold" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Sales Pie */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <FiPieChart size={18} className="text-primary-600" />
              <h2 className="font-bold text-textPrimary">Sales by Category</h2>
            </div>

            {categoryData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-textSecondary text-sm">
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
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), 'Revenue']}
                      contentStyle={{ borderRadius: 12, fontSize: 13, border: '1px solid #E2E8F0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="space-y-2 mt-2">
                  {categoryData.map((cat, i) => (
                    <div key={cat.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-textPrimary font-medium">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-textPrimary">{formatCurrency(cat.revenue)}</span>
                        <span className="text-textSecondary ml-2 text-xs">({cat.quantity} items)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        {dashboardStats && (
          <div className="card p-6 mt-6">
            <h2 className="font-bold text-textPrimary mb-5">Order Status Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Orders', value: dashboardStats.totalOrders, color: 'text-textPrimary' },
                { label: 'Today\'s Orders', value: dashboardStats.todayOrders, color: 'text-primary-600' },
                { label: 'Paid', value: dashboardStats.paidOrders, color: 'text-blue-600' },
                { label: 'Collected', value: dashboardStats.completedOrders, color: 'text-success' },
                { label: 'Pending', value: dashboardStats.pendingOrders, color: 'text-amber-600' },
                { label: 'Cancelled', value: dashboardStats.cancelledOrders, color: 'text-danger' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-bgLight">
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-textSecondary mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
