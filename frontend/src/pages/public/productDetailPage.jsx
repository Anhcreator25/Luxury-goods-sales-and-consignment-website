import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ConditionBadge from '../../components/ConditionBadge'
import { formatPrice, CONDITION_MAP } from '../../utils/formatters'
import { listingServices, cartServices } from '../../services'

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cartLoading, setCartLoading] = useState(false)

  // ── Fetch product ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await listingServices.getListingById(id)
        setProduct(res.data?.data || res.data || null)
      } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm:", err)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])


  // ── Add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    setError('')
    setSuccess('')

    if (!token) {
      setError('Vui lòng đăng nhập để thêm vào giỏ hàng')
      return
    }

    setCartLoading(true)
    try {
      await cartServices.addToCart(id, 1)
      setSuccess('Đã thêm vào giỏ hàng!')
      window.dispatchEvent(new Event('cart-updated'))
    } catch (err) {
      const errorMsg =
        (typeof err === 'string' ? err : null) ||
        err?.message ||
        err?.response?.data?.message ||
        'Không thể thêm vào giỏ hàng. Vui lòng thử lại.'
      setError(errorMsg)
    } finally {
      setCartLoading(false)
    }
  }

  // ── Buy now ────────────────────────────────────────────────────────────────
  const handleBuyNow = async () => {
    setError('')
    setSuccess('')

    if (!token) {
      setError('Vui lòng đăng nhập để thêm vào giỏ hàng')
      return
    }

    setCartLoading(true)
    try {
      await cartServices.addToCart(id, quantity)
      window.dispatchEvent(new Event('cart-updated'))
      navigate('/cart')
    } catch (err) {
      const errorMsg =
        (typeof err === 'string' ? err : null) ||
        err?.message ||
        err?.response?.data?.message ||
        'Không thể thêm vào giỏ hàng. Vui lòng thử lại.'
      setError(errorMsg)
      setCartLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA]">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono uppercase tracking-wider text-[#888888]">
              Đang tải sản phẩm...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBFBFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 bg-[#FAFAFA] border border-[#E5E5E3] flex items-center justify-center mx-auto mb-4 text-2xl">
            📦
          </div>
          <h2 className="text-xl font-bold font-serif mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-sm text-[#777777] mb-6">
            Sản phẩm này có thể đã được bán hoặc chưa được phê duyệt.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-3 bg-[#111111] text-white text-xs font-mono uppercase tracking-widest hover:bg-[#333333] transition"
          >
            Khám phá bộ sưu tập
          </Link>
        </div>
      </div>
    )
  }

  const rawImages = Array.isArray(product?.images) && product.images.length > 0 
    ? product.images.map(img => typeof img === 'string' ? img : img.image_url)
    : (product?.primary_image ? [product.primary_image] : (product?.image_url ? [product.image_url] : []))

  const images = rawImages
  const hasImages = images.length > 0
  const mainImageSrc = hasImages ? images[activeImage] : null

  const conditionInfo = CONDITION_MAP[product?.condition_grade] || { label: product?.condition_grade || 'Tiêu chuẩn' }
  const badgeLabel = conditionInfo.label

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="border-b border-[#E5E5E3]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#888888]">
            <Link to="/" className="hover:text-[#111111] transition-colors">
              Trang Chủ
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-[#111111] transition-colors">
              Sản Phẩm
            </Link>
            <span>/</span>
            <span className="text-[#111111] truncate max-w-[220px]">{product?.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── LEFT: Image Gallery ──────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="w-full aspect-square bg-[#F5F5F4] border border-[#E5E5E3] overflow-hidden flex items-center justify-center">
              {hasImages ? (
                <img
                  src={mainImageSrc}
                  alt={product?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#BBBBBB]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-14 h-14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Không có ảnh
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {hasImages && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square bg-[#F5F5F4] border overflow-hidden transition-all ${
                      activeImage === idx
                        ? 'border-[#111111]'
                        : 'border-[#E5E5E3] hover:border-[#AAAAAA]'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Placeholder thumbnails when no images */}
            {!hasImages && (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-[#F0F0EE] border border-[#E5E5E3]"
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ──────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Brand */}
            <p className="text-xs font-mono uppercase tracking-wider text-[#888888]">
              {product?.brand_name || product?.brand || 'Luxury Consignment'}
            </p>

            {/* Title */}
            <h1 className="text-2xl font-serif font-bold text-[#111111] leading-snug">
              {product?.title}
            </h1>

            {/* Price */}
            <p className="text-3xl font-bold text-[#111111]">
              {formatPrice(product?.selling_price ?? product?.price ?? 0)}
            </p>

            {/* Condition badge */}
            {product?.condition_grade && (
              <div className="flex items-center gap-2">
                <ConditionBadge grade={product.condition_grade} className="text-xs px-3 py-1" />
              </div>
            )}

            {/* Divider */}
            <hr className="border-[#E5E5E3]" />

            {/* ── THÔNG TIN SẢN PHẨM ─────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-mono uppercase tracking-wider text-[#444444]">
                Thông Tin Sản Phẩm
              </p>

              {/* Description */}
              {product?.description && (
                <p className="text-sm text-[#555555] leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-1">
                {[
                  { label: 'Thương Hiệu', value: product?.brand },
                  { label: 'Danh Mục', value: product?.category },
                  { label: 'Tình Trạng', value: badgeLabel },
                  { label: 'Mã Sản Phẩm', value: product?.id ?? id },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#888888]">
                      {label}
                    </span>
                    <span className="text-sm text-[#111111] font-medium">
                      {value ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-[#E5E5E3]" />

            {/* ── GIẤY TỜ & KIỂM ĐỊNH ────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[#444444]">
                Giấy Tờ &amp; Kiểm Định
              </p>
              <div className="flex flex-col gap-2">
                {[
                  'Kiểm Định Chính Hãng',
                  'Bảo Hành Sàn 30 Ngày',
                  'Cam Kết Hoàn Tiền',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex-shrink-0">
                      ✓
                    </span>
                    <span className="text-sm text-[#333333]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-[#E5E5E3]" />

           

            {/* ── Banners ─────────────────────────────────────────────── */}
            {error && (
              <div className="bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-[#F2F8F4] border-l-2 border-[#1E7E34] text-[#155724] px-4 py-3 text-sm">
                {success}
              </div>
            )}

            {/* ── Login notice ─────────────────────────────────────────── */}
            {!token && (
              <p className="text-xs text-[#888888] font-mono">
                Bạn chưa đăng nhập.{' '}
                <Link to="/login" className="text-[#111111] underline hover:text-[#444444]">
                  Đăng nhập
                </Link>{' '}
                để thêm sản phẩm vào giỏ hàng.
              </p>
            )}

            {/* ── CTA Buttons ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 mt-1">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="w-full py-4 bg-[#111111] text-white text-sm font-mono uppercase tracking-wider hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cartLoading ? 'Đang xử lý...' : 'Thêm Vào Giỏ Hàng'}
              </button>
             
            </div>

          </div>
          {/* end RIGHT */}
        </div>
      </div>
      <Footer />
    </div>
  )
}
