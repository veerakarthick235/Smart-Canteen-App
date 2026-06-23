import { useMemo } from 'react'

/**
 * Premium animated background with aurora orbs + floating particles.
 * Pure CSS — no canvas, lightweight, GPU-accelerated.
 */
export default function AnimatedBackground({ variant = 'default', className = '' }) {
  const orbs = useMemo(() => [
    { color: '#2563EB', size: 600, top: '-10%', left: '-5%', delay: 0, duration: 12 },
    { color: '#06B6D4', size: 500, top: '60%', right: '-10%', delay: 3, duration: 15 },
    { color: '#8B5CF6', size: 450, bottom: '-15%', left: '30%', delay: 6, duration: 18 },
    { color: '#2563EB', size: 350, top: '20%', right: '20%', delay: 2, duration: 14 },
    { color: '#06B6D4', size: 300, bottom: '10%', left: '5%', delay: 8, duration: 16 },
  ], [])

  const particles = useMemo(() =>
    Array.from({ length: variant === 'dense' ? 30 : 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      delay: Math.random() * 25,
      duration: Math.random() * 25 + 20,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  , [variant])

  return (
    <div className={`aurora-bg ${className}`} aria-hidden="true">
      {/* Aurora orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="orb"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s`,
          }}
        />
      ))}
      {/* Floating particles */}
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`, height: `${p.size}px`,
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
            position: 'absolute', borderRadius: '50%',
            background: 'rgba(96,165,250,0.3)',
          }}
        />
      ))}
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
    </div>
  )
}
