import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export function useFinancialReport(period: 'week' | 'month' | 'year') {
  const { profile } = useAuthStore()
  const hotelId = profile?.hotel_id

  return useQuery({
    queryKey: ['financial-report', hotelId, period],
    enabled: !!hotelId,
    queryFn: async () => {
      const now = new Date()
      let startDate: string

      if (period === 'week') {
        const d = new Date(now); d.setDate(d.getDate() - 7)
        startDate = d.toISOString().split('T')[0]
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      } else {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      }

      const [bookingsRes, paymentsRes, roomsRes] = await Promise.all([
        supabase.from('bookings').select('id, status, total_price, check_in, check_out, nights, source, created_at, rooms(name, type)')
          .eq('hotel_id', hotelId!).gte('created_at', startDate).order('created_at', { ascending: true }),
        supabase.from('payments').select('amount, method, status, paid_at')
          .eq('hotel_id', hotelId!).eq('status', 'completed').gte('paid_at', startDate),
        supabase.from('rooms').select('id, name, type, price_per_night')
          .eq('hotel_id', hotelId!).eq('is_active', true),
      ])

      const bookings = bookingsRes.data ?? []
      const payments = paymentsRes.data ?? []
      const rooms    = roomsRes.data ?? []
      const confirmed = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed')

      const totalRevenue   = payments.reduce((s, p) => s + p.amount, 0)
      const totalBookings  = confirmed.length
      const totalNights    = confirmed.reduce((s, b) => s + (b.nights ?? 0), 0)
      const avgNightlyRate = totalNights > 0 ? totalRevenue / totalNights : 0
      const occupancyRate  = rooms.length > 0 ? Math.min(100, (totalNights / (rooms.length * 30)) * 100) : 0
      const revPAR         = (occupancyRate / 100) * avgNightlyRate

      const revenueByDay: Record<string, number> = {}
      payments.forEach((p) => {
        const day = (p.paid_at ?? '').slice(0, 10)
        if (day) revenueByDay[day] = (revenueByDay[day] ?? 0) + p.amount
      })
      const revenueChart = Object.entries(revenueByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date, amount }))

      const bySource: Record<string, number> = {}
      confirmed.forEach((b) => { bySource[b.source ?? 'direct'] = (bySource[b.source ?? 'direct'] ?? 0) + b.total_price })
      const sourceChart = Object.entries(bySource).map(([source, amount]) => ({ source, amount }))

      const byRoomType: Record<string, number> = {}
      confirmed.forEach((b) => {
        const type = (b.rooms as any)?.type ?? 'unknown'
        byRoomType[type] = (byRoomType[type] ?? 0) + b.total_price
      })
      const roomTypeChart = Object.entries(byRoomType).map(([type, amount]) => ({ type, amount }))

      const byMethod: Record<string, number> = {}
      payments.forEach((p) => { byMethod[p.method] = (byMethod[p.method] ?? 0) + p.amount })
      const methodChart = Object.entries(byMethod).map(([method, amount]) => ({ method, amount }))

      return {
        kpi: { totalRevenue, totalBookings, avgNightlyRate, occupancyRate, revPAR, totalNights },
        revenueChart, sourceChart, roomTypeChart, methodChart, bookings: confirmed,
      }
    },
  })
}
