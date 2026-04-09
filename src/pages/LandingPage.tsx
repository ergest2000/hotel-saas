import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const services = [
  { icon: '🏠', sq: 'Dhoma moderne',       en: 'Modern rooms',       dSq: 'Wi-Fi të shpejtë, minibar dhe pamje të bukur.',           dEn: 'Fast Wi-Fi, minibar and beautiful views.' },
  { icon: '🕐', sq: 'Recepsion 24/7',      en: '24/7 Reception',     dSq: 'Staf profesionist gjatë gjithë ditës.',                   dEn: 'Professional staff around the clock.' },
  { icon: '🍽', sq: 'Restorant & Bar',     en: 'Restaurant & Bar',   dSq: 'Kuzhinë shqiptare dhe ndërkombëtare.',                   dEn: 'Albanian and international cuisine.' },
  { icon: '💆', sq: 'SPA & Wellness',      en: 'SPA & Wellness',     dSq: 'Trajtime premium masazhi dhe kujdesi.',                  dEn: 'Premium massage and care treatments.' },
  { icon: '🎤', sq: 'Konferenca',          en: 'Conferences',        dSq: 'Ambiente për takime biznesi deri 80 persona.',           dEn: 'Meeting spaces for up to 80 people.' },
  { icon: '🚗', sq: 'Transfer & Parking',  en: 'Transfer & Parking', dSq: 'Transfertë nga aeroporti dhe parking 24 orë.',           dEn: 'Airport transfer and 24h parking.' },
]

const rooms = [
  { sq: 'Dhomë Single', en: 'Single Room', dSq: 'E qetë, ideale për udhëtarët e biznesit.', dEn: 'Quiet, ideal for business travelers.', price: 65 },
  { sq: 'Dhomë Double', en: 'Double Room', dSq: 'Spacioze me pamje të bukur.',               dEn: 'Spacious with beautiful views.',        price: 95,  featured: true },
  { sq: 'Suite',        en: 'Suite',       dSq: 'Luksi maksimal me Jacuzzi.',                dEn: 'Maximum luxury with Jacuzzi.',          price: 180 },
]

export default function LandingPage() {
  const [lang, setLang] = useState<'sq'|'en'>('sq')
  const navigate = useNavigate()
  const L = lang

  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">Hotel<span className="text-blue-600">OS</span></span>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <button onClick={() => scroll('services')} className="hover:text-gray-900">{L === 'sq' ? 'Shërbime' : 'Services'}</button>
            <button onClick={() => scroll('rooms')} className="hover:text-gray-900">{L === 'sq' ? 'Dhomat' : 'Rooms'}</button>
            <button onClick={() => scroll('login-section')} className="hover:text-gray-900">{L === 'sq' ? 'Kontakt' : 'Contact'}</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'sq' ? 'en' : 'sq')}
              className="text-xs px-3 py-1 border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50">
              {lang === 'sq' ? 'EN' : 'SQ'}
            </button>
            <Link to="/login" className="text-sm px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition">
              {L === 'sq' ? 'Hyr' : 'Sign in'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          {L === 'sq' ? 'Platforma #1 SaaS për hotele' : '#1 SaaS Platform for Hotels'}
        </div>
        <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-5 max-w-2xl mx-auto" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          {L === 'sq' ? <>Menaxho hotelin <em className="text-blue-600 not-italic">inteligjentë</em></> : <>Manage your hotel <em className="text-blue-600 not-italic">smarter</em></>}
        </h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          {L === 'sq'
            ? 'Nga rezervimet online deri te pagesa dhe stafi — gjithçka nën një dashboard.'
            : 'From online bookings to payments and staff — everything under one dashboard.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="px-7 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-100 transition">
            {L === 'sq' ? 'Regjistrohu Falas' : 'Start Free'}
          </Link>
          <button onClick={() => scroll('services')} className="px-7 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition">
            {L === 'sq' ? 'Shiko Demo →' : 'View Demo →'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">{L === 'sq' ? '✓ 14 ditë falas · ✓ Pa kartë krediti' : '✓ 14 days free · ✓ No credit card'}</p>
      </section>

      {/* Services */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100">
        <p className="text-xs font-medium tracking-widest uppercase text-blue-600 mb-3">{L === 'sq' ? 'Shërbime' : 'Services'}</p>
        <h2 className="text-3xl font-semibold tracking-tight mb-10" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          {L === 'sq' ? 'Gjithçka nën një çati' : 'Everything under one roof'}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {services.map((s, i) => (
            <div key={i} className="p-6 border border-gray-100 rounded-2xl hover:border-blue-100 hover:bg-blue-50/30 transition cursor-default">
              <span className="text-2xl block mb-3">{s.icon}</span>
              <h3 className="font-medium mb-1.5">{L === 'sq' ? s.sq : s.en}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{L === 'sq' ? s.dSq : s.dEn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rooms */}
      <section id="rooms" className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100">
        <p className="text-xs font-medium tracking-widest uppercase text-blue-600 mb-3">{L === 'sq' ? 'Dhomat' : 'Rooms'}</p>
        <h2 className="text-3xl font-semibold tracking-tight mb-10" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          {L === 'sq' ? 'Zgjidhni komfortin tuaj' : 'Choose your comfort'}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {rooms.map((r, i) => (
            <div key={i} className={`border rounded-2xl overflow-hidden ${r.featured ? 'border-blue-400' : 'border-gray-100'}`}>
              <div className={`h-36 flex items-center justify-center ${r.featured ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className={`w-16 h-16 rounded-2xl ${r.featured ? 'bg-blue-100' : 'bg-gray-100'}`} />
              </div>
              <div className="p-5">
                <h3 className="font-medium mb-1.5">{L === 'sq' ? r.sq : r.en}</h3>
                <p className="text-sm text-gray-400 mb-4">{L === 'sq' ? r.dSq : r.dEn}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold">€{r.price} <span className="text-xs font-normal text-gray-400">{L === 'sq' ? '/ natë' : '/ night'}</span></span>
                  <button onClick={() => navigate('/booking')}
                    className={`text-sm px-4 py-1.5 rounded-xl border transition ${r.featured ? 'border-blue-400 text-blue-700 hover:bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {L === 'sq' ? 'Rezervo' : 'Book'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="grid grid-cols-4 gap-4">
          {[
            { num: '120+', label: L === 'sq' ? 'Hotele klientë' : 'Hotel clients' },
            { num: '48',   label: L === 'sq' ? 'Dhoma mesatare' : 'Average rooms' },
            { num: '4.9',  label: L === 'sq' ? 'Vlerësim mesatar' : 'Average rating' },
            { num: '99.9%',label: L === 'sq' ? 'Uptime garantuar' : 'Guaranteed uptime' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center">
              <p className="text-4xl font-semibold tracking-tight mb-1">{s.num}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Login section */}
      <section id="login-section" className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-16 items-center max-w-3xl mx-auto">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase text-blue-600 mb-3">Portal</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-3" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {L === 'sq' ? 'Hyr në platformë' : 'Sign in to platform'}
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6 text-sm">
              {L === 'sq' ? 'Mysafirët dhe stafi kanë akses të dedikuar. Historik rezervimesh, fatura dhe dashboard.' : 'Guests and staff have dedicated access. Booking history, invoices and dashboard.'}
            </p>
            <div className="space-y-2.5">
              {(L === 'sq'
                ? ['Historiku i plotë i rezervimeve','Ndryshim dhe anulim i lehtë','Faturat dhe konfirmimet','Dashboard për stafin']
                : ['Full booking history','Easy modification and cancellation','Invoices and confirmations','Staff dashboard']
              ).map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />{f}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm mb-6">
              {L === 'sq' ? 'Klikoni për të hyrë ose krijuar llogari' : 'Click to sign in or create account'}
            </p>
            <Link to="/login" className="block w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition mb-3">
              {L === 'sq' ? 'Hyr / Regjistrohu' : 'Sign in / Register'}
            </Link>
            <p className="text-xs text-gray-400">{L === 'sq' ? '✓ Google OAuth · ✓ Email · ✓ POK Pay' : '✓ Google OAuth · ✓ Email · ✓ POK Pay'}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="font-semibold">Hotel<span className="text-blue-600">OS</span></span>
          <span className="text-sm text-gray-400">© 2025 HotelOS. {L === 'sq' ? 'Të gjitha të drejtat e rezervuara.' : 'All rights reserved.'}</span>
        </div>
      </footer>
    </div>
  )
}
