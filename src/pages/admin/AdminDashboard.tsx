import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

export default function AdminDashboard() {
  const { profile } = useAuthStore()
  const hotelId = profile?.hotel_id

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', hotelId],
    enabled: !!hotelId,
    queryFn: async () => {
      const [bookings, rooms, revenue, pending] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId).eq('status', 'confirmed'),
        supabase.from('rooms').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId).eq('is_active', true),
        supabase.from('payments').select('amount').eq('hotel_id', hotelId).eq('status', 'completed'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId).eq('status', 'pending'),
      ])
      return {
        confirmedBookings: bookings.count ?? 0,
        totalRooms: rooms.count ?? 0,
        totalRevenue: revenue.data?.reduce((s, p) => s + p.amount, 0) ?? 0,
        pendingBookings: pending.count ?? 0,
      }
    },
  })

  const { data: recentBookings } = useQuery({
    queryKey: ['recent-bookings', hotelId],
    enabled: !!hotelId,
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings').select('*, rooms(name)')
        .eq('hotel_id', hotelId).order('created_at', { ascending: false }).limit(8)
      return data
    },
  })

  const cards = stats ? [
    { label: 'Rezervime aktive', value: stats.confirmedBookings, color: 'bg-blue-50 text-blue-700' },
    { label: 'Dhoma totale',     value: stats.totalRooms,        color: 'bg-green-50 text-green-700' },
    { label: 'Revenue total',    value: `€${stats.totalRevenue.toFixed(0)}`, color: 'bg-purple-50 text-purple-700' },
    { label: 'Në pritje',        value: stats.pendingBookings,   color: 'bg-amber-50 text-amber-700' },
  ] : []

  const statusStyle: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending:   'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
            <p className="text-sm font-medium opacity-70 mb-1">{c.label}</p>
            <p className="text-3xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800">Rezervimet e fundit</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Mysafiri','Dhoma','Check-in','Check-out','Total','Statusi'].map(h => (
                <th key={h} className="text-left px-5 py-3 font-medium text-gray-400 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentBookings?.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{b.guest_name}</td>
                <td className="px-5 py-3 text-gray-500">{(b.rooms as any)?.name}</td>
                <td className="px-5 py-3 text-gray-500">{b.check_in}</td>
                <td className="px-5 py-3 text-gray-500">{b.check_out}</td>
                <td className="px-5 py-3 font-medium text-gray-800">€{b.total_price}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
