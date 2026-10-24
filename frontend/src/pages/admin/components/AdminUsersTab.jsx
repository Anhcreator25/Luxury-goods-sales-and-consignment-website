import React from 'react'

export default function AdminUsersTab() {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  })()

  return (
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

