import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

function normalize(channel: string, body: any) {
  if (channel === 'logdify') return {
    externalBookingId: body.bookingId, externalRoomId: body.roomId,
    guestName: body.guestFullName, guestEmail: body.guestEmail ?? '',
    guestPhone: body.guestPhone ?? '', checkIn: body.arrivalDate, checkOut: body.departureDate,
    totalPrice: body.totalAmount, channel: 'logdify',
    status: body.status === 'cancelled' ? 'cancelled' : 'confirmed',
  }
  if (channel === 'myallocator') return {
    externalBookingId: body.booking_id, externalRoomId: body.room_id,
    guestName: `${body.first_name} ${body.last_name}`, guestEmail: body.email ?? '',
    guestPhone: body.phone ?? '', checkIn: body.start_date, checkOut: body.end_date,
    totalPrice: parseFloat(body.total_price), channel: 'myallocator',
    status: body.BookingStatus === 'cancelled' ? 'cancelled' : 'confirmed',
  }
  return {
    externalBookingId: body.reservation_id ?? body.id, externalRoomId: body.room_id ?? body.roomId,
    guestName: body.guest_name ?? body.guestName ?? 'Unknown', guestEmail: body.guest_email ?? body.guestEmail ?? '',
    guestPhone: body.guest_phone ?? body.guestPhone ?? '', checkIn: body.check_in ?? body.checkIn,
    checkOut: body.check_out ?? body.checkOut, totalPrice: parseFloat(body.total_price ?? body.totalPrice ?? 0),
    channel, status: (body.status === 'cancelled' || body.BookingStatus === 'cancelled') ? 'cancelled' : 'confirmed',
  }
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Not allowed', { status: 405 })
  try {
    const url     = new URL(req.url)
    const channel = url.searchParams.get('channel') ?? 'unknown'
    const body    = await req.json()
    const norm    = normalize(channel, body)

    const { data: mapping } = await supabase.from('channel_mappings')
      .select('room_id, hotel_id').eq('external_room_id', norm.externalRoomId).eq('channel', channel).single()

    if (!mapping) return new Response(JSON.stringify({ warning: 'No room mapping found' }), { headers: { 'Content-Type': 'application/json' } })

    const { data: existing } = await supabase.from('bookings').select('id, status')
      .eq('hotel_id', mapping.hotel_id).eq('notes', `ota:${norm.externalBookingId}`).maybeSingle()

    if (norm.status === 'cancelled' && existing) {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', existing.id)
      await supabase.functions.invoke('sync-availability', { body: { bookingId: existing.id, action: 'unblock' } })
      return new Response(JSON.stringify({ action: 'cancelled', bookingId: existing.id }), { headers: { 'Content-Type': 'application/json' } })
    }

    if (existing) return new Response(JSON.stringify({ action: 'skipped' }), { headers: { 'Content-Type': 'application/json' } })

    const { data: newBooking, error } = await supabase.from('bookings').insert({
      hotel_id: mapping.hotel_id, room_id: mapping.room_id,
      guest_name: norm.guestName, guest_email: norm.guestEmail, guest_phone: norm.guestPhone,
      check_in: norm.checkIn, check_out: norm.checkOut,
      total_price: norm.totalPrice, status: 'confirmed', source: channel,
      notes: `ota:${norm.externalBookingId}`,
    }).select().single()

    if (error) throw error

    await supabase.functions.invoke('sync-availability', { body: { bookingId: newBooking.id, action: 'block' } })

    const { data: hotel } = await supabase.from('hotels').select('admin_email, name').eq('id', mapping.hotel_id).single()
    if (hotel?.admin_email) {
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'booking.new',
          data: {
            guestName: norm.guestName, guestEmail: norm.guestEmail, guestPhone: norm.guestPhone,
            roomName: '', checkIn: norm.checkIn, checkOut: norm.checkOut,
            nights: Math.round((new Date(norm.checkOut).getTime() - new Date(norm.checkIn).getTime()) / 86400000),
            totalPrice: norm.totalPrice, bookingId: newBooking.id,
            adminEmail: hotel.admin_email, source: channel,
          },
        },
      })
    }

    return new Response(JSON.stringify({ action: 'created', bookingId: newBooking.id }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
