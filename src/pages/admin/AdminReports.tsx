import { useState } from 'react'
import { useFinancialReport } from '../../hooks/useReports'

type Period = 'week' | 'month' | 'year'

const COLORS = ['#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2']

function BarChart({ data, labelKey, valueKey, color = '#2563eb' }: { data: any[]; labelKey: string; valueKey: string; color?: string }) {
  if (!data.length) return <p className="text-gray-400 text-sm text-center py-6">Nuk ka të dhëna</p>
  const max = Math.max(...data.map(d => d[valueKey]))
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-24 truncate shrink-0 text-right">{item[labelKey]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
              style={{ width: `${max > 0 ? (item[valueKey] / max) * 100 : 0}%`, background: color, minWidth: item[valueKey] > 0 ? '2rem' : 0 }}>
              <span className="text-xs text-white font-medium">€{item[valueKey].toFixed(0)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data, labelKey, valueKey }: { data: any[]; labelKey: string; valueKey: string }) {
  if (!data.length) return <p className="text-gray-400 text-sm text-center py-6">Nuk ka të dhëna</p>
  const total = data.reduce((s, d) => s + d[valueKey], 0)
  const cx = 70, cy = 70, R = 50
  let angle = -Math.PI / 2
  const slices = data.map((d, i) => {
    const pct = d[valueKey] / total
    const start = angle; angle += pct * 2 * Math.PI; const end = angle
    const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start)
    const x2 = cx + R * Math.cos(end),   y2 = cy + R * Math.sin(end)
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${pct > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`, color: COLORS[i % COLORS.length], label: d[labelKey], pct: Math.round(pct * 100), amount: d[valueKey] }
  })
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 140 140" style={{ width: 120, height: 120, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} stroke="white" strokeWidth="1.5" />)}
        <circle cx={cx} cy={cy} r="26" fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600">€{(total/1000).toFixed(1)}k</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fontSize="8" fill="#9ca3af">total</text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-gray-500 capitalize flex-1">{s.label}</span>
            <span className="font-medium text-gray-700">€{s.amount.toFixed(0)}</span>
            <span className="text-gray-400 text-xs">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function exportCSV(bookings: any[]) {
  const headers = ['Dhoma','Tipi','Check-in','Check-out','Netë','Burimi','Total (€)']
  const rows = bookings.map(b => [(b.rooms as any)?.name ?? '',(b.rooms as any)?.type ?? '',b.check_in,b.check_out,b.nights,b.source,b.total_price])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `raport-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

export default function AdminReports() {
  const [period, setPeriod] = useState<Period>('month')
  const { data, isLoading } = useFinancialReport(period)

  const periods = [{ value: 'week' as Period, label: '7 ditët' }, { value: 'month' as Period, label: 'Ky muaj' }, { value: 'year' as Period, label: 'Ky vit' }]

  const kpiCards = data ? [
    { label: 'Revenue total', value: `€${data.kpi.totalRevenue.toFixed(0)}`, color: 'bg-blue-50 text-blue-700' },
    { label: 'Rezervime',     value: data.kpi.totalBookings,                 color: 'bg-green-50 text-green-700' },
    { label: 'ADR',           value: `€${data.kpi.avgNightlyRate.toFixed(2)}`, color: 'bg-purple-50 text-purple-700' },
    { label: 'Occupancy',     value: `${data.kpi.occupancyRate.toFixed(1)}%`,  color: 'bg-amber-50 text-amber-700' },
    { label: 'RevPAR',        value: `€${data.kpi.revPAR.toFixed(2)}`,        color: 'bg-teal-50 text-teal-700' },
    { label: 'Netë totale',   value: data.kpi.totalNights,                    color: 'bg-orange-50 text-orange-700' },
  ] : []

  const statusStyle: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Raporte Financiare</h1>
        <div className="flex gap-2">
          {periods.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${period === p.value ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Duke ngarkuar...</div>
      ) : (
        <>
          <div className="grid grid-cols-6 gap-3 mb-6">
            {kpiCards.map(c => (
              <div key={c.label} className={`rounded-2xl p-4 ${c.color}`}>
                <p className="text-xs font-medium opacity-70 mb-1">{c.label}</p>
                <p className="text-2xl font-semibold">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-medium text-gray-800 mb-4">Revenue sipas burimit</h2>
              <DonutChart data={data?.sourceChart ?? []} labelKey="source" valueKey="amount" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-medium text-gray-800 mb-4">Metodat e pagesës</h2>
              <BarChart data={data?.methodChart ?? []} labelKey="method" valueKey="amount" color="#7c3aed" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Detaje rezervimesh</h2>
              <button onClick={() => exportCSV(data?.bookings ?? [])}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl transition">↓ CSV</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['Dhoma','Check-in','Netë','Burimi','Total'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-400 text-xs uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.bookings.slice(0, 20).map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{(b.rooms as any)?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{b.check_in}</td>
                    <td className="px-4 py-3 text-gray-500">{b.nights}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded capitalize">{b.source}</span></td>
                    <td className="px-4 py-3 font-semibold text-blue-600">€{b.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
