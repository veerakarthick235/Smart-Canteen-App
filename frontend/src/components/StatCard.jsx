import { motion } from 'framer-motion'

const GRADIENT_MAP = {
  green: 'from-emerald-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-violet-600',
  emerald: 'from-emerald-500 to-teal-600',
  teal: 'from-teal-500 to-cyan-600',
  yellow: 'from-amber-400 to-orange-500',
  orange: 'from-orange-500 to-red-500',
  red: 'from-red-500 to-rose-600',
  cyan: 'from-cyan-500 to-blue-500',
}

export default function StatCard({ icon: Icon, label, value, subValue, prefix, iconBg, iconColor, trend }) {
  // Determine gradient color from iconBg or iconColor
  let gradientKey = 'blue'
  if (iconColor) {
    const match = iconColor.match(/text-(\w+)-/)
    if (match) gradientKey = match[1]
  }
  const gradient = GRADIENT_MAP[gradientKey] || GRADIENT_MAP.blue

  const displayValue = prefix ? `${prefix}${typeof value === 'number' ? value.toLocaleString('en-IN') : value}` : (typeof value === 'number' ? value.toLocaleString('en-IN') : value)

  return (
    <motion.div
      className="relative bg-white rounded-2xl p-6 overflow-hidden group"
      style={{
        border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
      }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)' }}
      transition={{ duration: 0.25 }}
    >
      {/* Decorative gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-[0.04] rounded-full -translate-y-1/2 translate-x-1/3 group-hover:opacity-[0.08] transition-opacity duration-300`} />

      <div className="flex items-start justify-between relative">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-textSecondary tracking-wide">{label}</p>
          <p className="text-3xl font-extrabold text-textPrimary mt-2 tabular-nums font-display tracking-tight">
            {displayValue}
          </p>
          {subValue && (
            <p className="text-xs text-textSecondary mt-1.5">{subValue}</p>
          )}
          {trend !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg text-xs font-bold ${trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 ml-3 shadow-lg`}
          style={{ boxShadow: `0 4px 14px rgba(0,0,0,0.15)` }}
        >
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}
