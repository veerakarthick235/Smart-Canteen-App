import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import AnimatedBackground from '../components/AnimatedBackground.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', data)
      if (res.data.success) {
        login(res.data.data)
        toast.success('Welcome back!')
        const role = res.data.data.user.role
        navigate(role === 'admin' ? '/admin/dashboard' : '/student/home')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 40%, #0EA5E9 100%)',
      }}>
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-white/3 rounded-full" />

        <AnimatedBackground particleCount={18} />

        <motion.div
          className="relative z-10 text-center max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 bg-white/15 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md shadow-2xl border border-white/20">
            <span className="text-6xl">🍽️</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-5 leading-tight font-display tracking-tight">
            Smart Canteen
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Order food & stationery from your college canteen — skip the queue, pay online, collect with QR.
          </p>

          {/* Feature cards */}
          <div className="space-y-3 text-left">
            {[
              { emoji: '⚡', text: 'No more waiting in queues', desc: 'Order ahead from anywhere' },
              { emoji: '💳', text: 'Secure online payments', desc: 'Powered by Razorpay' },
              { emoji: '📱', text: 'QR code collection', desc: 'Scan and collect instantly' },
              { emoji: '📋', text: 'Track your orders', desc: 'Real-time order status' },
            ].map(({ emoji, text, desc }) => (
              <div key={text} className="flex items-center gap-4 bg-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-sm border border-white/10">
                <span className="text-2xl w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">{emoji}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{text}</p>
                  <p className="text-blue-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50/50">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md" style={{
              background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
            }}>
              <span className="text-2xl">🍽️</span>
            </div>
            <span className="font-extrabold font-display text-textPrimary text-xl tracking-tight">Smart Canteen</span>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10" style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)',
            border: '1px solid rgba(226,232,240,0.6)',
          }}>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold font-display text-textPrimary tracking-tight">Welcome back</h2>
              <p className="text-textSecondary mt-2">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="form-label font-semibold">Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@college.edu"
                    className={`form-input pl-11 py-3 ${errors.email ? 'border-danger ring-1 ring-danger' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    })}
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="form-label mb-0 font-semibold">Password</label>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`form-input pl-11 pr-11 py-3 ${errors.password ? 'border-danger ring-1 ring-danger' : ''}`}
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-base font-bold text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                }}
                onMouseEnter={(e) => { if (!e.target.disabled) e.target.style.boxShadow = '0 6px 20px rgba(37,99,235,0.4)' }}
                onMouseLeave={(e) => { e.target.style.boxShadow = '0 4px 14px rgba(37,99,235,0.3)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <>Sign In <FiArrowRight size={18} /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-textSecondary mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
