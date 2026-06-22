import { useState, useEffect, useRef } from 'react'
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
      // We fetch all products without pagination just to be sure we delete them all
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500 text-sm mt-1">Manage canteen & stationery items</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDeleteAll} 
              disabled={deleting || products.length === 0}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <HiTrash className="h-4 w-4" />
              Delete All
            </button>
            <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
              <HiPlus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-2">
            {['', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat || 'All'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchProducts}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <HiRefresh className="h-4 w-4" />
          </button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl border border-gray-100 shadow-card">
            <HiPhotograph className="h-12 w-12 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
            <button onClick={openAddModal} className="mt-4 btn-primary text-sm">
              Add First Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Product</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Price</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Stock</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-300">
                                <HiPhotograph className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{truncateText(product.name, 30)}</p>
                            {product.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{truncateText(product.description, 40)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${product.stock <= 0 ? 'text-red-600' : product.stock <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {product.stock}
                          </span>
                          <div className={`h-2 w-2 rounded-full ${product.stock <= 0 ? 'bg-red-500' : product.stock <= 5 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleAvailability(product)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            product.isAvailable !== false ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                              product.isAvailable !== false ? 'translate-x-4.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal(product)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
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
          </div>
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
        <form className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors overflow-hidden flex-shrink-0"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <HiPhotograph className="h-6 w-6 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-400 mt-1">Upload</p>
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  Choose Image
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setValue('image', '') }}
                    className="ml-2 text-sm text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-1">Max 5MB · JPG, PNG, WEBP</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
              className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              placeholder="e.g. Chicken Biryani"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              {...register('description')}
              className="input-field resize-none"
              rows={2}
              placeholder="Short description..."
            />
          </div>

          {/* Price, Category, Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('price', {
                  required: 'Required',
                  min: { value: 0.01, message: 'Must be > 0' },
                })}
                type="number"
                step="0.01"
                min="0"
                className={`input-field ${errors.price ? 'border-red-400' : ''}`}
                placeholder="99.00"
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category', { required: 'Required' })}
                className={`input-field ${errors.category ? 'border-red-400' : ''}`}
              >
                <option value="">Select</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                {...register('stock', {
                  required: 'Required',
                  min: { value: 0, message: 'Min 0' },
                })}
                type="number"
                min="0"
                className={`input-field ${errors.stock ? 'border-red-400' : ''}`}
                placeholder="50"
              />
              {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3">
            <input
              {...register('isAvailable')}
              type="checkbox"
              id="isAvailable"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
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
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <HiTrash className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-gray-700 text-sm">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900">"{deleteModal?.name}"</strong>?
          </p>
          <p className="text-gray-400 text-xs mt-1">This action cannot be undone.</p>
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default AdminProducts
