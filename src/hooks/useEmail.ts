import { supabase } from '../lib/supabase'

export async function sendEmail(type: string, data: Record<string, unknown>) {
  const { error } = await supabase.functions.invoke('send-email', {
    body: { type, data },
  })
  if (error) console.error('Email error:', error)
}
