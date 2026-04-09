import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { signIn, signInWithGoogle } from '../../lib/auth'
import { getRedirectPath } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'

type View = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [view, setView] = useState<View>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(params.get('error') ? 'Ndodhi një gabim. Provoni përsëri.' : '')
  const [success, setSuccess] = useState(params.get('success') === 'password_reset' ? 'Fjalëkalimi u rivendos. Mund të hyni.' : '')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Plotëso email dhe fjalëkalimin.'); return }
    setLoading(true); setError('')
    try {
      await signIn(form.email, form.password)
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('user_profiles').select('role').eq('id', user!.id).single()
      navigate(getRedirectPath(profile?.role ?? 'guest'), { replace: true })
    } catch (e: any) {
      setError(
        e.message?.includes('Invalid login') ? 'Email ose fjalëkalim i gabuar.' :
        e.message?.includes('Email not confirmed') ? 'Konfirmo emailin tënd fillimisht.' :
        'Ndodhi një gabim. Provo përsëri.'
      )
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError('Plotëso të gjitha fushat.'); return }
    if (form.password.length < 8) { setError('Fjalëkalimi duhet të ketë minimum 8 karaktere.'); return }
    setLoading(true); setError('')
    try {
      const { data } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name },
          emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
        },
      })
      if (data.user && !data.session) {
        setSuccess('Llogaria u krijua! Kontrollo emailin për të konfirmuar.')
        setView('login')
      } else {
        navigate('/booking', { replace: true })
      }
    } catch (e: any) {
      setError(
        e.message?.includes('already registered') ? 'Ky email është i regjistruar tashmë.' :
        'Gabim gjatë regjistrimit. Provo përsëri.'
      )
    } finally { setLoading(false) }
  }

  const handleForgot = async () => {
    if (!form.email) { setError('Shkruaj emailin tënd.'); return }
    setLoading(true); setError('')
    try {
      await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/auth/reset-password`,
      })
      setSuccess('Email-i u dërgua! Kontrollo kutinë tuaj.')
    } catch {
      setError('Gabim. Provo përsëri.')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('')
    try {
      await signInWithGoogle()
    } catch {
      setError('Gabim me Google login. Provo përsëri.')
      setGoogleLoading(false)
    }
  }

  const switchView = (v: View) => { setView(v); setError(''); setSuccess('') }

  const titles: Record<View, { h: string; sub: string }> = {
    login:    { h: 'Mirë se vini',           sub: 'Hyni në llogarinë tuaj' },
    register: { h: 'Krijo llogari',          sub: 'Filloni falas, pa kartë krediti' },
    forgot:   { h: 'Rivendos fjalëkalimin',  sub: 'Do të merrni email me instruksione' },
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between max-w-sm mx-auto w-full">
        <Link to="/" className="text-lg font-semibold text-gray-900 tracking-tight">
          Hotel<span className="text-blue-600">OS</span>
        </Link>
        {view === 'login' && (
          <button onClick={() => switchView('register')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Regjistrohu →
          </button>
        )}
        {(view === 'register' || view === 'forgot') && (
          <button onClick={() => switchView('login')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← Kthehu
          </button>
        )}
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">{titles[view].h}</h1>
            <p className="text-sm text-gray-500">{titles[view].sub}</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5 mb-5">
              <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-3.5 mb-5">
              <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Google */}
          {view !== 'forgot' && (
            <>
              <button onClick={handleGoogle} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60 mb-4">
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Vazhdo me Google
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">ose</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

          {/* Form */}
          <div className="space-y-4">
            {view === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Emri i plotë</label>
                <input type="text" value={form.name} onChange={set('name')} placeholder="Artan Kola"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="emri@hotel.al"
                onKeyDown={e => e.key === 'Enter' && view === 'forgot' && handleForgot()}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition" />
            </div>

            {view !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-gray-600">Fjalëkalimi</label>
                  {view === 'login' && (
                    <button onClick={() => switchView('forgot')} className="text-xs text-blue-500 hover:text-blue-700">
                      Harrove?
                    </button>
                  )}
                </div>
                <input type="password" value={form.password} onChange={set('password')}
                  placeholder={view === 'register' ? 'Min. 8 karaktere' : '••••••••'}
                  onKeyDown={e => e.key === 'Enter' && (view === 'login' ? handleLogin() : handleRegister())}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition" />
              </div>
            )}

            {/* Password strength */}
            {view === 'register' && form.password && (
              <div className="flex gap-1.5">
                {[form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password)].map((ok, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${ok ? 'bg-green-500' : 'bg-gray-200'}`} />
                ))}
              </div>
            )}

            <button
              onClick={view === 'login' ? handleLogin : view === 'register' ? handleRegister : handleForgot}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Duke procesuar...
                </span>
              ) : view === 'login' ? 'Hyr në llogari'
                : view === 'register' ? 'Krijo llogari falas'
                : 'Dërgo email rivendosje'}
            </button>
          </div>

          {/* Footer link */}
          <p className="text-center text-xs text-gray-400 mt-6">
            {view === 'login' ? (
              <>Nuk ke llogari?{' '}
                <button onClick={() => switchView('register')} className="text-blue-600 hover:text-blue-700 font-medium">
                  Regjistrohu falas
                </button>
              </>
            ) : view === 'register' ? (
              <>Ke llogari?{' '}
                <button onClick={() => switchView('login')} className="text-blue-600 hover:text-blue-700 font-medium">Hyr</button>
              </>
            ) : (
              <button onClick={() => switchView('login')} className="text-blue-600 hover:text-blue-700 font-medium">
                ← Kthehu te logimi
              </button>
            )}
          </p>
        </div>

        {/* Trust badges — desktop */}
        <div className="hidden lg:flex flex-col gap-2 ml-12 text-sm text-gray-400">
          {['SSL i siguruar', 'GDPR compliant', 'Uptime 99.9%', 'Support 24/7'].map(t => (
            <div key={t} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
