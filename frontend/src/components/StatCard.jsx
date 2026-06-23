import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, subValue, color = 'blue', trend }) {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-gradient-to-br from-green-50 to-green-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-gradient-to-br from-red-50 to-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', iconBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100' },
  }

  const cls = colorClasses[color] || colorClasses.blue

  return (
    <motion.div
      className="card p-5 shadow-soft hover:shadow-elevated transition-shadow duration-200"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-textSecondary">{label}</p>
          <p className="text-2xl font-bold text-textPrimary mt-1 tabular-nums">{value}</p>
          {subValue && (
            <p className="text-xs text-textSecondary mt-1">{subValue}</p>
          )}
          {trend !== undefined && (
            <p className={`text-xs font-medium mt-1.5 ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${cls.iconBg} rounded-2xl flex items-center justify-center shrink-0 ml-3`}>
          <Icon size={22} className={cls.text} />
        </div>
      </div>
    </motion.div>
  )
}
