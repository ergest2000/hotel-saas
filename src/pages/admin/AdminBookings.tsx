import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'
import { useUpdateBookingStatus } from '../../hooks/useBooking'
import { supabase } from '../../lib/supabase'

export default function AdminBookings() {
  const { profile } = useAuthStore()
  const [filter, setFilter] = useState('all')
  const updateStatus = useUpdateBookingStatus()

  const { data: bookings, refetch } = useQuery({
    queryKey: ['admin-bookings', profile?.hotel_id, filter],
    enabled: !!profile?.hotel_id,
    queryFn: async () => {
      let q = supabase.from('bookings').select('*, rooms(name, type)')
        .eq('hotel_id', profile!.hotel_id).order('created_at', { ascending: false })
      if (filter !== 'all') q = q.eq('status', filter)
      const { data, error } = await q
      if (error) throw error
      return data
    },
  })

  const handleStatus = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status })
    refetch()
  }

  const filters = ['all', 'pending', 'confirmed', 'cancelled', 'completed']
  const statusStyle: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending:   'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Rezervimet</h1>
      <div className="flex gap-2 mb-5">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}>
            {f === 'all' ? 'Të gjitha' : f}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Mysafiri','Dhoma','Periudha','Netë','Total','Burimi','Statusi','Veprime'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-400 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings?.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{b.guest_name}</p>
                  <p className="text-gray-400 text-xs">{b.guest_email}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{(b.rooms as any)?.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{b.check_in} → {b.check_out}</td>
                <td className="px-4 py-3 text-gray-500">{b.nights}</td>
                <td className="px-4 py-3 font-medium text-gray-800">€{b.total_price}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded capitalize">{b.source}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {b.status === 'pending' && <>
                      <button onClick={() => handleStatus(b.id, 'confirmed')} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg hover:bg-green-100">Konfirmo</button>
                      <button onClick={() => handleStatus(b.id, 'cancelled')} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100">Anulo</button>
                    </>}
                    {b.status === 'confirmed' && (
                      <button onClick={() => handleStatus(b.id, 'completed')} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-100">Kompletuar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings?.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Nuk ka rezervime.</div>}
      </div>
    </div>
  )
}
