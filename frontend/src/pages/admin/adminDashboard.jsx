import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { orderServices, listingServices } from '../../services'
import { formatPrice } from '../../utils/formatters'

// Navigation tab identifiers
const TABS = [
  { id: 'overview', label: 'Tổng Quan' },
  { id: 'listings', label: 'Duyệt Tin Đăng' },
  { id: 'users',    label: 'Người Dùng' },
]

// Order status visual badges
const STATUS_LABEL = {
  confirmed:  { text: 'Đã Thanh Toán', cls: 'bg-[#F2F8F4] text-[#155724]' },
  paid:       { text: 'Đã Thanh Toán', cls: 'bg-[#F2F8F4] text-[#155724]' },
  completed:  { text: 'Hoàn Thành',    cls: 'bg-[#F2F8F4] text-[#155724]' },
  processing: { text: 'Đang Chuẩn Bị', cls: 'bg-[#EBF3FE] text-[#1D4ED8]' },
  shipping:   { text: 'Đang Giao',    cls: 'bg-[#EBF3FE] text-[#1D4ED8]' },
  pending:    { text: 'Chờ Thanh Toán', cls: 'bg-[#FFF8E6] text-[#856404]' },
  cancelled:  { text: 'Đã Huỷ',        cls: 'bg-[#FDF2F2] text-[#9A2222]' },
}

// ════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate()

  // ── auth check ─────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(null) // null = loading

  useEffect(() => {
    const token = localStorage.getItem('token')
    const raw   = localStorage.getItem('user')
    if (!token || !raw) { setIsAdmin(false); return }
    try {
      const u = JSON.parse(raw)
      setIsAdmin(u?.role === 'admin')
    } catch {
      setIsAdmin(false)
    }
  }, [])

  // ── tab ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview')

  // ── overview state ──────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    revenue:         0,
    commission:      0,
    orders:          0,
    paidOrders:      0,
    pendingOrders:   0,
    cancelledOrders: 0,
    products:        0,
  })
  const [allOrders, setAllOrders] = useState([])
  const [orderFilter, setOrderFilter] = useState('all') // 'all' | 'paid' | 'pending' | 'cancelled'
  const [loadingStats, setLoadingStats] = useState(false)

  // Derived filtered orders
  const filteredOrders = allOrders.filter(o => {
    const rawStatus = (o.order_status || o.status || 'pending').toLowerCase()
    const isPaid = o.payment_status === 'paid' || ['confirmed', 'completed', 'shipping'].includes(rawStatus)
    const isCancelled = rawStatus === 'cancelled'
    const isPending = !isPaid && !isCancelled

    if (orderFilter === 'paid') return isPaid
    if (orderFilter === 'pending') return isPending
    if (orderFilter === 'cancelled') return isCancelled
    return true
  })

  // ── listings state ──────────────────────────────────────────────────────
  const [pending, setPending]         = useState([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [listingBanner, setListingBanner]     = useState(null) // { type, msg }

  // ── detail modal state ──────────────────────────────────────────────────
  const [selectedListing, setSelectedListing] = useState(null)  // full listing detail
  const [loadingDetail, setLoadingDetail]     = useState(false)
  const [detailImageIdx, setDetailImageIdx]   = useState(0)     // active image in modal gallery

  // ── fetch overview ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'overview' || !isAdmin) return
    setLoadingStats(true)

    Promise.allSettled([
      orderServices.getOrders(),
      listingServices.getListings(),
    ]).then(([ordersRes, listingsRes]) => {
      // orders
      if (ordersRes.status === 'fulfilled') {
        const orders = ordersRes.value.data?.orders ?? ordersRes.value.data ?? []
        if (Array.isArray(orders)) {
          // Phân loại đơn hàng
          const isPaidOrder = o => 
            o.payment_status === 'paid' || 
            ['confirmed', 'completed', 'shipping'].includes(o.order_status || o.status)
          const isCancelledOrder = o =>
            (o.order_status || o.status) === 'cancelled'
          const isPendingOrder = o =>
            !isPaidOrder(o) && !isCancelledOrder(o)

          const paidOrders = orders.filter(isPaidOrder)
          const pendingOrders = orders.filter(isPendingOrder)
          const cancelledOrders = orders.filter(isCancelledOrder)

          const revenue = paidOrders.reduce((s, o) => s + (Number(o.total_price || o.total_amount) || 0), 0)
          const commission = paidOrders.reduce((s, o) => 
            s + (Number(o.commission_fee) || Math.round((Number(o.total_price || o.total_amount) || 0) * 0.15)), 0
          )

          setStats(prev => ({
            ...prev,
            revenue,
            commission,
            orders: orders.length,
            paidOrders: paidOrders.length,
            pendingOrders: pendingOrders.length,
            cancelledOrders: cancelledOrders.length,
          }))
          setAllOrders(orders)
        }
      }
      // listings count
      if (listingsRes.status === 'fulfilled') {
        const data = listingsRes.value.data
        const list = data?.data ?? data?.listings ?? data ?? []
        if (Array.isArray(list)) {
          const active = list.filter(l => l.status === 'active' || !l.status).length
          setStats(prev => ({ ...prev, products: active }))
        }
      }
    }).finally(() => setLoadingStats(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdmin])

  // ── fetch pending listings ──────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'listings' || !isAdmin) return
    setLoadingListings(true)
    listingServices.getListings({ status: 'pending' })
      .then(res => {
        const data = res.data?.data ?? res.data?.listings ?? res.data ?? []
        setPending(Array.isArray(data) ? data : [])
      })
      .catch(() => setPending([]))
      .finally(() => setLoadingListings(false))
  }, [activeTab, isAdmin])

  // ── listing action ──────────────────────────────────────────────────────
  const handleListingAction = async (id, newStatus) => {
    setListingBanner(null)
    try {
      await listingServices.updateListingStatus(id, newStatus)
      setPending(prev => prev.filter(l => (l.id ?? l._id) !== id))
      setListingBanner({
        type: 'success',
        msg: newStatus === 'active' ? 'Tin đăng đã được duyệt thành công.' : 'Tin đăng đã bị từ chối.',
      })
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.'
      setListingBanner({ type: 'error', msg })
    }
    // auto-clear banner
    setTimeout(() => setListingBanner(null), 4000)
  }

  // ── open detail modal (fetches full listing including seller contact) ────
  const handleOpenDetail = async (id) => {
    setLoadingDetail(true)
    setDetailImageIdx(0)
    setSelectedListing(null)
    try {
      const res = await listingServices.getListingById(id)
      const detail = res.data?.listing ?? res.data?.data ?? res.data
      setSelectedListing(detail)
    } catch {
      // silently fail – modal just won't open
    } finally {
      setLoadingDetail(false)
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Loading state while checking role
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center">
        <p className="text-[#444444] font-mono text-xs tracking-wider uppercase animate-pulse">Đang xác thực…</p>
      </div>
    )
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-6 select-none">🔒</div>
            <h1 className="text-xl font-bold text-[#111111] mb-2 tracking-tight uppercase">
              Truy Cập Bị Từ Chối
            </h1>
            <p className="text-sm text-[#666666] mb-8">
              Bạn không có quyền truy cập trang này. Chỉ quản trị viên mới được phép.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-6 py-3 hover:bg-[#2A2A2A] transition-colors"
            >
              ← Quay Lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="border-b border-[#E5E5E3] bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-xs font-mono uppercase tracking-wider text-[#444444] mb-1">
            Aura Vault · Admin
          </p>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight uppercase">
            Admin Dashboard
          </h1>
          <p className="text-sm text-[#666666] mt-1">Quản Trị Sàn Aura Vault</p>
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────── */}
      <div className="border-b border-[#E5E5E3] bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#888888] hover:text-[#444444]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ════ TAB 1: TỔNG QUAN ════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Tổng Doanh Thu',
                  value: loadingStats ? '—' : formatPrice(stats.revenue),
                  sub: 'Từ đơn thanh toán thành công',
                },
                {
                  label: 'Hoa Hồng Sàn (15%)',
                  value: loadingStats ? '—' : formatPrice(stats.commission),
                  sub: '15% trên đơn thành công',
                },
                {
                  label: 'Đơn Thành Công',
                  value: loadingStats ? '—' : stats.paidOrders.toLocaleString(),
                  sub: `${stats.pendingOrders} chờ • ${stats.cancelledOrders} huỷ • ${stats.orders} tổng`,
                },
                {
                  label: 'Sản Phẩm Đang Bán',
                  value: loadingStats ? '—' : stats.products.toLocaleString(),
                  sub: 'Tin đăng đang hoạt động',
                },
              ].map(card => (
                <div key={card.label} className="bg-white border border-[#E5E5E3] p-5">
                  <p className="text-xs font-mono uppercase tracking-wider text-[#444444] mb-3">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-[#111111] leading-none mb-2">
                    {card.value}
                  </p>
                  <p className="text-xs text-[#888888]">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white border border-[#E5E5E3]">
              <div className="px-6 py-4 border-b border-[#E5E5E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
                  Quản Lý Đơn Hàng ({filteredOrders.length})
                </h2>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all',       label: 'Tất Cả',          count: stats.orders },
                    { id: 'paid',      label: 'Đã Thanh Toán',   count: stats.paidOrders },
                    { id: 'pending',   label: 'Chờ Thanh Toán',  count: stats.pendingOrders },
                    { id: 'cancelled', label: 'Đã Huỷ',          count: stats.cancelledOrders },
                  ].map(tab => {
                    const active = orderFilter === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setOrderFilter(tab.id)}
                        className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 transition-colors border ${
                          active
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-[#FBFBFA] text-[#666666] border-[#E5E5E3] hover:text-[#111111] hover:border-[#111111]'
                        }`}
                      >
                        {tab.label} <span className="opacity-70">({tab.count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E5E3] bg-[#FBFBFA]">
                      {['Mã ĐH', 'Người Mua', 'Sản Phẩm', 'Tổng Tiền', 'Trạng Thái', 'Ngày'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#444444]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-xs font-mono text-[#888888]">
                          Không có đơn hàng nào trong mục này.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o, i) => {
                        const sid    = o.order_id ?? o.id ?? o._id ?? `#${i + 1}`
                        const buyer  = o.buyer_name || o.buyer || o.user || '—'
                        const prod   = o.items && o.items.length > 0
                          ? o.items.map(it => it.title || it.product_title).filter(Boolean).join(', ')
                          : (o.product ?? o.product_name ?? o.listing_title ?? '—')
                        const total  = Number(o.total_amount ?? o.total_price ?? o.total ?? 0)
                        const rawStatus = (o.order_status || o.status || 'pending').toLowerCase()
                        // Ưu tiên hiển thị nếu đã thanh toán
                        const isPaid = o.payment_status === 'paid' || ['confirmed', 'completed', 'shipping'].includes(rawStatus)
                        const isCancelled = rawStatus === 'cancelled'
                        const statusKey = isCancelled ? 'cancelled' : (isPaid ? 'confirmed' : 'pending')
                        const badge  = STATUS_LABEL[statusKey] ?? { text: rawStatus, cls: 'bg-[#F3F4F6] text-[#374151]' }
                        const date   = o.date ?? o.created_at?.slice(0, 10) ?? '—'
                        return (
                          <tr key={sid} className="border-b border-[#E5E5E3] hover:bg-[#FBFBFA] transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-[#111111]">#{sid}</td>
                            <td className="px-4 py-3 text-[#333333] font-medium">{buyer}</td>
                            <td className="px-4 py-3 text-[#333333] max-w-[220px] truncate" title={prod}>{prod}</td>
                            <td className="px-4 py-3 font-mono text-xs text-[#111111] font-semibold">
                              {total > 0 ? formatPrice(total) : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-mono uppercase tracking-wider px-2 py-1 ${badge.cls}`}>
                                {badge.text}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-[#888888]">{date}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════ TAB 2: DUYỆT TIN ĐĂNG ══════════════════════════════════ */}
        {activeTab === 'listings' && (
          <div className="space-y-6">

            {/* Banner */}
            {listingBanner && (
              <div className={`px-4 py-3 text-sm border-l-2 ${
                listingBanner.type === 'success'
                  ? 'bg-[#F2F8F4] border-[#1E7E34] text-[#155724]'
                  : 'bg-[#FDF2F2] border-[#D93838] text-[#9A2222]'
              }`}>
                {listingBanner.msg}
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#444444]">
                Tin Đăng Chờ Duyệt
                {!loadingListings && (
                  <span className="ml-2 bg-[#111111] text-white text-[10px] px-2 py-0.5">
                    {pending.length}
                  </span>
                )}
              </h2>
            </div>

            {loadingListings ? (
              <div className="text-center py-16 text-xs font-mono uppercase tracking-wider text-[#888888] animate-pulse">
                Đang tải…
              </div>
            ) : pending.length === 0 ? (
              <div className="bg-white border border-[#E5E5E3] py-20 text-center">
                <div className="text-4xl mb-4">✓</div>
                <p className="text-sm text-[#666666]">Không có tin đăng nào cần duyệt</p>
                <p className="text-xs text-[#999999] mt-1">Mọi tin đăng đã được xử lý.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pending.map(listing => {
                  const id     = listing.id ?? listing._id
                  const imgSrc = listing.primary_image
                    || (typeof listing.images?.[0] === 'string' ? listing.images[0] : listing.images?.[0]?.image_url)
                    || listing.image_url
                    || null
                  const seller = listing.seller_name ?? listing.seller?.name ?? 'Người Bán'
                  const email  = listing.seller_email ?? listing.seller?.email ?? ''
                  return (
                    <div key={id} className="bg-white border border-[#E5E5E3] flex flex-col">
                      {/* Smaller image frame with centered product image */}
                      <div className="h-40 sm:h-44 bg-[#F0F0EE] flex items-center justify-center overflow-hidden">
                        {imgSrc ? (
                          <img src={imgSrc} alt={listing.title} className="w-full h-full object-contain p-2" />
                        ) : (
                          <span className="text-4xl select-none">🖼</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col gap-3">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-wider text-[#888888] mb-0.5">
                            {listing.brand ?? '—'}
                          </p>
                          <p className="text-sm font-semibold text-[#111111] leading-snug line-clamp-2">
                            {listing.title ?? listing.name ?? 'Sản phẩm không tên'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#111111]">
                            {formatPrice(Number(listing.selling_price) || 0)}
                          </span>
                          <span className="text-xs border border-[#E5E5E3] px-2 py-0.5 text-[#666666] font-mono uppercase">
                            {listing.condition_grade ?? listing.condition ?? '—'}
                          </span>
                        </div>

                        <div className="border-t border-[#E5E5E3] pt-3">
                          <p className="text-xs font-mono uppercase tracking-wider text-[#444444]">Người Đăng</p>
                          <p className="text-sm text-[#333333] mt-0.5">{seller}</p>
                          {email && <p className="text-xs text-[#888888]">{email}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto pt-1">
                          {/* Detail button */}
                          <button
                            onClick={() => handleOpenDetail(id)}
                            className="px-3 py-2 text-xs font-mono uppercase tracking-wider border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                          >
                            👁 Chi Tiết
                          </button>
                          <button
                            onClick={() => handleListingAction(id, 'active')}
                            className="flex-1 py-2 text-xs font-mono uppercase tracking-wider border border-[#1E7E34] text-[#1E7E34] hover:bg-[#1E7E34] hover:text-white transition-colors"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleListingAction(id, 'rejected')}
                            className="flex-1 py-2 text-xs font-mono uppercase tracking-wider border border-[#D93838] text-[#D93838] hover:bg-[#D93838] hover:text-white transition-colors"
                          >
                            Từ Chối
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Detail Modal ─────────────────────────────────────────────── */}
            {(loadingDetail || selectedListing) && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={() => setSelectedListing(null)}
              >
                <div
                  className="bg-[#FBFBFA] w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E3]">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#111111]">Chi Tiết Tin Đăng</p>
                    <button
                      onClick={() => setSelectedListing(null)}
                      className="text-[#888888] hover:text-[#111111] text-xl leading-none transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {loadingDetail ? (
                    <div className="py-20 text-center text-xs font-mono uppercase tracking-wider text-[#888888] animate-pulse">
                      Đang tải…
                    </div>
                  ) : selectedListing && (
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* LEFT: image gallery */}
                      <div className="bg-[#F5F5F4] p-4 flex flex-col gap-3">
                        {/* Main image */}
                        <div className="aspect-square bg-white border border-[#E5E5E3] flex items-center justify-center overflow-hidden">
                          {selectedListing.images?.length > 0 ? (
                            <img
                              src={selectedListing.images[detailImageIdx]?.image_url}
                              alt={selectedListing.title}
                              className="w-full h-full object-contain p-3"
                            />
                          ) : selectedListing.primary_image ? (
                            <img
                              src={selectedListing.primary_image}
                              alt={selectedListing.title}
                              className="w-full h-full object-contain p-3"
                            />
                          ) : (
                            <span className="text-5xl select-none">🖼</span>
                          )}
                        </div>
                        {/* Thumbnails */}
                        {selectedListing.images?.length > 1 && (
                          <div className="flex gap-2 flex-wrap">
                            {selectedListing.images.map((img, i) => (
                              <button
                                key={img.id ?? i}
                                onClick={() => setDetailImageIdx(i)}
                                className={`w-14 h-14 overflow-hidden border-2 transition-colors ${
                                  i === detailImageIdx ? 'border-[#111111]' : 'border-transparent'
                                }`}
                              >
                                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* RIGHT: info + seller + actions */}
                      <div className="p-6 flex flex-col gap-5">
                        {/* Brand & title */}
                        <div>
                          <p className="text-xs font-mono uppercase tracking-wider text-[#888888] mb-1">
                            {selectedListing.brand_name ?? selectedListing.brand ?? '—'}
                          </p>
                          <h3 className="text-lg font-bold text-[#111111] leading-snug">
                            {selectedListing.title ?? 'Sản phẩm không tên'}
                          </h3>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                          <span className="text-xl font-bold text-[#111111]">
                            {formatPrice(Number(selectedListing.selling_price) || 0)}
                          </span>
                          {selectedListing.original_price > 0 && (
                            <span className="text-sm text-[#999999] line-through">
                              {formatPrice(Number(selectedListing.original_price))}
                            </span>
                          )}
                        </div>

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border border-[#E5E5E3] p-3">
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Danh Mục</p>
                            <p className="text-[#333333]">{selectedListing.category_name ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Tình Trạng</p>
                            <p className="text-[#333333] font-mono uppercase">{selectedListing.condition_grade ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Mã SP</p>
                            <p className="text-[#333333] font-mono">#{selectedListing.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Số Ảnh</p>
                            <p className="text-[#333333]">{selectedListing.images?.length ?? 0} ảnh</p>
                          </div>
                        </div>

                        {/* Description */}
                        {selectedListing.description && (
                          <div>
                            <p className="text-xs font-mono uppercase tracking-wider text-[#444444] mb-1">Mô Tả</p>
                            <p className="text-sm text-[#555555] leading-relaxed whitespace-pre-line line-clamp-6">
                              {selectedListing.description}
                            </p>
                          </div>
                        )}

                        {/* Seller info (admin-only fields) */}
                        <div className="border border-[#E5E5E3] p-3 bg-white">
                          <p className="text-xs font-mono uppercase tracking-wider text-[#444444] mb-2">Thông Tin Người Bán</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-[#333333] font-semibold">
                              {selectedListing.seller_name ?? 'Không rõ'}
                            </p>
                            {selectedListing.seller_email && (
                              <p className="text-[#666666] font-mono text-xs">{selectedListing.seller_email}</p>
                            )}
                            {selectedListing.seller_phone && (
                              <p className="text-[#333333] font-mono">📞 {selectedListing.seller_phone}</p>
                            )}
                          </div>
                        </div>

                        {/* Approve / Reject */}
                        <div className="flex gap-3 mt-auto">
                          <button
                            onClick={() => {
                              handleListingAction(selectedListing.id, 'active')
                              setSelectedListing(null)
                            }}
                            className="flex-1 py-3 text-xs font-mono uppercase tracking-wider border border-[#1E7E34] text-[#1E7E34] hover:bg-[#1E7E34] hover:text-white transition-colors"
                          >
                            ✓ Duyệt Tin
                          </button>
                          <button
                            onClick={() => {
                              handleListingAction(selectedListing.id, 'rejected')
                              setSelectedListing(null)
                            }}
                            className="flex-1 py-3 text-xs font-mono uppercase tracking-wider border border-[#D93838] text-[#D93838] hover:bg-[#D93838] hover:text-white transition-colors"
                          >
                            ✕ Từ Chối
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ════ TAB 3: NGƯỜI DÙNG ═══════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Notice banner */}
            <div className="bg-[#F8F8F7] border-l-2 border-[#111111] text-[#444444] px-4 py-3 text-sm">
              Hệ thống hiển thị tài khoản quản trị hiện hành. API quản lý toàn bộ danh sách thành viên sẽ được cập nhật đồng bộ với phân quyền backend.
            </div>

            <div className="bg-white border border-[#E5E5E3]">
              <div className="px-6 py-4 border-b border-[#E5E5E3] flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
                  Tài Khoản Đang Đăng Nhập
                </h2>
                <span className="text-xs text-[#888888] font-mono">1 quản trị viên</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E5E3] bg-[#FBFBFA]">
                      {['', 'Tên', 'Email', 'Vai Trò', 'Trạng Thái'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#444444]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const currentUser = (() => {
                        try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
                      })()
                      return (
                        <tr className="border-b border-[#E5E5E3] hover:bg-[#FBFBFA] transition-colors">
                          <td className="px-4 py-3">
                            <div className="w-8 h-8 bg-[#111111] text-white flex items-center justify-center text-xs font-bold select-none">
                              {(currentUser.name || currentUser.email || 'A').charAt(0).toUpperCase()}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-[#111111]">{currentUser.name || 'Admin'}</td>
                          <td className="px-4 py-3 text-[#666666] font-mono text-xs">{currentUser.email || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono uppercase tracking-wider px-2 py-1 bg-[#111111] text-white">
                              {currentUser.role || 'admin'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono uppercase tracking-wider px-2 py-1 bg-[#F2F8F4] text-[#155724]">
                              Đang Hoạt Động
                            </span>
                          </td>
                        </tr>
                      )
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
