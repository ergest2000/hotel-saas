import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Not allowed', { status: 405 })
  try {
    const event = await req.json()
    if (event.type === 'payment.completed') {
      const bookingId = event.data?.reference ?? event.data?.orderId
      if (bookingId) {
        const { data: booking } = await supabase.from('bookings')
          .select('*, rooms(name), hotels(name, phone, admin_email)').eq('id', bookingId).single()

        await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId)
        await supabase.from('payments').insert({
          booking_id: bookingId, amount: (event.data.amount ?? 0) / 100,
          method: 'pok', status: 'completed',
          stripe_payment_id: event.data.sessionId ?? event.data.id,
          paid_at: new Date().toISOString(),
        })

        if (booking) {
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'booking.confirmed',
              data: {
                guestName: booking.guest_name, guestEmail: booking.guest_email,
                roomName: (booking.rooms as any)?.name, checkIn: booking.check_in,
                checkOut: booking.check_out, nights: booking.nights,
                totalPrice: booking.total_price, bookingId: booking.id,
                hotelName: (booking.hotels as any)?.name,
                hotelPhone: (booking.hotels as any)?.phone,
                adminEmail: (booking.hotels as any)?.admin_email,
                source: booking.source,
              },
            },
          })

          await supabase.functions.invoke('sync-availability', {
            body: { bookingId, action: 'block' },
          })
        }
      }
    }

    if (event.type === 'payment.failed') {
      const bookingId = event.data?.reference ?? event.data?.orderId
      if (bookingId) await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
    }

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
