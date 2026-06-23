import { useMemo } from 'react'

/**
 * Subtle animated floating particles background.
 * Pure CSS animations — no canvas, no WebGL, very lightweight.
 * Use on Login/Register pages for visual depth.
 */
export default function AnimatedBackground({ particleCount = 20, className = '' }) {
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: Math.random() * 20 + 25,
      opacity: Math.random() * 0.5 + 0.1,
    }))
  }, [particleCount])

  return (
    <div className={`particles-bg ${className}`} aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}
