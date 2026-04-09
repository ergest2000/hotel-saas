import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export default function BookingSuccess() {
  const [params] = useSearchParams()
  const bookingId = params.get('id')

  const { data: booking } = useQuery({
    queryKey: ['booking-confirm', bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings').select('*, rooms(name)').eq('id', bookingId!).single()
      return data
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Pagesa u krye!</h1>
        <p className="text-gray-500 mb-6 text-sm">Rezervimi juaj është konfirmuar.</p>
        {booking && (
          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-2 text-sm mb-6">
            <div className="flex justify-between"><span className="text-gray-400">Dhoma</span><span className="font-medium">{(booking.rooms as any)?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Check-in</span><span className="font-medium">{booking.check_in}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Check-out</span><span className="font-medium">{booking.check_out}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-500 font-medium">Total paguar</span>
              <span className="font-semibold text-green-600">€{booking.total_price}</span>
            </div>
          </div>
        )}
        <Link to="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">← Kthehu në faqe kryesore</Link>
      </div>
    </div>
  )
}
