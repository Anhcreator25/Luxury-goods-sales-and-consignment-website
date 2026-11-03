import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { formatPrice, CONDITION_MAP } from '../../utils/formatters'
import { listingServices, cartServices } from '../../services'

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

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
      setSuccess('Đã thêm tác phẩm vào giỏ hàng thành công!')
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

  const handleBuyNow = async () => {
    setError('')
    setSuccess('')

    if (!token) {
      navigate('/login')
      return
    }

    setCartLoading(true)
    try {
      await cartServices.addToCart(id, 1)
      window.dispatchEvent(new Event('cart-updated'))
      navigate('/cart')
    } catch (err) {
      setError('Không thể xử lý yêu cầu. Vui lòng thử lại.')
      setCartLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA]">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border border-[#111111] border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#888888]">
              Đang đối soát chứng thư sản phẩm...
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
        <div className="max-w-2xl mx-auto px-6 py-28 text-center">
          <div className="w-16 h-16 bg-white border border-[#E5E5E3] flex items-center justify-center mx-auto mb-5 text-2xl font-serif text-[#999999]">
            ◇
          </div>
          <h2 className="text-2xl font-serif text-[#111111] mb-2 font-normal">Không Tìm Thấy Tác Phẩm</h2>
          <p className="text-xs text-[#777777] font-sans mb-8 leading-relaxed max-w-md mx-auto">
            Vật phẩm này có thể đã được giao dịch thành công hoặc đang trong quy trình tái kiểm định của Aura Vault.
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-[0.2em] hover:bg-[#2A2A2A] transition"
          >
            Khám phá bộ sưu tập khác →
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const rawImages = Array.isArray(product?.images) && product.images.length > 0 
    ? product.images.map(img => typeof img === 'string' ? img : img.image_url)
    : (product?.primary_image ? [product.primary_image] : (product?.image_url ? [product.image_url] : []))

  const images = rawImages
  const hasImages = images.length > 0
  const mainImageSrc = hasImages ? images[activeImage] : "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"

  const conditionInfo = CONDITION_MAP[product?.condition_grade] || { label: product?.condition_grade || 'Tiêu chuẩn thẩm định' }
  const badgeLabel = conditionInfo.label

  return (
    <div className="min-h-screen bg-[#FBFBFA] selection:bg-[#111111] selection:text-white">
      <Navbar />

      {/* ── Breadcrumb ── */}
      <div className="border-b border-[#EAEAE8] bg-white/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3.5">
          <nav className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#888888]">
            <Link to="/" className="hover:text-[#111111] transition-colors">
              Trang Chủ
            </Link>
            <span className="text-[#CCCCCC]">/</span>
            <Link to="/shop" className="hover:text-[#111111] transition-colors">
              Bộ Sưu Tập
            </Link>
            <span className="text-[#CCCCCC]">/</span>
            <span className="text-[#111111] truncate max-w-[280px] font-medium">{product?.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Showcase Grid ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* ── LEFT: Studio Gallery (7 Columns) ── */}
          <div className="lg:col-span-7 flex flex-col gap-4 sticky top-24">
            {/* Main Stage Image */}
            <div className="w-full aspect-[4/5] bg-[#F7F7F6] border border-[#EAEAE8] overflow-hidden relative group">
              <img
                src={mainImageSrc}
                alt={product?.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Floating Verified Stamp */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-[#E5E5E3] text-[#111111] text-[9px] font-mono tracking-[0.2em] uppercase px-3 py-1.5 shadow-sm">
                ✓ Aura Vault Authenticated
              </div>

              {/* Condition Badge */}
              {product?.condition_grade && (
                <div className="absolute top-4 right-4 bg-[#111111] text-white text-[9px] font-mono tracking-widest uppercase px-3 py-1.5 shadow-sm">
                  {badgeLabel}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {hasImages && images.length > 1 && (
              <div className="grid grid-cols-5 gap-3 pt-1">
                {images.slice(0, 5).map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square bg-[#F7F7F6] border overflow-hidden transition-all duration-200 cursor-pointer ${
                      activeImage === idx
                        ? 'border-[#111111] ring-1 ring-[#111111]'
                        : 'border-[#EAEAE8] opacity-70 hover:opacity-100 hover:border-[#111111]'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Góc chụp ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Acquisition & Provenance Dossier (5 Columns) ── */}
          <div className="lg:col-span-5 flex flex-col space-y-7">

            {/* Header: Maison & Title */}
            <div className="border-b border-[#EAEAE8] pb-6 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.25em] text-[#888888]">
                <span className="text-[#111111] font-semibold tracking-[0.3em]">{product?.brand_name || product?.brand || 'Haute Maison'}</span>
                <span>Mã số: #{String(product?.id ?? id).padStart(5, '0')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#111111] leading-tight font-normal">
                {product?.title}
              </h1>
            </div>

            {/* Price Box */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888888] block">Giá Ký Gửi Niêm Yết</span>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-mono font-medium text-[#111111]">
                  {formatPrice(product?.selling_price ?? product?.price ?? 0)}
                </span>
                {product?.original_price && product.original_price > (product.selling_price || product.price) && (
                  <span className="text-xs font-mono text-[#999999] line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="space-y-3 pt-2">
              {error && (
                <div className="bg-[#FDF2F2] border-l-2 border-[#D93838] text-[#9A2222] px-4 py-2.5 text-xs font-mono">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-[#F2F8F4] border-l-2 border-[#1E7E34] text-[#155724] px-4 py-2.5 text-xs font-mono">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="w-full py-4 bg-white border border-[#111111] text-[#111111] hover:bg-[#F5F5F3] text-xs font-mono uppercase tracking-[0.2em] transition-all cursor-pointer disabled:opacity-50"
                >
                  {cartLoading ? 'Đang Xử Lý...' : 'Thêm Vào Giỏ'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                  className="w-full py-4 bg-[#111111] text-white hover:bg-[#2A2A2A] text-xs font-mono uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  Mua Ngay →
                </button>
              </div>

              {!token && (
                <p className="text-[11px] text-[#888888] font-mono text-center pt-1">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-[#111111] underline underline-offset-2 hover:text-black">
                    Đăng nhập
                  </Link>{' '}
                  để hoàn tất giao dịch bảo chứng.
                </p>
              )}
            </div>

            {/* ── 3 Trụ Cột Bảo Chứng (Trust Pillars) ── */}
            <div className="bg-[#F8F8F7] border border-[#EAEAE8] p-5 space-y-3.5">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#111111] font-semibold flex items-center gap-2">
                <span>🛡️</span>
                <span>Bảo Chứng Độc Quyền Từ Aura Vault</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#555555] font-light">
                <li className="flex items-start gap-2">
                  <span className="text-[#111111] font-bold">✓</span>
                  <span><strong>100% Giám định độc lập</strong> bởi chuyên gia quốc tế trước khi bàn giao.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#111111] font-bold">✓</span>
                  <span><strong>Cơ chế Escrow ký quỹ</strong> bảo vệ toàn vẹn dòng tiền của người mua.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#111111] font-bold">✓</span>
                  <span><strong>Bảo hiểm vận chuyển chuyên biệt</strong> bồi thường 100% giá trị bảo vật.</span>
                </li>
              </ul>
            </div>

            {/* ── Thông Số Giám Định (Provenance & Specs) ── */}
            <div className="border-t border-[#EAEAE8] pt-6 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] font-semibold">
                Thông Số &amp; Chứng Thư Lưu Hành
              </h3>
              
              <div className="divide-y divide-[#F0F0EE] text-xs">
                {[
                  { label: 'Thương Hiệu', value: product?.brand_name || product?.brand || 'Chính hãng' },
                  { label: 'Phân Hạng Danh Mục', value: product?.category_name || product?.category || 'Tuyển tập đặc biệt' },
                  { label: 'Tình Trạng Thực Tế', value: badgeLabel },
                  { label: 'Quy Chuẩn Đóng Gói', value: 'Fullbox / Niêm phong hộp bảo hiểm Aura' },
                  { label: 'Kiểm Định Viên', value: 'Hội đồng giám định độc lập Aura Vault' },
                ].map(({ label, value }) => (
                  <div key={label} className="py-2.5 flex justify-between items-center font-mono">
                    <span className="text-[#888888] uppercase tracking-wider text-[11px]">{label}</span>
                    <span className="text-[#111111] font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Mô Tả Chi Tiết ── */}
            {product?.description && (
              <div className="border-t border-[#EAEAE8] pt-6 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] font-semibold">
                  Mô Tả Hiện Trạng Bảo Vật
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-light whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
