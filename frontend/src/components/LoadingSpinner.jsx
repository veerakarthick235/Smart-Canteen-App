export default function LoadingSpinner({ fullScreen = false, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-14 h-14 border-[3px]',
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-slate-700 border-t-blue-500 rounded-full animate-spin ${className}`}
        style={{
          boxShadow: '0 0 20px rgba(37,99,235,0.3), 0 0 40px rgba(37,99,235,0.1)',
        }}
      />
      <p className="text-sm text-slate-400 font-medium tracking-wide">Loading…</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          background: 'rgba(17,24,39,0.80)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
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
