export default function LoadingSpinner({ fullScreen = false, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-[3px]',
    md: 'w-10 h-10 border-4',
    lg: 'w-14 h-14 border-[5px]',
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-primary-100 border-t-primary-600 rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.15)] ${className}`}
      />
      <p className="text-sm text-textSecondary font-medium tracking-wide">Loading…</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  )
}
