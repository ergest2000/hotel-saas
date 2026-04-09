import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function usePokPayment() {
  return useMutation({
    mutationFn: async (params: {
      bookingId: string
      amount: number
      description: string
      customerEmail: string
    }) => {
      const { data, error } = await supabase.functions.invoke('create-pok-payment', {
        body: params,
      })
      if (error) throw error
      return data as { checkoutUrl: string; sessionId: string }
    },
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl
    },
  })
}
