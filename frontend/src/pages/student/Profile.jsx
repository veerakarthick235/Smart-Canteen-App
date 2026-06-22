import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { getInitials } from '../../utils/helpers'
import { HiPencil, HiCheck, HiX, HiUser, HiMail, HiIdentification, HiAcademicCap, HiBookOpen } from 'react-icons/hi'

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'MBA', 'MCA']
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

  const yearLabel = YEARS.find((y) => y.value === user?.year)?.label || user?.year

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">View and update your account information</p>
        </div>

        {/* Avatar & Quick Stats */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-5">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-2xl font-bold text-white">
                {getInitials(user?.fullName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{user?.fullName}</h2>
              <p className="text-gray-500 text-sm truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                  Student
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {user?.department}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{orderCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Orders</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-xl font-bold text-gray-900">{user?.department || '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Department</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{yearLabel || '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Year</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <HiPencil className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <HiX className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={saving}
                  className="flex items-center gap-1 text-sm text-white font-medium px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? <LoadingSpinner size="sm" /> : <HiCheck className="h-3.5 w-3.5" />}
                  Save
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  {...register('fullName', {
                    required: 'Name is required',
                    minLength: { value: 3, message: 'Name too short' },
                  })}
                  className={`input-field ${errors.fullName ? 'border-red-400' : ''}`}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Department
                  </label>
                  <select
                    {...register('department', { required: 'Department required' })}
                    className={`input-field ${errors.department ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Year
                  </label>
                  <select
                    {...register('year', { required: 'Year required' })}
                    className={`input-field ${errors.year ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select year</option>
                    {YEARS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year.message}</p>}
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
                <div key={label} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
