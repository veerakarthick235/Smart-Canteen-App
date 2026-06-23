import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../components/AdminLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { formatCurrency, getCategoryColor, truncateText, fileToBase64 } from '../../utils/helpers'
import {
  HiPlus, HiPencil, HiTrash, HiSearch, HiPhotograph,
  HiX, HiRefresh, HiFilter
} from 'react-icons/hi'

const CATEGORIES = ['Food', 'Beverages', 'Stationery']

const defaultProduct = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  image: '',
  isAvailable: true,
}

const getCategoryBadgeClass = (category) => {
  switch (category?.toLowerCase()) {
    case 'food': return 'badge-food'
    case 'beverages': return 'badge-beverages'
    case 'stationery': return 'badge-stationery'
    default: return 'badge'
  }
}

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: defaultProduct })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (categoryFilter) params.category = categoryFilter
      const res = await api.get('/api/products', { params })
      const data = res.data.data || res.data
      setProducts(Array.isArray(data) ? data : data.products || [])
    } catch {
      toast.error('Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [search, categoryFilter])

  const openAddModal = () => {
    setEditingProduct(null)
    reset(defaultProduct)
    setImagePreview(null)
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    reset({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock || '',
      isAvailable: product.isAvailable !== false,
    })
    setImagePreview(product.image || null)
    setModalOpen(true)
  }

  const handleImageChange = async (e) => {
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
    const base64 = await fileToBase64(file)
    setImagePreview(base64)
    setValue('image', base64)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        image: imagePreview || data.image || '',
      }

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, payload)
        toast.success('Product updated!')
      } else {
        await api.post('/api/products', payload)
        toast.success('Product added!')
      }
      setModalOpen(false)
      fetchProducts()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await api.delete(`/api/products/${deleteModal._id}`)
      toast.success('Product deleted')
      setDeleteModal(null)
      fetchProducts()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you SURE you want to delete ALL products? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await api.get('/api/products?limit=1000')
      const allProducts = Array.isArray(res.data.data) ? res.data.data : res.data.data.products || []
      
      const promises = allProducts.map(p => api.delete(`/api/products/${p._id}`).catch(() => {}))
      await Promise.all(promises)
      
      toast.success('All products deleted successfully')
      fetchProducts()
    } catch {
      toast.error('Failed to delete some products')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleAvailability = async (product) => {
    try {
      await api.put(`/api/products/${product._id}`, {
        isAvailable: !product.isAvailable,
      })
      toast.success(`Product ${product.isAvailable ? 'hidden' : 'shown'}`)
      fetchProducts()
    } catch {
      toast.error('Failed to update availability')
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-2xl font-extrabold font-display text-white tracking-tight">Products</h1>
            <p className="text-slate-400 text-sm mt-1">Manage canteen & stationery items</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDeleteAll} 
              disabled={deleting || products.length === 0}
              className="btn-danger text-sm py-2.5 px-4"
            >
              <HiTrash className="h-4 w-4" />
              Delete All
            </button>
            <button onClick={openAddModal} className="btn-primary text-sm py-2.5">
              <HiPlus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="card p-4 mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-9"
              />
            </div>
            <div className="flex gap-2">
              {['', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                  style={categoryFilter === cat ? { boxShadow: '0 2px 10px rgba(37,99,235,0.3)' } : {}}
                >
                  {cat || 'All'}
                </button>
              ))}
            </div>
            <button
              onClick={fetchProducts}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <HiRefresh className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Products Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <motion.div
            className="card flex flex-col items-center justify-center min-h-[300px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <HiPhotograph className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No products found</p>
            <button onClick={openAddModal} className="mt-4 btn-primary text-sm">
              Add First Product
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="card overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-600">
                                <HiPhotograph className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{truncateText(product.name, 30)}</p>
                            {product.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{truncateText(product.description, 40)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={getCategoryBadgeClass(product.category)}>
                          {product.category}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm font-bold text-white">{formatCurrency(product.price)}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${product.stock <= 0 ? 'text-red-400' : product.stock <= 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {product.stock}
                          </span>
                          <div className={`h-2 w-2 rounded-full ${product.stock <= 0 ? 'bg-red-500' : product.stock <= 5 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ boxShadow: product.stock <= 0 ? '0 0 6px rgba(239,68,68,0.5)' : product.stock <= 5 ? '0 0 6px rgba(234,179,8,0.5)' : '0 0 6px rgba(34,197,94,0.5)' }}
                          />
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleAvailability(product)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                            product.isAvailable !== false ? 'bg-green-500' : 'bg-slate-600'
                          }`}
                          style={{ boxShadow: product.isAvailable !== false ? '0 0 10px rgba(34,197,94,0.3)' : 'none' }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                              product.isAvailable !== false ? 'translate-x-5.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 rounded-xl text-blue-400 hover:bg-white/5 transition-colors"
                            title="Edit"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(product)}
                            className="p-2 rounded-xl text-red-400 hover:bg-white/5 transition-colors"
                            title="Delete"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : null}
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        }
      >
        <form className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="form-label">Product Image</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="h-20 w-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden flex-shrink-0"
                style={{
                  border: '2px dashed rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <HiPhotograph className="h-6 w-6 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-500 mt-1">Upload</p>
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary text-sm py-2"
                >
                  Choose Image
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setValue('image', '') }}
                    className="ml-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-slate-500 mt-1">Max 5MB · JPG, PNG, WEBP</p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Name */}
          <div>
            <label className="form-label">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
              className={`form-input ${errors.name ? 'border-red-500/50' : ''}`}
              placeholder="e.g. Chicken Biryani"
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              {...register('description')}
              className="form-input resize-none"
              rows={2}
              placeholder="Short description..."
            />
          </div>

          {/* Price, Category, Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">
                Price (₹) <span className="text-red-400">*</span>
              </label>
              <input
                {...register('price', {
                  required: 'Required',
                  min: { value: 0.01, message: 'Must be > 0' },
                })}
                type="number"
                step="0.01"
                min="0"
                className={`form-input ${errors.price ? 'border-red-500/50' : ''}`}
                placeholder="99.00"
              />
              {errors.price && <p className="form-error">{errors.price.message}</p>}
            </div>

            <div>
              <label className="form-label">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                {...register('category', { required: 'Required' })}
                className={`form-input ${errors.category ? 'border-red-500/50' : ''}`}
              >
                <option value="">Select</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="form-error">{errors.category.message}</p>}
            </div>

            <div>
              <label className="form-label">
                Stock <span className="text-red-400">*</span>
              </label>
              <input
                {...register('stock', {
                  required: 'Required',
                  min: { value: 0, message: 'Min 0' },
                })}
                type="number"
                min="0"
                className={`form-input ${errors.stock ? 'border-red-500/50' : ''}`}
                placeholder="50"
              />
              {errors.stock && <p className="form-error">{errors.stock.message}</p>}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <input
              {...register('isAvailable')}
              type="checkbox"
              id="isAvailable"
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-slate-300">
              Available for ordering
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Product"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeleteModal(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger flex items-center gap-2"
            >
              {deleting ? <LoadingSpinner size="sm" /> : null}
              Delete
            </button>
          </div>
        }
      >
        <div className="text-center py-2">
          <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <HiTrash className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-slate-300 text-sm">
            Are you sure you want to delete{' '}
            <strong className="text-white">"{deleteModal?.name}"</strong>?
          </p>
          <p className="text-slate-500 text-xs mt-1">This action cannot be undone.</p>
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default AdminProducts
