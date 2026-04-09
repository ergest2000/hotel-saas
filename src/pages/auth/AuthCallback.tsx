import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getRedirectPath } from '../../stores/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handle = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) { navigate('/login?error=callback_failed'); return }

      const { data: profile } = await supabase
        .from('user_profiles').select('role').eq('id', session.user.id).single()

      navigate(getRedirectPath(profile?.role ?? 'guest'), { replace: true })
    }
    handle()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Duke ju ridrejtuar...</p>
      </div>
    </div>
  )
}
