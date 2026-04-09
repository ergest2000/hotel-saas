import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase   = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const CM_API_URL = Deno.env.get('CHANNEL_MANAGER_API_URL')!
const CM_API_KEY = Deno.env.get('CHANNEL_MANAGER_API_KEY')!

function getDates(checkIn: string, checkOut: string) {
  const dates: string[] = []
  const cur = new Date(checkIn), end = new Date(checkOut)
  while (cur < end) { dates.push(cur.toISOString().split('T')[0]); cur.setDate(cur.getDate() + 1) }
  return dates
}

async function updateAvailability(payload: any) {
  const res = await fetch(`${CM_API_URL}/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CM_API_KEY}` },
    body: JSON.stringify({
      roomId: payload.externalRoomId, channel: payload.channel,
      dates: payload.dates.map((date: string) => ({ date, available: payload.available ? 1 : 0, ...(payload.price ? { price: payload.price } : {}) })),
    }),
  })
  if (!res.ok) throw new Error(`CM error [${payload.channel}]: ${await res.text()}`)
  return res.json()
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Not allowed', { status: 405 })
  try {
    const { bookingId, action } = await req.json()
    const { data: booking } = await supabase.from('bookings').select('*, rooms(price_per_night)').eq('id', bookingId).single()
    if (!booking) throw new Error('Booking nuk u gjet')

    const { data: mappings } = await supabase.from('channel_mappings').select('*').eq('room_id', booking.room_id)
    if (!mappings?.length) return new Response(JSON.stringify({ skipped: true }), { headers: { 'Content-Type': 'application/json' } })

    const dates     = getDates(booking.check_in, booking.check_out)
    const available = action === 'unblock'
    const results: any[] = []

    for (const mapping of mappings) {
      try {
        const result = await updateAvailability({
          roomId: booking.room_id, externalRoomId: mapping.external_room_id,
          channel: mapping.channel, dates, available,
          price: (booking.rooms as any)?.price_per_night,
        })
        results.push({ channel: mapping.channel, success: true, result })
        await supabase.from('channel_mappings').update({ last_synced_at: new Date().toISOString() }).eq('id', mapping.id)
      } catch (err: any) {
        results.push({ channel: mapping.channel, success: false, error: err.message })
      }
    }

    return new Response(JSON.stringify({ synced: results }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
