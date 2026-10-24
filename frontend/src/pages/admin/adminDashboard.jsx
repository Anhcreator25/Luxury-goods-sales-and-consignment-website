import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { orderServices, listingServices } from '../../services'

// Sub-components
import AdminStatsCards from './components/AdminStatsCards'
import AdminOrdersTable from './components/AdminOrdersTable'
import AdminPendingListings from './components/AdminPendingListings'
import AdminListingDetailModal from './components/AdminListingDetailModal'
import AdminUsersTab from './components/AdminUsersTab'

// Navigation tab identifiers
const TABS = [
  { id: 'overview', label: 'Tổng Quan' },
  { id: 'listings', label: 'Duyệt Tin Đăng' },
  { id: 'users',    label: 'Người Dùng' },
]

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
  const [pending, setPending]                 = useState([])
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

  // ── open detail modal ───────────────────────────────────────────────────
  const handleOpenDetail = async (id) => {
    setLoadingDetail(true)
    setSelectedListing(null)
    setDetailImageIdx(0)
    try {
      const res = await listingServices.getListingById(id)
      const data = res.data?.data ?? res.data?.listing ?? res.data ?? null
      setSelectedListing(data)
    } catch {
      setSelectedListing(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  // ── approve / reject listing ────────────────────────────────────────────
  const handleListingAction = async (id, status) => {
    try {
      await listingServices.updateListingStatus(id, status)
      setPending(prev => prev.filter(l => (l.id ?? l._id) !== id))
      setListingBanner({
        type: 'success',
        msg: `Tin đăng #${id} đã được ${status === 'active' ? 'duyệt thành công' : 'từ chối'}.`,
      })
      setTimeout(() => setListingBanner(null), 4000)
    } catch {
      setListingBanner({
        type: 'error',
        msg: `Cập nhật trạng thái tin #${id} thất bại. Vui lòng thử lại.`,
      })
      setTimeout(() => setListingBanner(null), 4000)
    }
  }

  // ── access control renders ──────────────────────────────────────────────
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#FBFBFA]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] text-xs font-mono uppercase tracking-wider text-[#888888] animate-pulse">
          Đang xác thực quyền truy cập…
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#FBFBFA]">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <p className="text-4xl mb-4 select-none">🔒</p>
          <h1 className="text-lg font-bold text-[#111111] mb-2">Truy Cập Bị Từ Chối</h1>
          <p className="text-xs text-[#666666] mb-6">
            Bạn không có quyền quản trị viên để xem trang này.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#333333] transition-colors"
            >
              Về Trang Chủ
            </button>
            <Link
              to="/login"
              className="px-5 py-2.5 border border-[#111111] text-[#111111] text-xs font-mono uppercase tracking-wider hover:bg-[#111111] hover:text-white transition-colors"
            >
              Đăng Nhập Khác
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── main render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="mb-8 border-b border-[#E5E5E3] pb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-1">
            Bảng Điều Khiển Quản Trị
          </p>
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              ADMIN DASHBOARD
            </h1>
            <span className="text-xs font-mono text-[#888888]">Quản Trị Sàn Aura Vault</span>
          </div>
        </div>

        {/* Tab navigation bar */}
        <div className="flex border-b border-[#E5E5E3] mb-8 gap-0">
          {TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors -mb-px ${
                  active
                    ? 'border-[#111111] text-[#111111] font-bold bg-white'
                    : 'border-transparent text-[#888888] hover:text-[#111111]'
                }`}
              >
                {tab.label}
                {tab.id === 'listings' && pending.length > 0 && (
                  <span className="ml-2 bg-[#D93838] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {pending.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ════ TAB 1: TỔNG QUAN ════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <AdminStatsCards stats={stats} loadingStats={loadingStats} />
            <AdminOrdersTable 
              orders={filteredOrders} 
              stats={stats} 
              orderFilter={orderFilter} 
              setOrderFilter={setOrderFilter} 
            />
          </div>
        )}

        {/* ════ TAB 2: DUYỆT TIN ĐĂNG ══════════════════════════════════ */}
        {activeTab === 'listings' && (
          <>
            <AdminPendingListings 
              pending={pending}
              loadingListings={loadingListings}
              listingBanner={listingBanner}
              handleOpenDetail={handleOpenDetail}
              handleListingAction={handleListingAction}
            />
            <AdminListingDetailModal 
              selectedListing={selectedListing}
              setSelectedListing={setSelectedListing}
              loadingDetail={loadingDetail}
              detailImageIdx={detailImageIdx}
              setDetailImageIdx={setDetailImageIdx}
              handleListingAction={handleListingAction}
            />
          </>
        )}

        {/* ════ TAB 3: NGƯỜI DÙNG ═══════════════════════════════════════ */}
        {activeTab === 'users' && (
          <AdminUsersTab />
        )}

      </div>
    </div>
  )
}
