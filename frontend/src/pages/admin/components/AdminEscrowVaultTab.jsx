import React, { useState, useEffect } from 'react'
import { formatPrice, formatDate } from '../../../utils/formatters'
import { orderServices } from '../../../services'
import AdminDisburseModal from './AdminDisburseModal'

// Admin Escrow Vault Management Tab: Streamlined view with focus on Pending & Completed Payouts
export default function AdminEscrowVaultTab() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'completed'

  // Modal payout trigger state
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPayouts()
  }, [])

  // Fetch all escrow payouts from backend
  const fetchPayouts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await orderServices.getAdminEscrowPayouts()
      const data = res.data?.data || res.data || []
      setPayouts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Lỗi lấy danh sách ký quỹ:', err)
      setError(err?.response?.data?.message || 'Không thể tải danh sách ký quỹ.')
    } finally {
      setLoading(false)
    }
  }

  // Confirm disbursement
  const handleConfirmDisburse = async (payoutId, payload) => {
    try {
      setSubmitting(true)
      setError('')
      const res = await orderServices.disburseEscrowPayout(payoutId, payload)
      setSuccess(res.data?.message || 'Giải ngân thành công!')
      setSelectedPayout(null)
      await fetchPayouts()
      setActiveTab('completed')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi giải ngân.')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter pending payouts strictly when order is completed
  const pendingPayouts = payouts.filter(p => p.payout_status === 'pending' && p.order_status === 'completed')
  const completedPayouts = payouts.filter(p => p.payout_status === 'completed')

  // Calculate sum metrics
  const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + Number(p.net_payout || 0), 0)
  const totalCompletedAmount = completedPayouts.reduce((sum, p) => sum + Number(p.net_payout || 0), 0)

  return (
    <div className="space-y-6 font-sans">
      {/* Alerts */}
      {error && (
        <div className="bg-[#FDF2F2] border-l-2 border-[#D93838] px-4 py-3">
          <p className="text-sm text-[#9A2222]">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-[#F2F8F4] border-l-2 border-[#1E7E34] px-4 py-3">
          <p className="text-sm text-[#155724]">{success}</p>
        </div>
      )}

      {/* 2 Focus KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending Card */}
        <div 
          onClick={() => setActiveTab('pending')}
          className={`p-5 border cursor-pointer transition-all ${
            activeTab === 'pending'
              ? 'border-[#111111] bg-white ring-1 ring-[#111111]'
              : 'border-[#E5E5E3] bg-[#FAFAFA] hover:border-[#CCCCCC]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">⏳ Cần Giải Ngân</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FFF8E6] text-[#856404] border border-[#FFE8A1]">
              {pendingPayouts.length} Đơn Hàng
            </span>
          </div>
          <p className="text-2xl font-bold text-[#111111] leading-none mb-1">
            {formatPrice(totalPendingAmount)}
          </p>
          <p className="text-xs text-[#888888]">
            Đơn hàng khách mua đã bấm nhận hàng, đang chờ chuyển tiền cho Người bán.
          </p>
        </div>

        {/* Completed Card */}
        <div 
          onClick={() => setActiveTab('completed')}
          className={`p-5 border cursor-pointer transition-all ${
            activeTab === 'completed'
              ? 'border-[#111111] bg-white ring-1 ring-[#111111]'
              : 'border-[#E5E5E3] bg-[#FAFAFA] hover:border-[#CCCCCC]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">✅ Đã Giải Ngân</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F2F8F4] text-[#155724] border border-[#D4EDDA]">
              {completedPayouts.length} Đơn Hàng
            </span>
          </div>
          <p className="text-2xl font-bold text-[#111111] leading-none mb-1">
            {formatPrice(totalCompletedAmount)}
          </p>
          <p className="text-xs text-[#888888]">
            Lịch sử các khoản đã chuyển khoản thành công về tài khoản Người bán.
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-[#E5E5E3]">
        {/* Table Filter Tabs */}
        <div className="px-6 py-4 border-b border-[#E5E5E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#111111]">
            Sổ Cái Giải Ngân Ký Quỹ ({activeTab === 'pending' ? pendingPayouts.length : completedPayouts.length})
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 transition-colors border cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-[#FBFBFA] text-[#666666] border-[#E5E5E3] hover:text-[#111111]'
              }`}
            >
              Chờ Giải Ngân ({pendingPayouts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 transition-colors border cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-[#FBFBFA] text-[#666666] border-[#E5E5E3] hover:text-[#111111]'
              }`}
            >
              Lịch Sử Đã Giải Ngân ({completedPayouts.length})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E3] bg-[#FBFBFA]">
                {activeTab === 'pending'
                  ? ['Mã ĐH', 'Người Bán (Seller)', 'Tiền Đơn Hàng', 'Phí Sàn (5%)', 'Thực Chuyển (95%)', 'STK Nhận Tiền', 'Hành Động'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#444444]">
                        {h}
                      </th>
                    ))
                  : ['Mã ĐH', 'Người Bán (Seller)', 'Đã Chuyển (95%)', 'STK Lúc Chuyển', 'Mã GD (Ref)', 'Thời Gian', 'Trạng Thái'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#444444]">
                        {h}
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs font-mono text-[#888888]">
                    Đang tải danh sách ký quỹ...
                  </td>
                </tr>
              ) : (activeTab === 'pending' ? pendingPayouts : completedPayouts).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs font-mono text-[#888888]">
                    {activeTab === 'pending' ? 'Không có đơn hàng nào đang chờ giải ngân.' : 'Chưa có lịch sử giải ngân.'}
                  </td>
                </tr>
              ) : (
                (activeTab === 'pending' ? pendingPayouts : completedPayouts).map((p) => {
                  const hasBank = Boolean(p.default_account_number || p.recipient_account)
                  const bankDisplay = p.default_bank_name || p.recipient_bank || 'Chưa liên kết'
                  const accDisplay = p.default_account_number || p.recipient_account || '—'
                  const holderDisplay = p.default_account_holder || p.recipient_name || p.seller_name

                  return (
                    <tr key={p.payout_id} className="hover:bg-[#FBFBFA] transition-colors">
                      {/* Order Code */}
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#111111]">
                        #{p.order_id}
                      </td>

                      {/* Seller Info */}
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-semibold text-[#111111]">{p.seller_name}</p>
                        <p className="text-[10px] font-mono text-[#888888]">{p.seller_email}</p>
                      </td>

                      {activeTab === 'pending' ? (
                        <>
                          {/* Order Amount */}
                          <td className="px-4 py-3.5 font-mono text-xs text-[#555555]">
                            {formatPrice(p.amount)}
                          </td>

                          {/* Commission */}
                          <td className="px-4 py-3.5 font-mono text-xs text-[#888888]">
                            -{formatPrice(p.commission_fee)}
                          </td>

                          {/* Net Payout */}
                          <td className="px-4 py-3.5 font-mono text-sm font-bold text-[#1E7E34]">
                            {formatPrice(p.net_payout)}
                          </td>

                          {/* Bank details */}
                          <td className="px-4 py-3.5 text-xs font-mono">
                            {hasBank ? (
                              <div>
                                <span className="font-semibold text-[#111111]">{bankDisplay}</span>
                                <p className="text-[#555555] font-bold">{accDisplay}</p>
                                <p className="text-[10px] text-[#777777] uppercase">{holderDisplay}</p>
                              </div>
                            ) : (
                              <span className="text-[10px] bg-[#FFF8E6] text-[#856404] px-1.5 py-0.5 border border-[#FFE8A1]">
                                ⚠️ Chưa liên kết STK
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3.5">
                            {hasBank ? (
                              <button
                                type="button"
                                onClick={() => setSelectedPayout(p)}
                                className="bg-[#111111] text-white text-xs font-mono uppercase tracking-wider px-3.5 py-2 hover:bg-[#2A2A2A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <span>💸</span>
                                <span>Bắn Tiền</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="bg-[#F0F0EE] text-[#999999] text-xs font-mono uppercase tracking-wider px-3 py-2 border border-[#E5E5E3] cursor-not-allowed"
                                title="Người bán chưa liên kết STK ngân hàng"
                              >
                                Chờ STK
                              </button>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Disbursed Amount */}
                          <td className="px-4 py-3.5 font-mono text-sm font-bold text-[#111111]">
                            {formatPrice(p.net_payout)}
                          </td>

                          {/* Bank Snapshot */}
                          <td className="px-4 py-3.5 text-xs font-mono text-[#555555]">
                            <p className="font-semibold text-[#111111]">{p.recipient_bank || '—'}</p>
                            <p>{p.recipient_account || '—'}</p>
                            <p className="text-[10px] uppercase text-[#777777]">{p.recipient_name || '—'}</p>
                          </td>

                          {/* Transaction Ref */}
                          <td className="px-4 py-3.5 font-mono text-xs text-[#1E7E34] font-semibold">
                            {p.transaction_ref || 'Chuyển Khoản'}
                          </td>

                          {/* Disbursed At */}
                          <td className="px-4 py-3.5 font-mono text-xs text-[#888888]">
                            {p.disbursed_at ? formatDate(p.disbursed_at) : formatDate(p.created_at)}
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#F2F8F4] text-[#155724] border border-[#D4EDDA]">
                              ✓ Đã Giải Ngân
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse VietQR Modal */}
      <AdminDisburseModal 
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
        onConfirm={handleConfirmDisburse}
        submitting={submitting}
      />
    </div>
  )
}
