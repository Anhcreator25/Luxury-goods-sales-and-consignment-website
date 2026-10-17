import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { orderServices, listingServices } from '../../services'

export default function ProfilePage() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [orderCount, setOrderCount] = useState(0)
  const [productCount, setProductCount] = useState(0)

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password form
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwMsgType, setPwMsgType] = useState('info') // 'info' | 'error'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setUser(u)
        setProfileForm({
          name:    u.name || u.full_name || '',
          email:   u.email || '',
          phone:   u.phone || u.phone_number || '',
          address: u.address || u.default_address || '',
        })
      } catch { /* ignore */ }
    }

    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.allSettled([
        orderServices.getOrders(),
        listingServices.getListings(),
      ])
      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value.data
        setOrderCount(Array.isArray(d) ? d.length : (d?.orders?.length || d?.data?.length || 0))
      }
      if (productsRes.status === 'fulfilled') {
        const d = productsRes.value.data
        setProductCount(Array.isArray(d) ? d.length : (d?.listings?.length || d?.data?.length || 0))
      }
    } catch { /* ignore */ }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (!profileForm.name.trim()) {
      setProfileError('Vui lòng nhập họ và tên.')
      return
    }

    try {
      const stored = localStorage.getItem('user')
      const u = stored ? JSON.parse(stored) : {}
      const updated = {
        ...u,
        name:            profileForm.name.trim(),
        full_name:       profileForm.name.trim(),
        phone:           profileForm.phone.trim(),
        phone_number:    profileForm.phone.trim(),
        address:         profileForm.address.trim(),
        default_address: profileForm.address.trim(),
      }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setProfileSuccess('Thông tin đã được cập nhật!')
      setTimeout(() => setProfileSuccess(''), 4000)
    } catch {
      setProfileError('Không thể lưu thông tin. Vui lòng thử lại.')
    }
  }

  const handlePwChange = (e) => {
    const { name, value } = e.target
    setPwForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePwSubmit = (e) => {
    e.preventDefault()
    setPwMsg('Tính năng đang cập nhật.')
    setPwMsgType('info')
    setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }

  const initial = (user?.name || user?.full_name || user?.email || '?').charAt(0).toUpperCase()
  const displayName = user?.name || user?.full_name || user?.email || 'Người Dùng'
  const role = user?.role || 'USER'

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-1">Tài Khoản</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] uppercase">Hồ Sơ Của Tôi</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:col-span-1">
            <div className="border border-[#E5E5E3] bg-white p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-[#111111] flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-white select-none">{initial}</span>
                </div>
                <p className="text-base font-bold text-[#111111]">{displayName}</p>
                <p className="text-xs font-mono text-[#888888] mt-0.5 break-all">{user?.email || ''}</p>
                <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${
                  role === 'ADMIN'
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-[#F5F5F3] text-[#444444] border-[#E5E5E3]'
                }`}>
                  {role}
                </span>
              </div>

              <div className="border-t border-[#E5E5E3] my-4" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="border border-[#E5E5E3] p-3 text-center">
                  <p className="text-xl font-bold text-[#111111]">{orderCount}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888] mt-0.5">Đơn Hàng</p>
                </div>
                <div className="border border-[#E5E5E3] p-3 text-center">
                  <p className="text-xl font-bold text-[#111111]">{productCount}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888] mt-0.5">Sản Phẩm Ký Gửi</p>
                </div>
              </div>

              {/* Nav Links */}
              <div className="space-y-2">
                <Link
                  to="/my-orders"
                  className="flex items-center justify-between w-full border border-[#E5E5E3] px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#444444] hover:border-[#111111] hover:text-[#111111] transition-colors duration-150"
                >
                  <span>Đơn Hàng Của Tôi</span>
                  <span className="text-[#BBBBBB]">→</span>
                </Link>
                <Link
                  to="/my-products"
                  className="flex items-center justify-between w-full border border-[#E5E5E3] px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#444444] hover:border-[#111111] hover:text-[#111111] transition-colors duration-150"
                >
                  <span>Sản Phẩm Ký Gửi</span>
                  <span className="text-[#BBBBBB]">→</span>
                </Link>
                <Link
                  to="/incoming-orders"
                  className="flex items-center justify-between w-full border border-[#E5E5E3] px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#444444] hover:border-[#111111] hover:text-[#111111] transition-colors duration-150"
                >
                  <span>Đơn Từ Khách Mua</span>
                  <span className="text-[#BBBBBB]">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── PROFILE FORM ── */}
            <div className="border border-[#E5E5E3] bg-white p-6">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#111111] mb-5">Cập Nhật Hồ Sơ</h2>

              {profileError && (
                <div className="mb-4 bg-[#FDF2F2] border-l-2 border-[#D93838] px-4 py-3">
                  <p className="text-sm text-[#9A2222]">{profileError}</p>
                </div>
              )}
              {profileSuccess && (
                <div className="mb-4 bg-[#F2F8F4] border-l-2 border-[#1E7E34] px-4 py-3">
                  <p className="text-sm text-[#155724]">{profileSuccess}</p>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Họ Và Tên <span className="text-[#D93838]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    disabled
                    className="w-full border border-[#E5E5E3] bg-[#F0F0EE] px-4 py-2.5 text-sm text-[#888888] cursor-not-allowed font-mono"
                  />
                  <p className="text-[10px] text-[#AAAAAA] mt-1 font-mono">Email không thể thay đổi.</p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="0912 345 678"
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Địa Chỉ Mặc Định
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-8 py-3 hover:bg-[#2A2A2A] transition-colors duration-150"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>

            {/* ── CHANGE PASSWORD ── */}
            <div className="border border-[#E5E5E3] bg-white p-6">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#111111] mb-5">Đổi Mật Khẩu</h2>

              {pwMsg && (
                <div className={`mb-4 px-4 py-3 border-l-2 ${
                  pwMsgType === 'error'
                    ? 'bg-[#FDF2F2] border-[#D93838]'
                    : 'bg-[#F5F5F3] border-[#AAAAAA]'
                }`}>
                  <p className={`text-sm ${pwMsgType === 'error' ? 'text-[#9A2222]' : 'text-[#444444]'}`}>
                    {pwMsg}
                  </p>
                </div>
              )}

              <form onSubmit={handlePwSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                    Mật Khẩu Cũ
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={pwForm.oldPassword}
                    onChange={handlePwChange}
                    placeholder="••••••••"
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                      Mật Khẩu Mới
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={pwForm.newPassword}
                      onChange={handlePwChange}
                      placeholder="••••••••"
                      className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                      Xác Nhận Mật Khẩu
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={pwForm.confirmPassword}
                      onChange={handlePwChange}
                      placeholder="••••••••"
                      className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111] transition-colors duration-150"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-8 py-3 hover:bg-[#2A2A2A] transition-colors duration-150"
                  >
                    Đổi Mật Khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}

