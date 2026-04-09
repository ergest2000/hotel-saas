import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  const handleReset = async () => {
    if (!password || password !== confirm) { setError('Fjalëkalimet nuk përputhen.'); return }
    if (password.length < 8) { setError('Minimum 8 karaktere.'); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      await supabase.auth.signOut()
      navigate('/login?success=password_reset')
    } catch {
      setError('Gabim gjatë rivendosjes. Kërko email të ri.')
    } finally { setLoading(false) }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Duke verifikuar linkun...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <Link to="/" className="block text-lg font-semibold text-gray-900 mb-7 tracking-tight">
          Hotel<span className="text-blue-600">OS</span>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Fjalëkalim i ri</h1>
        <p className="text-sm text-gray-500 mb-6">Zgjidh fjalëkalimin e ri për llogarinë tënde.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 mb-5 text-sm text-red-700">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Fjalëkalimi i ri</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 karaktere"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Konfirmo fjalëkalimin</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()} placeholder="Përsërit fjalëkalimin"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition" />
          </div>

          {password && (
            <div className="flex gap-1.5">
              {[password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].map((ok, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${ok ? 'bg-green-500' : 'bg-gray-200'}`} />
              ))}
            </div>
          )}

          <button onClick={handleReset} disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? 'Duke rivendosur...' : 'Ruaj fjalëkalimin e ri'}
          </button>
        </div>
      </div>
    </div>
  )
}
