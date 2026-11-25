import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { adminServices, listingServices } from '../../services'

// Sub-components
import AdminStatsCards from './components/AdminStatsCards'
import AdminOrdersTable from './components/AdminOrdersTable'
import AdminPendingListings from './components/AdminPendingListings'
import AdminListingDetailModal from './components/AdminListingDetailModal'
import AdminUsersTab from './components/AdminUsersTab'
import AdminEscrowVaultTab from './components/AdminEscrowVaultTab'

const TABS = [
  { id: 'overview', label: 'Tổng Quan' },
  { id: 'listings', label: 'Duyệt Tin Đăng' },
  { id: 'users',    label: 'Người Dùng' },
  { id: 'escrow',   label: 'Ký Quỹ & Giải Ngân' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()

  // ── Authentication Check ────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(null)

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

  // ── Tab State ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview')

  // ── Overview KPI Stats ──────────────────────────────────────────────────
  const [stats, setStats] = useState({
    revenue: 0,
    commission: 0,
    orders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    products: 0,
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
        })
      })
      .catch(err => console.error('Failed to load admin stats:', err))
      .finally(() => setLoadingStats(false))
  }, [activeTab, isAdmin])

  // ── Pending Listings State ──────────────────────────────────────────────
  const [pending, setPending]                 = useState([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [listingBanner, setListingBanner]     = useState(null)

  // ── Detail Modal State ──────────────────────────────────────────────────
  const [selectedListing, setSelectedListing] = useState(null)
  const [loadingDetail, setLoadingDetail]     = useState(false)
  const [detailImageIdx, setDetailImageIdx]   = useState(0)

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

  // ── Access Control Renders ──────────────────────────────────────────────
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

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
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

        {/* Tab Navigation */}
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

        {/* TAB 1: TỔNG QUAN (Stats Cards + Orders Table) */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <AdminStatsCards stats={stats} loadingStats={loadingStats} />
            <AdminOrdersTable />
          </div>
        )}

        {/* TAB 2: DUYỆT TIN ĐĂNG */}
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

        {/* TAB 3: NGƯỜI DÙNG SÀN */}
        {activeTab === 'users' && (
          <AdminUsersTab />
        )}

        {/* TAB 4: SỔ CÁI KÝ QUỸ & GIẢI NGÂN */}
        {activeTab === 'escrow' && (
          <AdminEscrowVaultTab />
        )}
      </div>
    </div>
  )
}
