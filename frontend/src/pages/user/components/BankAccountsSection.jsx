import React, { useState, useEffect } from 'react'
import { userServices } from '../../../services'

// Common Vietnamese banks list with codes
export const VIETNAMESE_BANKS = [
  { code: 'VCB', name: 'Vietcombank (Ngoại Thương Việt Nam)' },
  { code: 'MB',  name: 'MB Bank (Quân Đội)' },
  { code: 'TCB', name: 'Techcombank (Kỹ Thương)' },
  { code: 'ACB', name: 'ACB (Á Châu)' },
  { code: 'BIDV',name: 'BIDV (Đầu Tư và Phát Triển)' },
  { code: 'CTG', name: 'VietinBank (Công Thương Việt Nam)' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)' },
  { code: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)' },
  { code: 'HDB', name: 'HDBank (Phát Triển TP.HCM)' },
  { code: 'VIB', name: 'VIB (Quốc Tế)' },
  { code: 'SHB', name: 'SHB (Sài Gòn - Hà Nội)' },
]

export default function BankAccountsSection() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [form, setForm] = useState({
    bank_name: '',
    bank_account_number: '',
    bank_account_holder: '',
    is_default: false,
  })

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    try {
      setLoading(true)
      const res = await userServices.getBankAccounts()
      const data = res.data?.data || res.data || []
      setAccounts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Lỗi lấy tài khoản ngân hàng:', err)
      setError('Không thể tải thông tin tài khoản ngân hàng.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.bank_name || !form.bank_account_number.trim() || !form.bank_account_holder.trim()) {
      setError('Vui lòng chọn ngân hàng, nhập số tài khoản và họ tên chủ tài khoản.')
      return
    }

    try {
      setSubmitting(true)
      await userServices.addBankAccount({
        bank_name: form.bank_name,
        bank_account_number: form.bank_account_number.trim(),
        bank_account_holder: form.bank_account_holder.trim().toUpperCase(),
        is_default: form.is_default ? 1 : (accounts.length === 0 ? 1 : 0),
      })
      setSuccess('Liên kết tài khoản ngân hàng thành công!')
      setForm({
        bank_name: '',
        bank_account_number: '',
        bank_account_holder: '',
        is_default: false,
      })
      await fetchBankAccounts()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi liên kết tài khoản ngân hàng.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetDefault = async (id) => {
    try {
      setError('')
      await userServices.setDefaultBankAccount(id)
      setSuccess('Đã đổi tài khoản mặc định nhận tiền!')
      await fetchBankAccounts()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể đổi tài khoản mặc định.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa liên kết tài khoản ngân hàng này?')) return

    try {
      setError('')
      await userServices.deleteBankAccount(id)
      setSuccess('Đã xóa tài khoản ngân hàng thành công!')
      await fetchBankAccounts()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể xóa tài khoản ngân hàng.')
    }
  }

  return (
    <div className="border border-[#E5E5E3] bg-white p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#111111]">
            Tài Khoản Ngân Hàng Nhận Tiền
          </h2>
          <p className="text-xs text-[#777777] mt-0.5">
            Dùng để nhận tiền bán hàng khi đơn hàng được giải ngân từ Quỹ Ký Quỹ Aura Vault.
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#F5F5F3] text-[#555555] border border-[#E5E5E3] self-start sm:self-auto">
          Bảo mật Vault
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-[#FDF2F2] border-l-2 border-[#D93838] px-4 py-3">
          <p className="text-sm text-[#9A2222]">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-[#F2F8F4] border-l-2 border-[#1E7E34] px-4 py-3">
          <p className="text-sm text-[#155724]">{success}</p>
        </div>
      )}

      {/* Linked bank accounts list */}
      <div className="space-y-3 mb-6">
        {loading ? (
          <div className="p-4 border border-[#E5E5E3] bg-[#FAFAFA] animate-pulse">
            <div className="h-4 bg-[#E5E5E3] w-48 mb-2" />
            <div className="h-3 bg-[#E5E5E3] w-32" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-5 border border-dashed border-[#E5E5E3] bg-[#FBFBFA] text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-[#666666] mb-1">
              Chưa Có Tài Khoản Ngân Hàng Nào
            </p>
            <p className="text-[11px] text-[#888888]">
              Hãy liên kết tài khoản ngân hàng bên dưới để nhận tiền thanh toán khi bán được hàng.
            </p>
          </div>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className={`p-4 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                acc.is_default
                  ? 'border-[#111111] bg-[#FAF9F7]'
                  : 'border-[#E5E5E3] bg-[#FAFAFA] hover:border-[#CCCCCC]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#111111] font-sans">
                    🏦 {acc.bank_name}
                  </span>
                  {acc.is_default ? (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#111111] text-white">
                      ✓ Mặc Định
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(acc.id)}
                      className="text-[10px] font-mono uppercase text-[#777777] hover:text-[#111111] underline cursor-pointer"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </div>
                <div className="text-xs font-mono text-[#555555]">
                  Số tài khoản: <strong className="text-[#111111] text-sm">{acc.bank_account_number}</strong>
                </div>
                <div className="text-xs font-mono text-[#777777] uppercase">
                  Chủ TK: <span className="font-semibold text-[#222222]">{acc.bank_account_holder}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleDelete(acc.id)}
                  className="text-xs font-mono uppercase text-[#D93838] hover:underline cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[#E5E5E3] my-5" />

      {/* Add new bank account form */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-widest text-[#111111] mb-3">
          + Thêm Tài Khoản Ngân Hàng Mới
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                Ngân Hàng <span className="text-[#D93838]">*</span>
              </label>
              <select
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
                className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer"
              >
                <option value="">-- Chọn ngân hàng --</option>
                {VIETNAMESE_BANKS.map((b) => (
                  <option key={b.code} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                Số Tài Khoản <span className="text-[#D93838]">*</span>
              </label>
              <input
                type="text"
                name="bank_account_number"
                value={form.bank_account_number}
                onChange={handleChange}
                placeholder="VD: 1029384756"
                className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-xs font-mono text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#444444] mb-1.5">
                Tên Chủ Tài Khoản <span className="text-[#D93838]">*</span>
              </label>
              <input
                type="text"
                name="bank_account_holder"
                value={form.bank_account_holder}
                onChange={handleChange}
                placeholder="VD: NGUYEN VAN A"
                className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-4 py-2.5 text-xs font-mono uppercase text-[#111111] placeholder-[#BBBBBB] focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={form.is_default}
              onChange={handleChange}
              className="w-4 h-4 accent-[#111111] cursor-pointer"
            />
            <label htmlFor="is_default" className="text-xs text-[#555555] cursor-pointer font-mono">
              Đặt làm tài khoản ngân hàng mặc định nhận tiền
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-6 py-2.5 hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Đang Xử Lý...' : 'Liên Kết Tài Khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
