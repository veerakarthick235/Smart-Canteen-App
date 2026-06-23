import { useMemo } from 'react'

/**
 * Premium animated background with vibrant mesh gradient orbs,
 * floating particles, and a subtle grid.
 */
export default function AnimatedBackground({ variant = 'default', className = '' }) {
  const orbs = useMemo(() => [
    { color: 'linear-gradient(135deg, #3B82F6, #06B6D4)', size: 700, top: '-18%', left: '-10%', delay: 0, duration: 16, opacity: 0.10 },
    { color: 'linear-gradient(135deg, #8B5CF6, #EC4899)', size: 550, top: '50%', right: '-14%', delay: 5, duration: 20, opacity: 0.08 },
    { color: 'linear-gradient(135deg, #06B6D4, #10B981)', size: 500, bottom: '-22%', left: '20%', delay: 8, duration: 18, opacity: 0.09 },
    { color: 'linear-gradient(135deg, #F59E0B, #EF4444)', size: 380, top: '12%', right: '18%', delay: 3, duration: 22, opacity: 0.06 },
    { color: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', size: 320, bottom: '15%', left: '55%', delay: 11, duration: 24, opacity: 0.07 },
    { color: 'linear-gradient(135deg, #EC4899, #F59E0B)', size: 260, top: '35%', left: '10%', delay: 14, duration: 26, opacity: 0.05 },
  ], [])

  const particles = useMemo(() =>
    Array.from({ length: variant === 'dense' ? 30 : 18 }, (_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      left: Math.random() * 100,
      delay: Math.random() * 35,
      duration: Math.random() * 25 + 20,
      opacity: Math.random() * 0.3 + 0.1,
      color: ['#3B82F6', '#06B6D4', '#8B5CF6', '#EC4899', '#10B981'][Math.floor(Math.random() * 5)],
    }))
  , [variant])

  return (
    <div className={`aurora-bg ${className}`} aria-hidden="true">
      {/* Mesh gradient background layer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(6,182,212,0.04) 0%, transparent 50%)',
      }} />

      {/* Vibrant orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="orb"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: orb.color,
            top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s`,
            opacity: orb.opacity,
            filter: 'blur(80px)',
          }}
        />
      ))}

      {/* Colorful floating particles */}
      {particles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            width: `${p.size}px`, height: `${p.size}px`,
            left: `${p.left}%`,
            borderRadius: '50%',
            background: p.color,
            animation: `particleFloat ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}40`,
          }}
        />
      ))}

      {/* Subtle dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Top gradient fade for nav readability */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
        background: 'linear-gradient(180deg, rgba(248,250,255,0.8) 0%, transparent 100%)',
      }} />
    </div>
  )
}
