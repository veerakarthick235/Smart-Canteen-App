import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-card-lg w-full ${sizeClasses[size]} animate-slide-up max-h-[90vh] flex flex-col`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
            <h2 className="text-lg font-bold text-textPrimary">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-bgLight text-textSecondary hover:text-textPrimary transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
