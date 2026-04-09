import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')!
const FROM_EMAIL       = Deno.env.get('SENDGRID_FROM_EMAIL')!
const FROM_NAME        = Deno.env.get('SENDGRID_FROM_NAME') ?? 'HotelOS'
const APP_URL          = Deno.env.get('APP_URL')!

function base(title: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;"><tr><td style="background:#1d4ed8;padding:28px 40px;"><h1 style="margin:0;color:#fff;font-size:20px;">${FROM_NAME}</h1></td></tr><tr><td style="padding:32px 40px;font-size:15px;color:#374151;line-height:1.7;">${body}</td></tr><tr><td style="padding:16px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;text-align:center;">© ${new Date().getFullYear()} ${FROM_NAME}</td></tr></table></td></tr></table></body></html>`
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 0;color:#6b7280;font-size:14px;width:140px;">${label}</td><td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${value}</td></tr>`
}

function bookingConfirm(d: any) {
  return { subject: `✓ Rezervimi u konfirmua — ${d.hotelName}`, html: base('Konfirmim', `<p>Përshëndetje <strong>${d.guestName}</strong>,</p><p style="margin:16px 0;">Rezervimi juaj u konfirmua!</p><table width="100%" style="background:#f0f9ff;border-radius:8px;padding:20px 24px;margin-bottom:24px;">${row('Hoteli',d.hotelName)}${row('Dhoma',d.roomName)}${row('Check-in',d.checkIn)}${row('Check-out',d.checkOut)}${row('Netë',String(d.nights))}${row('Total',`€${d.totalPrice.toFixed(2)}`)}${row('Nr. rezervimit',`#${d.bookingId.slice(0,8).toUpperCase()}`)}</table>`) }
}

function bookingNew(d: any) {
  return { subject: `🔔 Rezervim i ri — ${d.guestName}`, html: base('Rezervim i Ri', `<p>Rezervim i ri nga <strong>${d.source}</strong>.</p><table width="100%" style="background:#fefce8;border-radius:8px;padding:20px 24px;margin-bottom:24px;">${row('Mysafiri',d.guestName)}${row('Email',d.guestEmail)}${row('Dhoma',d.roomName)}${row('Check-in',d.checkIn)}${row('Check-out',d.checkOut)}${row('Total',`€${d.totalPrice.toFixed(2)}`)}</table><a href="${APP_URL}/admin/bookings" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Shiko dashboard →</a>`) }
}

function bookingCancelled(d: any) {
  return { subject: `Rezervimi u anulua — ${d.hotelName}`, html: base('Anulim', `<p>Përshëndetje <strong>${d.guestName}</strong>, rezervimi juaj u anulua.</p><table width="100%" style="background:#fef2f2;border-radius:8px;padding:20px 24px;">${row('Check-in',d.checkIn)}${row('Check-out',d.checkOut)}${row('Nr.',`#${d.bookingId.slice(0,8).toUpperCase()}`)}</table>`) }
}

function lowStock(d: any) {
  const rows = d.items.map((i: any) => `<tr><td style="padding:8px 0;">${i.name}</td><td style="color:#dc2626;font-weight:700;">${i.quantity} ${i.unit}</td><td style="color:#6b7280;">min. ${i.minQuantity}</td></tr>`).join('')
  return { subject: `⚠ Stok i ulët — ${d.items.length} artikuj`, html: base('Alarm Stok', `<p>Artikujt e mëposhtëm kanë stok të ulët:</p><table width="100%" style="margin-bottom:24px;"><tbody>${rows}</tbody></table><a href="${APP_URL}/admin/inventory" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Shiko inventory →</a>`) }
}

function shiftAssigned(d: any) {
  return { subject: `📅 Shift i ri — ${d.shiftDate}`, html: base('Shift i Ri', `<p>Përshëndetje <strong>${d.staffName}</strong>, ju është caktuar shift i ri:</p><table width="100%" style="background:#f0fdf4;border-radius:8px;padding:20px 24px;">${row('Data',d.shiftDate)}${row('Ora',`${d.startTime} – ${d.endTime}`)}${d.department ? row('Departamenti',d.department) : ''}</table>`) }
}

async function send(to: string | string[], subject: string, html: string) {
  const toArr = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }]
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ personalizations: [{ to: toArr }], from: { email: FROM_EMAIL, name: FROM_NAME }, subject, content: [{ type: 'text/html', value: html }] }),
  })
  if (!res.ok) throw new Error(`SendGrid: ${await res.text()}`)
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Not allowed', { status: 405 })
  try {
    const { type, data } = await req.json()
    if (type === 'booking.confirmed') {
      const { subject, html } = bookingConfirm(data)
      await Promise.all([send(data.guestEmail, subject, html), send(data.adminEmail, ...Object.values(bookingNew(data)) as [string,string])])
    } else if (type === 'booking.new') {
      const { subject, html } = bookingNew(data); await send(data.adminEmail, subject, html)
    } else if (type === 'booking.cancelled') {
      const { subject, html } = bookingCancelled(data); await send(data.guestEmail, subject, html)
    } else if (type === 'inventory.low_stock') {
      const { subject, html } = lowStock(data); await send(data.adminEmail, subject, html)
    } else if (type === 'staff.shift_assigned') {
      const { subject, html } = shiftAssigned(data); await send(data.staffEmail, subject, html)
    }
    return new Response(JSON.stringify({ sent: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
