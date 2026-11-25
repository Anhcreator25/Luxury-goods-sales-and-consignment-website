import React, { useState, useEffect } from 'react'
import { adminServices } from '../../../services'
import { formatDate } from '../../../utils/formatters'
import AdminPagination from './AdminPagination'

export default function AdminUsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 })

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        setError('')
        const res = await adminServices.getUsers({
          page,
          limit: pagination.limit,
          role: roleFilter,
          search: search.trim()
        })
        if (!isMounted) return
        const data = res.data || res || {}
        setUsers(data.users || [])
        setPagination({
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          limit: data.limit || 10
        })
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load users:', err)
        setError(err?.response?.data?.message || 'Không thể tải danh sách người dùng sàn.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }, search ? 400 : 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [page, roleFilter, search])

  const sellerCount = users.filter(u => Number(u.total_listings) > 0).length
  const buyerOnlyCount = users.filter(u => Number(u.total_listings) === 0 && u.role !== 'admin').length

  return (
    <div className="space-y-6 font-sans">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E5E3] p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1">
            Tổng Thành Viên Sàn
          </p>
          <p className="text-2xl font-bold text-[#111111] leading-none">
            {pagination.total}
          </p>
          <p className="text-[11px] text-[#888888] mt-1.5">Tài khoản đã đăng ký</p>
        </div>

        <div className="bg-white border border-[#E5E5E3] p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1">
            Người Bán (Sellers)
          </p>
          <p className="text-2xl font-bold text-[#111111] leading-none">
            {sellerCount} <span className="text-xs font-normal text-[#888888]">(trang này)</span>
          </p>
          <p className="text-[11px] text-[#888888] mt-1.5">Đã đăng ít nhất 1 sản phẩm</p>
        </div>

        <div className="bg-white border border-[#E5E5E3] p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#777777] mb-1">
            Người Mua Thuần Túy
          </p>
          <p className="text-2xl font-bold text-[#111111] leading-none">
            {buyerOnlyCount} <span className="text-xs font-normal text-[#888888]">(trang này)</span>
          </p>
          <p className="text-[11px] text-[#888888] mt-1.5">Chưa từng đăng tin ký gửi</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-[#E5E5E3]">
        {/* Controls Bar: Search & Role Filter Tabs */}
        <div className="px-6 py-4 border-b border-[#E5E5E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
            Danh Sách Người Dùng Sàn ({pagination.total})
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm tên, email, SĐT..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full sm:w-60 text-xs px-3 py-1.5 bg-[#FBFBFA] border border-[#E5E5E3] focus:border-[#111111] focus:outline-none transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setPage(1)
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#111111]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              {[
                { id: 'all',   label: 'Tất Cả' },
                { id: 'user',  label: 'Người Dùng' },
                { id: 'admin', label: 'Quản Trị' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setRoleFilter(tab.id)
                    setPage(1)
                  }}
                  className={`text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 transition-colors border cursor-pointer ${
                    roleFilter === tab.id
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-[#FBFBFA] text-[#666666] border-[#E5E5E3] hover:text-[#111111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-4 bg-[#FDF2F2] border-l-2 border-[#D93838] p-3 text-xs text-[#9A2222]">
            {error}
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E3] bg-[#FBFBFA]">
                {['Thành Viên', 'Email & SĐT', 'Vai Trò', 'Hoạt Động Sàn', 'Ngày Tham Gia'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#444444]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-xs font-mono text-[#888888] animate-pulse">
                    Đang tải danh sách người dùng sàn...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-xs font-mono text-[#888888]">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const initial = (u.name || u.email || 'U').charAt(0).toUpperCase()
                  const isSeller = Number(u.total_listings) > 0

                  return (
                    <tr key={u.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center text-xs font-mono font-bold select-none ${
                            u.role === 'admin' 
                              ? 'bg-[#111111] text-white' 
                              : isSeller 
                                ? 'bg-[#D4AF37] text-white' 
                                : 'bg-[#E5E5E3] text-[#444444]'
                          }`}>
                            {initial}
                          </div>
                          <div>
                            <p className="font-medium text-[#111111] leading-tight">
                              {u.name || 'Thành viên'}
                            </p>
                            <span className="text-[10px] font-mono text-[#888888]">
                              ID: #{u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs text-[#333333]">{u.email}</p>
                        <p className="text-xs text-[#888888] mt-0.5">{u.phone || 'Chưa cập nhật SĐT'}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 ${
                            u.role === 'admin'
                              ? 'bg-[#111111] text-white'
                              : 'bg-[#F2F8F4] text-[#155724] border border-[#D4EDDA]'
                          }`}>
                            {u.role === 'admin' ? 'Quản Trị Viên' : 'Người Dùng Sàn'}
                          </span>
                          {isSeller && (
                            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-[#FFF8E6] text-[#856404] border border-[#FFE8A1]">
                              ⭐ Người Bán (Seller)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs">
                        <div className="space-y-0.5">
                          <p className="text-[#333333]">
                            <span className="font-semibold text-[#111111]">{u.total_listings}</span> tin đăng bán
                          </p>
                          <p className="text-[#666666]">
                            <span className="font-semibold text-[#111111]">{u.total_purchases}</span> đơn đã mua
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs text-[#888888]">
                        {formatDate ? formatDate(u.created_at) : (u.created_at?.slice(0, 10) || '—')}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Shared Pagination Component */}
        <AdminPagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          itemLabel="người dùng"
          loading={loading}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
