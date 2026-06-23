import { motion } from 'framer-motion'

const GRADIENT_MAP = {
  green: { from: '#22C55E', to: '#10B981', shadow: 'rgba(34,197,94,0.3)', light: 'rgba(34,197,94,0.06)' },
  blue: { from: '#2563EB', to: '#06B6D4', shadow: 'rgba(37,99,235,0.3)', light: 'rgba(37,99,235,0.06)' },
  purple: { from: '#8B5CF6', to: '#7C3AED', shadow: 'rgba(139,92,246,0.3)', light: 'rgba(139,92,246,0.06)' },
  emerald: { from: '#10B981', to: '#14B8A6', shadow: 'rgba(16,185,129,0.3)', light: 'rgba(16,185,129,0.06)' },
  teal: { from: '#14B8A6', to: '#06B6D4', shadow: 'rgba(20,184,166,0.3)', light: 'rgba(20,184,166,0.06)' },
  yellow: { from: '#F59E0B', to: '#EF4444', shadow: 'rgba(245,158,11,0.3)', light: 'rgba(245,158,11,0.06)' },
  orange: { from: '#F97316', to: '#EF4444', shadow: 'rgba(249,115,22,0.3)', light: 'rgba(249,115,22,0.06)' },
  red: { from: '#EF4444', to: '#F43F5E', shadow: 'rgba(239,68,68,0.3)', light: 'rgba(239,68,68,0.06)' },
  cyan: { from: '#06B6D4', to: '#2563EB', shadow: 'rgba(6,182,212,0.3)', light: 'rgba(6,182,212,0.06)' },
}

export default function StatCard({ icon: Icon, label, value, subValue, prefix, iconBg, iconColor, trend }) {
  let gradientKey = 'blue'
  if (iconColor) {
    const match = iconColor.match(/text-(\w+)-/)
    if (match) gradientKey = match[1]
  }
  const gradient = GRADIENT_MAP[gradientKey] || GRADIENT_MAP.blue
  const displayValue = prefix ? `${prefix}${typeof value === 'number' ? value.toLocaleString('en-IN') : value}` : (typeof value === 'number' ? value.toLocaleString('en-IN') : value)

  return (
    <motion.div
      className="relative rounded-3xl p-6 overflow-hidden group cursor-default"
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
      whileHover={{
        y: -4,
        borderColor: 'rgba(37,99,235,0.15)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Colored accent gradient at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
        style={{
          background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`,
        }}
      />
      {/* Decorative radial gradient accent */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full -translate-y-1/2 translate-x-1/4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${gradient.from}, transparent 70%)`,
        }}
      />

      <div className="flex items-start justify-between relative">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2 tabular-nums font-display tracking-tight">
            {displayValue}
          </p>
          {subValue && (
            <p className="text-xs text-gray-400 mt-1.5">{subValue}</p>
          )}
          {trend !== undefined && (
            <div
              className={`inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                trend >= 0 ? 'text-green-600' : 'text-red-500'
              }`}
              style={{
                background: trend >= 0 ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.06))' : 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(244,63,94,0.06))',
                border: `1px solid ${trend >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
              }}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <motion.div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ml-3"
          style={{
            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <Icon size={24} className="text-white" />
        </motion.div>
      </div>
    </motion.div>
  )
}
