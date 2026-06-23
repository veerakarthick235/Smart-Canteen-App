import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { getInitials } from '../../utils/helpers'
import { HiPencil, HiCheck, HiX, HiUser, HiMail, HiIdentification, HiAcademicCap, HiBookOpen } from 'react-icons/hi'

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AI&DS', 'MBA', 'MCA', 'Civil', 'Architecture', 'Pharmacy', 'BCA', 'BSc']
const YEARS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
  { value: 'PG', label: 'Post Graduate' },
]

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [orderCount, setOrderCount] = useState(0)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      department: user?.department || '',
      year: user?.year || '',
    },
  })

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const res = await api.get('/api/orders/my-orders', { params: { limit: 1 } })
        const data = res.data.data || res.data
        setOrderCount(data.total || (Array.isArray(data) ? data.length : 0))
      } catch {}
    }
    fetchOrderCount()
  }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const res = await api.put('/api/auth/profile', data)
      const updatedUser = res.data.data || res.data
      updateUser({ ...user, ...updatedUser })
      toast.success('Profile updated successfully!')
      setEditing(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    reset({
      fullName: user?.fullName || '',
      department: user?.department || '',
      year: user?.year || '',
    })
    setEditing(false)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WEBP images are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const { fileToBase64 } = await import('../../utils/helpers')
      const base64 = await fileToBase64(file)

      const res = await api.put('/api/auth/me/avatar', { image: base64 })
      const updatedUser = res.data.data
      updateUser({ ...user, ...updatedUser })
      toast.success('Profile picture updated!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile picture')
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const yearLabel = YEARS.find((y) => y.value === user?.year)?.label || user?.year

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight">My Profile</h1>
          <p className="text-gray-500 text-sm text-sm mt-1">View and update your account information</p>
        </motion.div>

        {/* Avatar & Quick Stats */}
        <motion.div
          className="glass-strong rounded-2xl p-6 mb-5 relative overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="gradient-border" />

          <div className="relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/[0.1]" style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', boxShadow: '0 4px 20px rgba(37,99,235,0.3)' }}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      {getInitials(user?.fullName)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer backdrop-blur-sm"
                >
                  {uploadingAvatar ? <LoadingSpinner size="sm" className="text-white" /> : <HiPencil className="h-6 w-6 text-white" />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate font-display">{user?.fullName}</h2>
                <p className="text-gray-500 text-sm text-sm truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-blue-500/20" style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD' }}>
                    Student
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-200" style={{ background: 'rgba(0,0,0,0.06)', color: '#94A3B8' }}>
                    {user?.department}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{orderCount}</p>
                <p className="text-xs text-gray-400 mt mt-0.5">Total Orders</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-xl font-bold text-gray-900">{user?.department || '—'}</p>
                <p className="text-xs text-gray-400 mt mt-0.5">Department</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{yearLabel || '—'}</p>
                <p className="text-xs text-gray-400 mt mt-0.5">Year</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900 font-display">Personal Information</h3>
            {!editing ? (
              <motion.button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20"
                style={{ background: 'rgba(37,99,235,0.1)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HiPencil className="h-3.5 w-3.5" />
                Edit
              </motion.button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <HiX className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit(onSubmit)}
                  disabled={saving}
                  className="flex items-center gap-1 text-sm text-white font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', boxShadow: '0 2px 10px rgba(37,99,235,0.2)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? <LoadingSpinner size="sm" /> : <HiCheck className="h-3.5 w-3.5" />}
                  Save
                </motion.button>
              </div>
            )}
          </div>

          {editing ? (
            <form className="space-y-4">
              <div>
                <label className="form-label">
                  Full Name
                </label>
                <input
                  {...register('fullName', {
                    required: 'Name is required',
                    minLength: { value: 3, message: 'Name too short' },
                  })}
                  className={`form-input ${errors.fullName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Department
                  </label>
                  <select
                    {...register('department', { required: 'Department required' })}
                    className={`form-input ${errors.department ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.department && <p className="form-error">{errors.department.message}</p>}
                </div>

                <div>
                  <label className="form-label">
                    Year
                  </label>
                  <select
                    {...register('year', { required: 'Year required' })}
                    className={`form-input ${errors.year ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  >
                    <option value="">Select year</option>
                    {YEARS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {errors.year && <p className="form-error">{errors.year.message}</p>}
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[
                { icon: HiUser, label: 'Full Name', value: user?.fullName },
                { icon: HiMail, label: 'Email Address', value: user?.email },
                { icon: HiIdentification, label: 'Student ID', value: user?.studentId },
                { icon: HiAcademicCap, label: 'Department', value: user?.department },
                { icon: HiBookOpen, label: 'Year', value: yearLabel },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-0">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200" style={{ background: '#F8FAFC' }}>
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5 truncate">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
