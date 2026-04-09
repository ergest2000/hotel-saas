import { useState } from 'react'
import { useAvailableRooms, useCreateBooking } from '../hooks/useBooking'
import { usePokPayment } from '../hooks/usePokPayment'

const HOTEL_ID = import.meta.env.VITE_HOTEL_ID

export default function BookingPage() {
  const [checkIn, setCheckIn]       = useState('')
  const [checkOut, setCheckOut]     = useState('')
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [form, setForm]             = useState({ name: '', email: '', phone: '' })
  const [done, setDone]             = useState(false)

  const { data: rooms, isLoading } = useAvailableRooms(HOTEL_ID, checkIn, checkOut)
  const createBooking = useCreateBooking()
  const pokPayment    = usePokPayment()

  const nights = checkIn && checkOut
    ? Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0

  const handleConfirm = async () => {
    if (!selectedRoom) return
    const booking = await createBooking.mutateAsync({
      hotel_id: HOTEL_ID,
      room_id:  selectedRoom.id,
      guest_name: form.name,
      guest_email: form.email,
      guest_phone: form.phone,
      check_in:  checkIn,
      check_out: checkOut,
      total_price: selectedRoom.price_per_night * nights,
      source: 'direct',
    })
    await pokPayment.mutateAsync({
      bookingId: booking.id,
      amount: booking.total_price,
      description: `Rezervim: ${selectedRoom.name} · ${checkIn} – ${checkOut}`,
      customerEmail: form.email,
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Rezervo dhomën tuaj</h1>

      {/* Dates */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Check-in</label>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Check-out</label>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
          </div>
        </div>
      </div>

      {/* Rooms */}
      {checkIn && checkOut && (
        <div className="space-y-3 mb-6">
          <h2 className="font-medium text-gray-800">
            {isLoading ? 'Duke kërkuar...' : `${rooms?.length ?? 0} dhoma të disponueshme`}
          </h2>
          {rooms?.map(room => (
            <div key={room.id} onClick={() => setSelectedRoom(room)}
              className={`border rounded-2xl p-5 cursor-pointer transition-all ${
                selectedRoom?.id === room.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-100 hover:border-gray-300 bg-white'
              }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{room.name}</h3>
                  <p className="text-gray-400 text-sm mt-0.5 capitalize">{room.type} · {room.capacity} persona</p>
                  <p className="text-gray-500 text-sm mt-1">{room.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-2xl font-semibold text-blue-600">€{room.price_per_night}</p>
                  <p className="text-xs text-gray-400">/ natë</p>
                  {nights > 0 && <p className="text-sm font-medium mt-1 text-gray-700">Total: €{(room.price_per_night * nights).toFixed(2)}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guest form */}
      {selectedRoom && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-medium text-gray-800 mb-4">Të dhënat tuaja</h2>
          <div className="space-y-3">
            <input placeholder="Emri i plotë" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
            <input placeholder="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
          </div>
          <button onClick={handleConfirm}
            disabled={!form.name || !form.email || createBooking.isPending || pokPayment.isPending}
            className="mt-5 w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition">
            {pokPayment.isPending ? 'Duke hapur pagesën...'
              : createBooking.isPending ? 'Duke krijuar rezervimin...'
              : `Paguaj me POK · €${(selectedRoom.price_per_night * nights).toFixed(2)}`}
          </button>
        </div>
      )}

      {done && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center mt-6">
          <p className="text-xl font-semibold text-green-700 mb-1">✓ Rezervimi u krye!</p>
          <p className="text-green-600 text-sm">Do të merrni konfirmim në email.</p>
        </div>
      )}
    </div>
  )
}
