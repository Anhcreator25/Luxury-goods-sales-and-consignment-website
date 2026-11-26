import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingCount = 0,
  isCollapsed,
  setIsCollapsed,
}) {
  const navigate = useNavigate()

  const navItems = [
    {
      id: 'overview',
      label: 'Tổng Quan',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      desc: 'KPIs & Đơn Hàng',
    },
    {
      id: 'listings',
      label: 'Thẩm Định Tin',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      badge: pendingCount,
      desc: 'Duyệt Hàng Hiệu',
    },
    {
      id: 'users',
      label: 'Người Dùng',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      desc: 'Khách Hàng & KYC',
    },
    {
      id: 'escrow',
      label: 'Ký Quỹ Escrow',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      desc: 'Sổ Cái & Giải Ngân',
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <aside
      className={`bg-white border-r border-[#E5E5E3] flex flex-col justify-between transition-all duration-300 min-h-screen sticky top-0 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand & Collapse Switch */}
      <div>
        <div className="h-20 border-b border-[#E5E5E3] flex items-center justify-between px-5">
          {!isCollapsed && (
            <Link to="/" className="flex flex-col">
              <span className="font-serif tracking-widest text-lg font-bold text-[#111111] uppercase">
                Aura Vault
              </span>
             
            </Link>
          )}

          {isCollapsed && (
            <Link to="/" className="mx-auto font-serif text-lg font-bold text-[#111111]">
              AV
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-[#888888] hover:text-[#111111] hover:bg-[#F5F5F3] transition-colors rounded"
            title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="py-6 px-3 space-y-1.5">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-[#999999] mb-3">
              Quản Trị Hệ Thống
            </p>
          )}

          {navItems.map((item) => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center transition-all duration-200 group relative ${
                  isCollapsed ? 'justify-center p-3' : 'px-3.5 py-3 justify-between'
                } ${
                  active
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'text-[#444444] hover:bg-[#F7F7F6] hover:text-[#111111]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className={`${active ? 'text-white' : 'text-[#666666] group-hover:text-[#111111]'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <div className="text-left">
                      <p className="text-xs font-medium tracking-wide uppercase font-mono leading-none">
                        {item.label}
                      </p>
                      <p className={`text-[10px] mt-1 ${active ? 'text-[#AAAAAA]' : 'text-[#888888]'}`}>
                        {item.desc}
                      </p>
                    </div>
                  )}
                </div>

                {/* Badge for Pending Items */}
                {item.badge > 0 && (
                  <span
                    className={`${
                      isCollapsed
                        ? 'absolute top-2 right-2 w-2 h-2 rounded-full bg-[#111111]'
                        : `text-[10px] font-mono px-2 py-0.5 tracking-wider font-semibold ${
                            active
                              ? 'bg-white text-[#111111]'
                              : 'bg-[#111111] text-white'
                          }`
                    }`}
                  >
                    {!isCollapsed ? item.badge : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-[#E5E5E3] space-y-2">
        <Link
          to="/"
          className={`flex items-center gap-3 text-xs text-[#666666] hover:text-[#111111] py-2 px-3 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Về Trang Sàn"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {!isCollapsed && <span className="font-mono uppercase text-[11px] tracking-wider">Xem Sàn Đấu Giá</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 text-xs text-[#9A2222] hover:bg-[#FDF2F2] py-2 px-3 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Đăng Xuất"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="font-mono uppercase text-[11px] tracking-wider">Đăng Xuất</span>}
        </button>
      </div>
    </aside>
  )
}
