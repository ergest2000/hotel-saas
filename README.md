# HotelOS — Platforma SaaS për Hotele

## Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions, Storage)
- **Pagesa**: POK Pay (Edge Function)
- **Email**: SendGrid (Edge Function)
- **Deploy**: Vercel

---

## Setup i shpejtë

### 1. Instalo dependencies
```bash
npm install
```

### 2. Konfiguro `.env`
```bash
cp .env.example .env
# Plotëso me kredencialet e Supabase
```

### 3. Krijo databazën
Shko te **Supabase → SQL Editor** dhe ekzekuto `supabase/schema.sql`

### 4. Aktivizo Google OAuth
Supabase → Authentication → Providers → Google

### 5. Deplojo Edge Functions
```bash
supabase functions deploy create-pok-payment
supabase functions deploy pok-webhook
supabase functions deploy send-email
supabase functions deploy sync-availability
supabase functions deploy ota-webhook

supabase secrets set POK_KEY_ID=xxx
supabase secrets set POK_KEY_SECRET=xxx
supabase secrets set POK_ENV=staging
supabase secrets set SENDGRID_API_KEY=SG.xxx
supabase secrets set SENDGRID_FROM_EMAIL=noreply@hotel.al
supabase secrets set SENDGRID_FROM_NAME="HotelOS"
supabase secrets set CHANNEL_MANAGER_API_URL=https://api.logdify.com/v1
supabase secrets set CHANNEL_MANAGER_API_KEY=xxx
supabase secrets set APP_URL=https://hotel-saas.vercel.app
```

### 6. Starto lokalisht
```bash
npm run dev
```

---

## Struktura

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── auth.ts              # signIn, signUp, Google OAuth, reset password
├── stores/
│   └── authStore.ts         # Zustand store + initAuth()
├── hooks/
│   ├── useBooking.ts        # Disponueshmëri, create/update booking
│   ├── usePokPayment.ts     # POK Pay checkout
│   ├── useReports.ts        # KPI financiare
│   └── useEmail.ts          # Dërgim emailesh
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx
├── pages/
│   ├── LandingPage.tsx      # / — Landing page bilingual
│   ├── BookingPage.tsx      # /booking — Rezervim + POK Pay
│   ├── auth/
│   │   ├── LoginPage.tsx        # /login — Email, Google, Forgot
│   │   ├── AuthCallback.tsx     # /auth/callback — OAuth redirect
│   │   └── ResetPasswordPage.tsx
│   ├── booking/
│   │   ├── BookingSuccess.tsx
│   │   └── BookingCancel.tsx
│   └── admin/
│       ├── AdminLayout.tsx
│       ├── AdminDashboard.tsx
│       ├── AdminBookings.tsx
│       ├── AdminRooms.tsx
│       ├── AdminStaff.tsx
│       ├── AdminInventory.tsx
│       ├── AdminReports.tsx
│       └── AdminChannels.tsx
└── App.tsx

supabase/
├── schema.sql               # Të gjitha tabelat + RLS + trigger
└── functions/
    ├── create-pok-payment/  # Checkout session me POK
    ├── pok-webhook/         # Konfirmim pagese
    ├── send-email/          # SendGrid emails
    ├── sync-availability/   # Sinkronizim OTA
    └── ota-webhook/         # Rezervime nga OTA
```

---

## Roles

| Role        | Akses                          |
|-------------|-------------------------------|
| guest       | /booking                      |
| receptionist| /admin, /admin/bookings       |
| staff       | /admin, /admin/inventory      |
| hr          | /admin, /admin/staff          |
| admin       | Gjithçka                      |
| superadmin  | Gjithçka                      |

---

## Flux logimi

```
/ (Landing)
  → "Hyr" → /login

/login
  ├── Email + fjalëkalim → Supabase Auth
  ├── Google OAuth       → /auth/callback
  └── Forgot password    → /auth/reset-password

/auth/callback
  → role = guest   → /booking
  → role = admin/* → /admin
```

---

## Deploy në Vercel

1. Shto repo në Vercel
2. Shto environment variables nga `.env.example`
3. Deploy automatik nga `main` branch
