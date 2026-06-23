import { motion } from 'framer-motion'

const GRADIENT_MAP = {
  green: { from: '#22C55E', to: '#10B981', shadow: 'rgba(34,197,94,0.3)' },
  blue: { from: '#2563EB', to: '#06B6D4', shadow: 'rgba(37,99,235,0.3)' },
  purple: { from: '#8B5CF6', to: '#7C3AED', shadow: 'rgba(139,92,246,0.3)' },
  emerald: { from: '#10B981', to: '#14B8A6', shadow: 'rgba(16,185,129,0.3)' },
  teal: { from: '#14B8A6', to: '#06B6D4', shadow: 'rgba(20,184,166,0.3)' },
  yellow: { from: '#F59E0B', to: '#EF4444', shadow: 'rgba(245,158,11,0.3)' },
  orange: { from: '#F97316', to: '#EF4444', shadow: 'rgba(249,115,22,0.3)' },
  red: { from: '#EF4444', to: '#F43F5E', shadow: 'rgba(239,68,68,0.3)' },
  cyan: { from: '#06B6D4', to: '#2563EB', shadow: 'rgba(6,182,212,0.3)' },
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
      className="relative rounded-2xl p-6 overflow-hidden group"
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
      whileHover={{
        y: -3,
        boxShadow: '0 12px 32px rgba(0,0,0,0.3), 0 0 20px ' + gradient.shadow.replace('0.3', '0.1'),
        borderColor: 'rgba(255,255,255,0.1)',
      }}
      transition={{ duration: 0.25 }}
    >
      {/* Decorative radial gradient accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/3 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, ${gradient.from}, transparent 70%)`,
        }}
      />

      <div className="flex items-start justify-between relative">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 tracking-wide">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2 tabular-nums font-display tracking-tight">
            {displayValue}
          </p>
          {subValue && (
            <p className="text-xs text-gray-400 mt mt-1.5">{subValue}</p>
          )}
          {trend !== undefined && (
            <div
              className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg text-xs font-bold ${
                trend >= 0
                  ? 'text-green-600'
                  : 'text-red-500'
              }`}
              style={{
                background: trend >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${trend >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ml-3"
          style={{
            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
            boxShadow: `0 4px 14px ${gradient.shadow}`,
          }}
        >
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}
