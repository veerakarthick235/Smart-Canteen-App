import { useMemo } from 'react'

/**
 * Premium white-theme animated background with soft colored orbs + floating particles.
 * Subtle, elegant, and performant.
 */
export default function AnimatedBackground({ variant = 'default', className = '' }) {
  const orbs = useMemo(() => [
    { color: '#3B82F6', size: 600, top: '-15%', left: '-8%', delay: 0, duration: 14 },
    { color: '#06B6D4', size: 500, top: '55%', right: '-12%', delay: 4, duration: 18 },
    { color: '#8B5CF6', size: 400, bottom: '-20%', left: '25%', delay: 7, duration: 16 },
    { color: '#3B82F6', size: 350, top: '15%', right: '15%', delay: 2, duration: 20 },
    { color: '#EC4899', size: 280, bottom: '10%', left: '60%', delay: 10, duration: 22 },
  ], [])

  const particles = useMemo(() =>
    Array.from({ length: variant === 'dense' ? 25 : 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      delay: Math.random() * 30,
      duration: Math.random() * 30 + 25,
      opacity: Math.random() * 0.25 + 0.08,
    }))
  , [variant])

  return (
    <div className={`aurora-bg ${className}`} aria-hidden="true">
      {/* Soft colored orbs */}
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
            opacity: 0.06,
          }}
        />
      ))}
      {/* Floating particles */}
      {particles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            width: `${p.size}px`, height: `${p.size}px`,
            left: `${p.left}%`,
            borderRadius: '50%',
            background: 'rgba(37,99,235,0.15)',
            animation: `particleFloat ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
      {/* Subtle dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
    </div>
  )
}
