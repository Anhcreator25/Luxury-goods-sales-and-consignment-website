import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminServices, listingServices } from '../../services'

import AdminSidebar from './components/AdminSidebar'
import AdminStatsCards from './components/AdminStatsCards'
import AdminOrdersTable from './components/AdminOrdersTable'
import AdminPendingListings from './components/AdminPendingListings'
import AdminListingDetailModal from './components/AdminListingDetailModal'

const AdminRevenueChart = lazy(() => import('./components/AdminRevenueChart'))
const AdminUsersTab = lazy(() => import('./components/AdminUsersTab'))
const AdminEscrowVaultTab = lazy(() => import('./components/AdminEscrowVaultTab'))

// Renders admin dashboard shell and coordinates tab state
export default function AdminDashboard() {
  const navigate = useNavigate()
  const bannerTimerRef = useRef(null)

  const [isAdmin, setIsAdmin] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')
    if (!token || !raw) {
      setIsAdmin(false)
      return
    }
    try {
      const u = JSON.parse(raw)
      setUser(u)
      setIsAdmin(u?.role === 'admin')
    } catch {
      setIsAdmin(false)
    }
  }, [])

  // ── Navigation State ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // ── Overview KPI Stats ──────────────────────────────────────────────────
  const [stats, setStats] = useState({
    revenue: 0,
    commission: 0,
    orders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    products: 0,
    pendingProducts: 0,
  })
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    if (activeTab !== 'overview' || !isAdmin) return
    setLoadingStats(true)
    adminServices.getStats()
      .then(res => {
        const d = res.data || res || {}
        setStats({
          revenue: d.revenue || 0,
          commission: d.commission || 0,
          orders: d.orders || 0,
          paidOrders: d.paidOrders || 0,
          pendingOrders: d.pendingOrders || 0,
          cancelledOrders: d.cancelledOrders || 0,
          products: d.activeProducts || 0,
          pendingProducts: d.pendingProducts || 0,
        })
      })
      .catch(err => console.error('Failed to load admin stats:', err))
      .finally(() => setLoadingStats(false))
  }, [activeTab, isAdmin])

  const [pending, setPending] = useState([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [listingBanner, setListingBanner] = useState(null)

  const [selectedListing, setSelectedListing] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailImageIdx, setDetailImageIdx] = useState(0)

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

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
    }
  }, [])

  // Opens detail modal for a pending listing
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

  // Approves or rejects a pending listing and updates banner
  const handleListingAction = async (id, status) => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
    try {
      await listingServices.updateListingStatus(id, status)
      setPending(prev => prev.filter(l => (l.id ?? l._id) !== id))
      setStats(prev => ({ ...prev, pendingProducts: Math.max(0, prev.pendingProducts - 1) }))
      setListingBanner({
        type: 'success',
        msg: `Tin đăng #${id} đã được ${status === 'active' ? 'duyệt thành công' : 'từ chối'}.`,
      })
    } catch {
      setListingBanner({
        type: 'error',
        msg: `Cập nhật trạng thái tin #${id} thất bại. Vui lòng thử lại.`,
      })
    } finally {
      bannerTimerRef.current = setTimeout(() => setListingBanner(null), 4000)
    }
  }

  // ── Access Control Renders ──────────────────────────────────────────────
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center">
        <div className="text-xs font-mono uppercase tracking-widest text-[#888888] animate-pulse">
          Đang xác thực bảo mật quyền quản trị…
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#E5E5E3] p-8 text-center shadow-sm">
          <p className="text-4xl mb-4 select-none">🔒</p>
          <h1 className="text-base font-bold uppercase tracking-wider text-[#111111] mb-2 font-mono">
            Truy Cập Bị Từ Chối
          </h1>
          <p className="text-xs text-[#666666] mb-6">
            Tài khoản hiện tại không có quyền truy cập vào trung tâm điều phối quản trị Aura Vault.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-[#111111] text-white text-xs font-mono uppercase tracking-wider hover:bg-black transition-colors"
            >
              Về Trang Chủ
            </button>
            <Link
              to="/login"
              className="px-5 py-2.5 border border-[#111111] text-[#111111] text-xs font-mono uppercase tracking-wider hover:bg-[#F5F5F3] transition-colors"
            >
              Đăng Nhập Khác
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col md:flex-row font-sans text-[#111111]">
      {/* 1. Left Fixed / Collapsible Portal Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={activeTab === 'listings' ? pending.length : stats.pendingProducts}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* 2. Main Administration Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Minimalist Header */}
        <header className="h-20 bg-white border-b border-[#E5E5E3] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-20">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888888]">
              Aura Vault Management Suite
            </p>
            <h1 className="text-lg font-bold font-serif uppercase tracking-tight text-[#111111]">
              {activeTab === 'overview' && 'Bảng Điều Khiển Tổng Quan'}
              {activeTab === 'listings' && 'Thẩm Định Tin Ký Gửi'}
              {activeTab === 'users' && 'Quản Lý Tài Khoản Khách Hàng'}
              {activeTab === 'escrow' && 'Sổ Cái Ký Quỹ & Giải Ngân'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#111111]">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">Super Admin</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-mono text-xs font-bold shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <div className="p-6 lg:p-10 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <AdminStatsCards stats={stats} loadingStats={loadingStats} />
              <Suspense fallback={<div className="h-[360px] bg-white border border-[#E5E5E3] animate-pulse" />}>
                <AdminRevenueChart />
              </Suspense>
              <AdminOrdersTable />
            </div>
          )}

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

          {activeTab === 'users' && (
            <Suspense fallback={<div className="h-64 bg-white border border-[#E5E5E3] animate-pulse" />}>
              <AdminUsersTab />
            </Suspense>
          )}

          {activeTab === 'escrow' && (
            <Suspense fallback={<div className="h-64 bg-white border border-[#E5E5E3] animate-pulse" />}>
              <AdminEscrowVaultTab />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  )
}
