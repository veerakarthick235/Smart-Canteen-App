import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal Panel */}
          <motion.div
            className={`relative glass-strong rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden`}
            style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(37,99,235,0.08)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Gradient border overlay */}
            <div className="gradient-border" />

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06] shrink-0">
                <h2 className="text-lg font-bold text-white font-display tracking-tight">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <FiX size={20} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 text-slate-300">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 border-t border-white/[0.06] shrink-0" style={{ background: 'rgba(15,23,42,0.5)' }}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
