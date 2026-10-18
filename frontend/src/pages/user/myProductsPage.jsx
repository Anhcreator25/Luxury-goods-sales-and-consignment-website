import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { listingServices } from '../../services'
import { formatPrice } from '../../utils/formatters'

// Listing consignment approval status badges
const STATUS_BADGE = {
  pending:  { label: 'Đang Chờ Xét Duyệt', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  active:   { label: 'Đang Bán',           cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  sold:     { label: 'Đã Bán',             cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  rejected: { label: 'Bị Từ Chối',         cls: 'bg-red-50 text-red-700 border border-red-200' },
}

const CATEGORIES = [
  { id: 1, label: 'Túi Xách (Handbags)' },
  { id: 2, label: 'Giày Hiệu & Sneaker (Sneakers)' },
  { id: 3, label: 'Đồng Hồ Xa Xỉ (Watches)' },
  { id: 4, label: 'Thời Trang Đường Phố (Streetwear)' },
  { id: 5, label: 'Trang Sức & Phụ Kiện (Accessories)' },
]

const CONDITIONS = [
  { value: 'Brand New (100% - Fullbox)', label: 'Brand New (100% - Fullbox)' },
  { value: 'Like New (99%)',             label: 'Like New (99%)' },
  { value: 'Excellent (97%)',            label: 'Excellent (97%)' },
  { value: 'Very Good (95%)',            label: 'Very Good (95%)' },
  { value: 'Good (90%)',                 label: 'Good (90%)' },
  { value: 'Fair / Lightly Used (70% - 85%)', label: 'Fair / Lightly Used (70% - 85%)' },
]

const BRAND_OPTIONS = [
  { id: 4, label: 'Gucci' },
  { id: 1, label: 'Chanel' },
  { id: 2, label: 'Hermès' },
  { id: 3, label: 'Louis Vuitton' },
  { id: 5, label: 'Dior' },
  { id: 6, label: 'Nike' },
  { id: null, label: 'Khác / Thương hiệu ngoài' },
]

const EMPTY_FORM = {
  title: '', brand: 'Gucci', brand_id: 4, description: '', price: '', original_price: '',
  category_id: 1, condition_grade: 'Excellent (97%)',
  imageUrls: [''], // array of image URL strings, up to 5
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || { label: status, cls: 'bg-gray-50 text-gray-600 border border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${s.cls}`}>
      {s.label}
    </span>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border border-[#E5E5E3] bg-white p-4 animate-pulse">
      <div className="w-16 h-16 bg-[#E5E5E3] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#E5E5E3] w-48" />
        <div className="h-3 bg-[#E5E5E3] w-24" />
      </div>
      <div className="h-4 bg-[#E5E5E3] w-20" />
    </div>
  )
}

export default function MyProductsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('list')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  // Form state
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    setListError('')
    try {
      const currentUser = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
      })()

      // Lấy tất cả sản phẩm của chính tài khoản này (bao gồm cả 'pending', 'active', 'rejected', 'sold')
      const queryParams = { status: 'all', limit: 100 }
      if (currentUser.id) {
        queryParams.seller_id = currentUser.id
      }
      const res = await listingServices.getListings(queryParams)
      const data = Array.isArray(res.data) ? res.data : (res.data?.listings || res.data?.data || [])
      
      const myItems = Array.isArray(data) 
        ? data.filter(item => !currentUser.id || Number(item.seller_id) === Number(currentUser.id))
        : []

      setProducts(myItems)
    } catch {
      setListError('Không thể tải danh sách sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (product) => {
    const pid = product.id || product._id
    const fallbackImg = product.primary_image || product.image_url || ''

    setForm({
      title:           product.title || '',
      brand:           product.brand || '',
      brand_id:        product.brand_id || null,
      description:     product.description || '',
      price:           product.selling_price ?? '',
      original_price:  product.original_price ?? '',
      category_id:     product.category_id || 1,
      condition_grade: product.condition_grade || 'Excellent (97%)',
      imageUrls:       fallbackImg ? [fallbackImg] : [''],
    })
    setEditId(pid)
    setIsUpdateMode(true)
    setFormError('')
    setFormSuccess('')
    setActiveTab('form')

    // Fetch full listing details to get all images from listing_images table
    try {
      const res = await listingServices.getListingById(pid)
      const detail = res.data?.data || res.data || {}
      if (Array.isArray(detail.images) && detail.images.length > 0) {
        const fullUrls = detail.images
          .map(img => (typeof img === 'string' ? img : img.image_url))
          .filter(Boolean)

        if (fullUrls.length > 0) {
          setForm(prev => ({
            ...prev,
            imageUrls: fullUrls,
            brand_id: detail.brand_id || prev.brand_id,
            description: detail.description || prev.description,
          }))
        }
      }
    } catch (err) {
      console.error('Không thể lấy chi tiết ảnh sản phẩm:', err)
    }
  }

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id)
  }

  const handleDeleteConfirm = async (id) => {
    setDeleting(true)
    try {
      await listingServices.deleteListing(id)
      setProducts(prev => prev.filter(p => (p.id || p._id) !== id))
      setConfirmDeleteId(null)
    } catch {
      setListError('Không thể xóa sản phẩm. Vui lòng thử lại.')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!form.title.trim() || !form.description.trim() || !form.price) {
      setFormError('Vui lòng điền đầy đủ tiêu đề, mô tả và giá bán.')
      return
    }

    const priceNum = Number(form.price)
    const originalPriceNum = form.original_price ? Number(form.original_price) : priceNum

    const payload = {
      title:           form.title.trim(),
      brand:           form.brand ? form.brand.trim() : 'Gucci',
      brand_id:        form.brand_id ? Number(form.brand_id) : null,
      description:     form.description.trim(),
      price:           priceNum,
      selling_price:   priceNum,
      original_price:  originalPriceNum,
      category_id:     Number(form.category_id),
      condition_grade: form.condition_grade || 'Excellent (97%)',
      images:          form.imageUrls.filter(url => url.trim() !== ''),
    }

    setSubmitting(true)
    try {
      if (isUpdateMode && editId) {
        await listingServices.updateListing(editId, payload)
        setFormSuccess('Sản phẩm đã được cập nhật thành công!')
      } else {
        await listingServices.createListing(payload)
        setFormSuccess('Sản phẩm đã được gửi duyệt! Chúng tôi sẽ kiểm duyệt trong 24h.')
      }
      setForm(EMPTY_FORM)
      setEditId(null)
      setIsUpdateMode(false)
      await fetchProducts()
      setTimeout(() => {
        setActiveTab('list')
        setFormSuccess('')
      }, 2000)
    } catch (err) {
      const errMsg = typeof err === 'string' 
        ? err 
        : err?.message || err?.response?.data?.message || 'Đã xảy ra lỗi khi tạo tin đăng. Vui lòng thử lại.'
      setFormError(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setIsUpdateMode(false)
    setFormError('')
    setFormSuccess('')
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-1">Tài Khoản</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] uppercase">Sản Phẩm Của Tôi</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E5E3] mb-8">
          <button
            onClick={() => { setActiveTab('list'); resetForm() }}
            className={`px-6 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors duration-150 ${
              activeTab === 'list'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#888888] hover:text-[#444444]'
            }`}
          >
            Danh Sách Sản Phẩm
          </button>
          <button
            onClick={() => { setActiveTab('form'); resetForm() }}
            className={`px-6 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors duration-150 ${
              activeTab === 'form'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#888888] hover:text-[#444444]'
            }`}
          >
            {isUpdateMode ? '✏ Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
          </button>
        </div>

        {/* ── TAB 1: PRODUCT LIST ── */}
        {activeTab === 'list' && (
          <div>
            {listError && (
              <div className="mb-4 bg-[#FDF2F2] border-l-2 border-[#D93838] px-4 py-3">
                <p className="text-sm text-[#9A2222]">{listError}</p>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="border border-dashed border-[#E5E5E3] bg-white py-16 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#F0F0EE] border border-[#E5E5E3] flex items-center justify-center mb-4">
                  <span className="text-xl">🏷️</span>
                </div>
                <p className="text-sm font-mono uppercase tracking-wider text-[#444444] mb-1">Chưa Có Sản Phẩm Nào</p>
                <p className="text-xs text-[#888888] mb-6">Bắt đầu ký gửi sản phẩm của bạn ngay hôm nay.</p>
                <button
                  onClick={() => setActiveTab('form')}
                  className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-6 py-2.5 hover:bg-[#2A2A2A] transition-colors duration-150"
                >
                  Thêm Sản Phẩm
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => {
                  const pid = product.id || product._id
                  return (
                    <div key={pid} className="border border-[#E5E5E3] bg-white hover:border-[#111111] transition-colors duration-150">
                      <div className="flex items-center gap-4 p-4">
                        {/* Image — backend returns images as [{id, image_url, is_primary}] */}
                        <div className="w-16 h-16 bg-[#F0F0EE] border border-[#E5E5E3] flex-shrink-0 overflow-hidden">
                          {(() => {
                          
                            const src = product.primary_image || product.image_url ||
                                        (typeof product.images?.[0]==='string'? product.images[0] : product.images?.[0]?.image_url);
                            return src ? (
                              <img
                                src={src}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[#CCCCCC] text-xl">◻</span>
                              </div>
                            )
                          })()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#111111] truncate">{product.title}</p>
                          <p className="text-xs text-[#888888] font-mono mt-0.5">{product.brand}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <StatusBadge status={product.status || 'pending'} />
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0 hidden sm:block">
                          <p className="text-xs text-[#888888] font-mono uppercase tracking-wider">Giá</p>
                          <p className="text-sm font-bold text-[#111111]">{formatPrice(product.selling_price)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(product)}
                            className="w-8 h-8 border border-[#E5E5E3] flex items-center justify-center text-[#444444] hover:border-[#111111] hover:text-[#111111] transition-colors duration-150 text-sm"
                            title="Chỉnh sửa"
                          >
                            ✏
                          </button>
                          <button
                            onClick={() => handleDeleteClick(pid)}
                            className="w-8 h-8 border border-[#E5E5E3] flex items-center justify-center text-[#888888] hover:border-[#D93838] hover:text-[#D93838] transition-colors duration-150 text-sm"
                            title="Xóa"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Confirm Delete Row */}
                      {confirmDeleteId === pid && (
                        <div className="border-t border-[#E5E5E3] bg-[#FDF2F2] px-4 py-3 flex items-center justify-between">
                          <p className="text-xs text-[#9A2222]">Bạn có chắc muốn xóa sản phẩm này không?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-[#E5E5E3] text-[#444444] hover:border-[#111111] transition-colors duration-150 bg-white"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(pid)}
                              disabled={deleting}
                              className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-[#D93838] text-white hover:bg-[#b82e2e] transition-colors duration-150 disabled:opacity-50"
                            >
                              {deleting ? 'Đang Xóa...' : 'Xác Nhận Xóa'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: ADD / EDIT FORM ── */}
        {activeTab === 'form' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#111111]">
                {isUpdateMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h2>
              {isUpdateMode && (
                <button
                  onClick={resetForm}
                  className="text-xs text-[#888888] hover:text-[#111111] font-mono uppercase tracking-wider"
                >
                  ← Hủy Chỉnh Sửa
                </button>
              )}
            </div>

            {formError && (
              <div className="mb-4 bg-[#FDF2F2] border-l-2 border-[#D93838] px-4 py-3">
                <p className="text-sm text-[#9A2222]">{formError}</p>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 bg-[#F2F8F4] border-l-2 border-[#1E7E34] px-4 py-3">
                <p className="text-sm text-[#155724]">{formSuccess}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                  Tên Sản Phẩm <span className="text-[#D93838]">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  placeholder="Ví dụ: Chanel Classic Flap Bag Medium"
                  className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                />
              </div>

              {/* Thương hiệu */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                  Thương Hiệu <span className="text-[#D93838]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    name="brand_id"
                    value={form.brand_id || ''}
                    onChange={(e) => {
                      const selId = e.target.value ? Number(e.target.value) : null
                      const found = BRAND_OPTIONS.find(b => b.id === selId)
                      setForm(prev => ({
                        ...prev,
                        brand_id: selId,
                        brand: found && found.id ? found.label : prev.brand
                      }))
                    }}
                    className="border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors duration-150 appearance-none"
                  >
                    {BRAND_OPTIONS.map(b => (
                      <option key={String(b.id)} value={b.id || ''}>{b.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleFormChange}
                    required
                    placeholder="Tên thương hiệu..."
                    className="border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                  Mô Tả Chi Tiết <span className="text-[#D93838]">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  required
                  rows={4}
                  placeholder="Mô tả tình trạng, xuất xứ, phụ kiện đi kèm..."
                  className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150 resize-none"
                />
              </div>

              {/* Giá bán & Giá gốc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Giá Bán (₫) <span className="text-[#D93838]">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                    min={0}
                    placeholder="Ví dụ: 25000000"
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Giá Gốc / Hãng (₫)
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    value={form.original_price}
                    onChange={handleFormChange}
                    min={0}
                    placeholder="Để trống = bằng giá bán"
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                  />
                </div>
              </div>

              {/* Category + Condition row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Danh Mục
                  </label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleFormChange}
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors duration-150 appearance-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Tình Trạng
                  </label>
                  <select
                    name="condition_grade"
                    value={form.condition_grade}
                    onChange={handleFormChange}
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors duration-150 appearance-none"
                  >
                    {CONDITIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URLs — supports up to 5 URLs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#444444]">
                    Ảnh Sản Phẩm <span className="text-[#888888] normal-case">(tối đa 5 ảnh)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#AAAAAA]">
                    {form.imageUrls.filter(u => u.trim()).length} / 5
                  </span>
                </div>

                <div className="space-y-2">
                  {form.imageUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      {/* Index badge */}
                      <span className="w-5 text-[10px] font-mono text-[#AAAAAA] text-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const updated = [...form.imageUrls]
                          updated[idx] = e.target.value
                          setForm(prev => ({ ...prev, imageUrls: updated }))
                        }}
                        placeholder={idx === 0 ? 'Ảnh chính — https://...' : `Ảnh phụ ${idx + 1} — https://...`}
                        className="flex-1 border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                      />
                      {/* Remove button — keep at least 1 row */}
                      {form.imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = form.imageUrls.filter((_, i) => i !== idx)
                            setForm(prev => ({ ...prev, imageUrls: updated }))
                          }}
                          className="w-8 h-8 flex-shrink-0 border border-[#E5E5E3] flex items-center justify-center text-[#888888] hover:border-[#D93838] hover:text-[#D93838] transition-colors duration-150 text-sm"
                          title="Xóa ảnh này"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add image button — only when fewer than 5 */}
                {form.imageUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }))}
                    className="mt-2 w-full border border-dashed border-[#E5E5E3] py-2 text-xs font-mono uppercase tracking-wider text-[#888888] hover:border-[#111111] hover:text-[#111111] transition-colors duration-150"
                  >
                    + Thêm Ảnh
                  </button>
                )}

                {/* Preview thumbnails for filled URLs */}
                {form.imageUrls.some(u => u.trim()) && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {form.imageUrls.filter(u => u.trim()).map((url, idx) => (
                      <div
                        key={idx}
                        className="w-14 h-14 border border-[#E5E5E3] overflow-hidden bg-[#F0F0EE]"
                        title={`Ảnh ${idx + 1}`}
                      >
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#111111] text-white text-xs font-mono uppercase tracking-widest py-3.5 hover:bg-[#2A2A2A] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? (isUpdateMode ? 'Đang Cập Nhật...' : 'Đang Gửi...')
                    : (isUpdateMode ? 'Cập Nhật Sản Phẩm' : 'Gửi Sản Phẩm Để Duyệt')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}

