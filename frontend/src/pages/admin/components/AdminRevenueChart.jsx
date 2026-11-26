import React, { useState, useEffect, useCallback } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { adminServices } from '../../../services'
import { formatPrice } from '../../../utils/formatters'

// Parses API response into normalized { series, summary } structure
const parseAnalyticsResponse = (res) => {
  const payload = res?.data ?? res ?? {}
  let series = []
  let summaryData = null

  if (Array.isArray(payload)) {
    series = payload
  } else if (Array.isArray(payload.series)) {
    series = payload.series
    summaryData = payload.summary
  } else if (Array.isArray(payload.data)) {
    series = payload.data
  }

  if (!summaryData) {
    const totalGmv = series.reduce((sum, item) => sum + (Number(item.gmv) || 0), 0)
    const totalCommission = series.reduce((sum, item) => sum + (Number(item.commission) || 0), 0)
    const totalOrders = series.reduce((sum, item) => sum + (Number(item.orderCount) || 0), 0)
    const aov = totalOrders > 0 ? Math.round(totalGmv / totalOrders) : 0
    summaryData = { totalGmv, totalCommission, totalOrders, aov }
  }

  return { series, summaryData }
}

// Formats date string based on the active grouping granularity
const formatLabel = (dateStr, groupBy) => {
  if (!dateStr) return ''
  if (groupBy === 'year') return `Năm ${dateStr}`
  if (groupBy === 'month') {
    const parts = dateStr.split('-')
    return parts.length === 2 ? `Tháng ${parts[1]}/${parts[0]}` : dateStr
  }
  const parts = dateStr.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
}

// Renders custom dark-themed tooltip for revenue chart
const CustomTooltip = ({ active, payload, label, groupBy }) => {
  if (!active || !payload || !payload.length) return null
  const dataItem = payload[0]?.payload || {}
  return (
    <div className="bg-[#111111] text-white p-3.5 border border-[#333333] shadow-2xl text-xs font-mono min-w-[200px]">
      <p className="font-bold text-[#C5A880] uppercase tracking-wider mb-2 border-b border-[#333333] pb-1.5 flex items-center justify-between">
        <span>{formatLabel(label, groupBy)}</span>
        <span className="text-[10px] text-[#888888] font-normal">{dataItem.orderCount || 0} Đơn Thành Công</span>
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center gap-4">
          <span className="text-[#888888]">Tổng Doanh Thu:</span>
          <span className="font-semibold text-white">
            {formatPrice(dataItem.gmv || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-[#B38F58]">Hoa Hồng Sàn:</span>
          <span className="font-semibold text-[#D4AF37]">
            {formatPrice(dataItem.commission || 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Renders filter toolbar for revenue chart
const RevenueChartFilters = ({
  rangePreset,
  onSelectPreset,
  chartType,
  setChartType,
  groupBy,
  setGroupBy,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApplyCustom,
}) => (
  <>
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#F0F0EE]">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-mono uppercase tracking-[0.15em] text-[#111111] font-bold">
            Phân Tích Doanh Thu & Hiệu Suất Sàn
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F4F4F2] text-[#444444] border border-[#E5E5E3]">
            Dữ Liệu Trực Tiếp
          </span>
        </div>
        <p className="text-[11px] text-[#888888] mt-1">
          Theo dõi dòng tiền giao dịch, khối lượng GMV và thực thu hoa hồng ký quỹ
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center border border-[#E5E5E3] p-0.5 bg-[#FBFBFA]">
          {[
            { id: '7days', label: '7 Ngày' },
            { id: '30days', label: '30 Ngày' },
            { id: 'year', label: '1 Năm' },
            { id: 'custom', label: 'Tùy Chọn' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 transition-colors ${
                rangePreset === p.id
                  ? 'bg-[#111111] text-white font-semibold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center border border-[#E5E5E3] p-0.5 bg-[#FBFBFA]">
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 transition-colors ${
              chartType === 'area' ? 'bg-[#111111] text-white' : 'text-[#888888] hover:text-[#111111]'
            }`}
            title="Biểu đồ Vùng (Area Chart)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 transition-colors ${
              chartType === 'bar' ? 'bg-[#111111] text-white' : 'text-[#888888] hover:text-[#111111]'
            }`}
            title="Biểu đồ Cột (Bar Chart)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div className="py-3.5 border-b border-[#F0F0EE] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[#888888] text-[10px] uppercase">Nhóm theo:</span>
          <div className="inline-flex border border-[#E5E5E3] p-0.5 bg-[#FAFAFA]">
            {[
              { id: 'day', label: 'Ngày' },
              { id: 'month', label: 'Tháng' },
              { id: 'year', label: 'Năm' },
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setGroupBy(g.id)}
                className={`text-[10px] uppercase px-2.5 py-0.5 transition-colors ${
                  groupBy === g.id
                    ? 'bg-[#111111] text-white font-semibold'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#888888] text-[10px] uppercase">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-[11px] bg-[#FAFAFA] border border-[#E5E5E3] px-2 py-1 text-[#333333] focus:border-[#111111] focus:outline-none"
          >
            <option value="all">Tất cả giao dịch hợp lệ</option>
            <option value="paid">Đã thanh toán (Paid)</option>
            <option value="completed">Đã hoàn tất (Completed)</option>
          </select>
        </div>
      </div>

      {rangePreset === 'custom' && (
        <div className="flex items-center gap-2">
          <span className="text-[#888888] text-[10px] uppercase">Từ:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-[11px] bg-[#FAFAFA] border border-[#E5E5E3] px-2 py-0.5 text-[#333333] focus:border-[#111111] focus:outline-none"
          />
          <span className="text-[#888888] text-[10px] uppercase">Đến:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-[11px] bg-[#FAFAFA] border border-[#E5E5E3] px-2 py-0.5 text-[#333333] focus:border-[#111111] focus:outline-none"
          />
          <button
            onClick={onApplyCustom}
            className="text-[10px] uppercase px-3 py-1 bg-[#111111] text-white hover:bg-black transition-colors"
          >
            Lọc
          </button>
        </div>
      )}
    </div>
  </>
)

// Renders 4 summary KPI cards for the selected analytics window
const RevenueChartSummary = ({ summary }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
    <div className="bg-[#FBFBFA] border border-[#EAEAE8] p-3.5">
      <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">GMV Trong Kỳ</p>
      <p className="text-base font-bold font-mono text-[#111111] mt-1">
        {formatPrice(summary.totalGmv)}
      </p>
    </div>
    <div className="bg-[#FBFBFA] border border-[#EAEAE8] p-3.5">
      <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Hoa Hồng Thực Thu</p>
      <p className="text-base font-bold font-mono text-[#B38F58] mt-1">
        {formatPrice(summary.totalCommission)}
      </p>
    </div>
    <div className="bg-[#FBFBFA] border border-[#EAEAE8] p-3.5">
      <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Số Đơn Thành Công</p>
      <p className="text-base font-bold font-mono text-[#111111] mt-1">
        {summary.totalOrders.toLocaleString()} <span className="text-[11px] font-normal text-[#888888]">đơn</span>
      </p>
    </div>
    <div className="bg-[#FBFBFA] border border-[#EAEAE8] p-3.5">
      <p className="text-[10px] font-mono uppercase tracking-wider text-[#888888]">Giá Trị Đơn TB (AOV)</p>
      <p className="text-base font-bold font-mono text-[#111111] mt-1">
        {formatPrice(summary.aov)}
      </p>
    </div>
  </div>
)

// Renders admin revenue analytics chart with multi-dimensional filters
export default function AdminRevenueChart() {
  const [rangePreset, setRangePreset] = useState('7days')
  const [groupBy, setGroupBy] = useState('day')
  const [statusFilter, setStatusFilter] = useState('all')
  const [chartType, setChartType] = useState('area')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [analyticsData, setAnalyticsData] = useState([])
  const [summary, setSummary] = useState({
    totalGmv: 0,
    totalCommission: 0,
    totalOrders: 0,
    aov: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetches revenue analytics data from backend
  const fetchAnalytics = useCallback(async (isCancelled = () => false) => {
    try {
      setLoading(true)
      setError('')

      const params = {
        range: rangePreset,
        groupBy,
        status: statusFilter,
      }
      if (rangePreset === 'custom' && startDate && endDate) {
        params.startDate = startDate
        params.endDate = endDate
      }

      const res = await adminServices.getRevenueAnalytics(params)
      if (isCancelled()) return

      const { series, summaryData } = parseAnalyticsResponse(res)
      setAnalyticsData(series)
      setSummary(summaryData)
    } catch (err) {
      if (!isCancelled()) {
        console.error('Failed to load revenue analytics:', err)
        setError('Không thể tải dữ liệu phân tích doanh thu.')
      }
    } finally {
      if (!isCancelled()) setLoading(false)
    }
  }, [rangePreset, groupBy, statusFilter, startDate, endDate])

  useEffect(() => {
    if (rangePreset === 'custom') return
    let ignore = false
    fetchAnalytics(() => ignore)
    return () => {
      ignore = true
    }
  }, [rangePreset, groupBy, statusFilter, fetchAnalytics])

  // Updates range preset and adjusts default grouping
  const handleSelectPreset = (preset) => {
    setRangePreset(preset)
    setGroupBy(preset === 'year' ? 'month' : 'day')
  }

  return (
    <div className="bg-white border border-[#E5E5E3] p-6 font-sans">
      <RevenueChartFilters
        rangePreset={rangePreset}
        onSelectPreset={handleSelectPreset}
        chartType={chartType}
        setChartType={setChartType}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onApplyCustom={() => {
          if (startDate && endDate) fetchAnalytics()
        }}
      />

      <RevenueChartSummary summary={summary} />

      <div className="h-[300px] w-full relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 text-xs font-mono uppercase tracking-wider text-[#888888] animate-pulse">
            Đang tổng hợp dữ liệu kế toán…
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full text-xs text-[#9A2222] font-mono">
            {error}
          </div>
        )}

        {!loading && !error && analyticsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 text-[#888888]">
            <p className="text-sm font-mono uppercase tracking-wider mb-1">Chưa có giao dịch trong kỳ này</p>
            <p className="text-[11px]">Vui lòng mở rộng khoảng thời gian lọc hoặc chọn trạng thái khác.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#111111" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A880" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C5A880" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0EE" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E3' }}
                  tickFormatter={(val) => formatLabel(val, groupBy)}
                  tick={{ fontSize: 10, fill: '#888888', fontFamily: 'monospace' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E3' }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 10, fill: '#888888', fontFamily: 'monospace' }}
                />
                <Tooltip content={<CustomTooltip groupBy={groupBy} />} />
                <Area
                  type="monotone"
                  dataKey="gmv"
                  name="Tổng Doanh Thu"
                  stroke="#111111"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGmv)"
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  name="Hoa Hồng Sàn"
                  stroke="#B38F58"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComm)"
                />
              </AreaChart>
            ) : (
              <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0EE" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E3' }}
                  tickFormatter={(val) => formatLabel(val, groupBy)}
                  tick={{ fontSize: 10, fill: '#888888', fontFamily: 'monospace' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E3' }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 10, fill: '#888888', fontFamily: 'monospace' }}
                />
                <Tooltip content={<CustomTooltip groupBy={groupBy} />} />
                <Bar dataKey="gmv" name="Tổng Doanh Thu" fill="#111111" radius={[2, 2, 0, 0]} />
                <Bar dataKey="commission" name="Hoa Hồng Sàn" fill="#B38F58" radius={[2, 2, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* 5. Legend Indicators */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F5F5F3] text-[11px] font-mono">
        <span className="text-[#888888] text-[10px]">
          * Đơn vị tính: VNĐ (Triệu = M) · Cập nhật tự động theo sổ cái
        </span>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#111111] inline-block" />
            <span className="text-[#555555]">Tổng GMV Sàn</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#B38F58] inline-block" />
            <span className="text-[#555555]">Hoa Hồng Ký Quỹ</span>
          </div>
        </div>
      </div>
    </div>
  )
}
