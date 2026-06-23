import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
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
    <div className="min-h-screen bg-white flex">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <AnimatedBackground particleCount={15} />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <span className="text-5xl">🍽️</span>
          </div>
          <h1 className="text-4xl font-bold font-display text-white mb-4 leading-tight">
            Smart Canteen
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Order food & stationery from your college canteen — skip the queue, pay online, collect with QR.
          </p>

          {/* Feature bullets */}
          <div className="space-y-3 text-left">
            {[
              { emoji: '⚡', text: 'No more waiting in queues' },
              { emoji: '💳', text: 'Secure online payments' },
              { emoji: '📱', text: 'QR code item collection' },
              { emoji: '📋', text: 'Track all your orders' },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/90 text-sm">
                <span className="text-xl">{emoji}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <span className="font-bold font-display text-textPrimary text-xl">Smart Canteen</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold font-display text-textPrimary">Welcome back</h2>
            <p className="text-textSecondary mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  className={`form-input pl-10 ${errors.email ? 'border-danger ring-1 ring-danger' : ''}`}
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
                <label htmlFor="password" className="form-label mb-0">Password</label>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`form-input pl-10 pr-10 ${errors.password ? 'border-danger ring-1 ring-danger' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-textSecondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
              Create account
            </Link>
          </p>


        </motion.div>
      </div>
    </div>
  )
}
