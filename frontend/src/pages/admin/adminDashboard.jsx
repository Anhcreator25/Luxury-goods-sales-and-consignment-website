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
  completed:  { text: 'Hoàn Thành', cls: 'bg-[#F2F8F4] text-[#155724]' },
  processing: { text: 'Đang Xử Lý', cls: 'bg-[#FFF8E6] text-[#856404]' },
  cancelled:  { text: 'Đã Huỷ',    cls: 'bg-[#FDF2F2] text-[#9A2222]' },
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
    revenue:    0,
    commission: 0,
    orders:     0,
    products:   0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loadingStats, setLoadingStats] = useState(false)

  // ── listings state ──────────────────────────────────────────────────────
  const [pending, setPending]         = useState([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [listingBanner, setListingBanner]     = useState(null) // { type, msg }

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
          const revenue = orders.reduce((s, o) => s + (Number(o.total_price) || 0), 0)
          setStats(prev => ({
            ...prev,
            revenue,
            commission: Math.round(revenue * 0.1),
            orders:     orders.length,
          }))
          setRecentOrders(orders.slice(0, 5))
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
                  sub: 'Tất cả đơn hàng hoàn thành',
                },
                {
                  label: 'Hoa Hồng Sàn (10%)',
                  value: loadingStats ? '—' : formatPrice(stats.commission),
                  sub: '10% trên tổng doanh thu',
                },
                {
                  label: 'Tổng Đơn Hàng',
                  value: loadingStats ? '—' : stats.orders.toLocaleString(),
                  sub: 'Kể từ khi ra mắt',
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
              <div className="px-6 py-4 border-b border-[#E5E5E3]">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
                  Đơn Hàng Gần Đây
                </h2>
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
                    {recentOrders.map((o, i) => {
                      const sid    = o.id ?? o._id ?? `#${i + 1}`
                      const buyer  = o.buyer ?? o.buyer_name ?? o.user ?? '—'
                      const prod   = o.product ?? o.product_name ?? o.listing_title ?? '—'
                      const total  = Number(o.total ?? o.total_price ?? 0)
                      const status = o.status ?? 'completed'
                      const date   = o.date ?? o.created_at?.slice(0, 10) ?? '—'
                      const badge  = STATUS_LABEL[status] ?? STATUS_LABEL.completed
                      return (
                        <tr key={sid} className="border-b border-[#E5E5E3] hover:bg-[#FBFBFA] transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-[#111111]">{sid}</td>
                          <td className="px-4 py-3 text-[#333333]">{buyer}</td>
                          <td className="px-4 py-3 text-[#333333] max-w-[200px] truncate">{prod}</td>
                          <td className="px-4 py-3 font-mono text-xs text-[#111111]">
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
                    })}
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
                  const id        = listing.id ?? listing._id
                  const imgSrc    = listing.images?.[0] ?? null
                  const seller    = listing.seller_name ?? listing.seller?.name ?? 'Người Bán'
                  const email     = listing.seller_email ?? listing.seller?.email ?? ''
                  return (
                    <div key={id} className="bg-white border border-[#E5E5E3] flex flex-col">
                      {/* Image placeholder */}
                      <div className="aspect-[4/3] bg-[#F0F0EE] flex items-center justify-center overflow-hidden">
                        {imgSrc ? (
                          <img src={imgSrc} alt={listing.title} className="w-full h-full object-cover" />
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
                            {formatPrice(Number(listing.price) || 0)}
                          </span>
                          <span className="text-xs border border-[#E5E5E3] px-2 py-0.5 text-[#666666] font-mono uppercase">
                            {listing.condition ?? '—'}
                          </span>
                        </div>

                        <div className="border-t border-[#E5E5E3] pt-3">
                          <p className="text-xs font-mono uppercase tracking-wider text-[#444444]">Người Đăng</p>
                          <p className="text-sm text-[#333333] mt-0.5">{seller}</p>
                          {email && <p className="text-xs text-[#888888]">{email}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto pt-1">
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
