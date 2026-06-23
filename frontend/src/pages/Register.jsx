import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBook, FiHash } from 'react-icons/fi'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import AnimatedBackground from '../components/AnimatedBackground.jsx'

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AI&DS', 'MBA', 'MCA', 'Civil', 'Architecture', 'Pharmacy', 'BCA', 'BSc']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG']

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password', '')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = data
      const res = await api.post('/api/auth/register', payload)
      if (res.data.success) {
        login(res.data.data)
        toast.success('Account created successfully!')
        navigate('/student/home')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (error) =>
    `form-input ${error ? 'border-red-500 ring-1 ring-red-500' : ''}`

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <AnimatedBackground particleCount={12} />

      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />

      <motion.div
        className="w-full max-w-xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}>
              <span className="text-2xl">🍽️</span>
            </div>
            <span className="font-bold font-display text-gray-900 text-xl">Smart Canteen</span>
          </Link>
          <h1 className="text-3xl font-bold font-display text-gray-900 tracking-tight">Create your account</h1>
          <p className="text-gray-500 mt mt-1.5">Join Smart Canteen and skip the queue</p>
        </div>

        {/* Form Card */}
        <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
          <div className="gradient-border" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  className={`${inputClass(errors.fullName)} pl-10`}
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                />
              </div>
              {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">College Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  className={`${inputClass(errors.email)} pl-10`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
                  })}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="form-label">Student ID / Roll Number</label>
              <div className="relative">
                <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="studentId"
                  type="text"
                  placeholder="e.g. 21CSE001"
                  className={`${inputClass(errors.studentId)} pl-10`}
                  {...register('studentId', {
                    required: 'Student ID is required',
                    minLength: { value: 3, message: 'Minimum 3 characters' },
                  })}
                />
              </div>
              {errors.studentId && <p className="form-error">{errors.studentId.message}</p>}
            </div>

            {/* Department + Year (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="form-label">Department</label>
                <div className="relative">
                  <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  <select
                    id="department"
                    className={`${inputClass(errors.department)} pl-10 appearance-none`}
                    {...register('department', { required: 'Department is required' })}
                  >
                    <option value="">Select…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {errors.department && <p className="form-error">{errors.department.message}</p>}
              </div>

              <div>
                <label htmlFor="year" className="form-label">Year</label>
                <select
                  id="year"
                  className={inputClass(errors.year)}
                  {...register('year', { required: 'Year is required' })}
                >
                  <option value="">Select…</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.year && <p className="form-error">{errors.year.message}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  className={`${inputClass(errors.password)} pl-10 pr-10`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className={`${inputClass(errors.confirmPassword)} pl-10 pr-10`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: v => v === password || 'Passwords do not match',
                  })}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-bold text-gray-900 rounded-xl mt-2 flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 6px 28px rgba(37,99,235,0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute inset-0 overflow-hidden rounded-xl">
                <span className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] animate-[shine_3s_ease-in-out_infinite]" />
              </span>
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </span>
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
