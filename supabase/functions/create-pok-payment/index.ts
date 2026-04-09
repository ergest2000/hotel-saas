import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const POK_API        = Deno.env.get('POK_ENV') === 'production' ? 'https://api.pokpay.io' : 'https://api-staging.pokpay.io'
const POK_KEY_ID     = Deno.env.get('POK_KEY_ID')!
const POK_KEY_SECRET = Deno.env.get('POK_KEY_SECRET')!

async function getPokToken() {
  const res = await fetch(`${POK_API}/auth/sdk/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyId: POK_KEY_ID, keySecret: POK_KEY_SECRET }),
  })
  if (!res.ok) throw new Error(`POK auth failed: ${res.status}`)
  return (await res.json()).token
}

async function createCheckoutSession(token: string, payload: any) {
  const res = await fetch(`${POK_API}/checkout/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      amount: Math.round(payload.amount * 100),
      currency: payload.currency,
      reference: payload.orderId,
      description: payload.description,
      returnUrl: payload.successUrl,
      cancelUrl: payload.cancelUrl,
      customer: payload.customerEmail ? { email: payload.customerEmail } : undefined,
    }),
  })
  if (!res.ok) throw new Error(`POK session failed: ${await res.text()}`)
  return res.json()
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Not allowed', { status: 405 })
  try {
    const { bookingId, amount, currency = 'ALL', description, customerEmail } = await req.json()
    if (!bookingId || !amount) return new Response(JSON.stringify({ error: 'bookingId dhe amount kërkohen' }), { status: 400 })

    const token   = await getPokToken()
    const session = await createCheckoutSession(token, {
      amount, currency, orderId: bookingId, description: description ?? `Rezervim #${bookingId}`,
      successUrl: `${Deno.env.get('APP_URL')}/booking/success?id=${bookingId}`,
      cancelUrl:  `${Deno.env.get('APP_URL')}/booking/cancel?id=${bookingId}`,
      customerEmail,
    })
    return new Response(JSON.stringify({ checkoutUrl: session.checkoutUrl ?? session.url, sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
