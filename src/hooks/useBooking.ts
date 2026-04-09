import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useAvailableRooms(hotelId: string, checkIn: string, checkOut: string) {
  return useQuery({
    queryKey: ['available-rooms', hotelId, checkIn, checkOut],
    enabled: !!checkIn && !!checkOut && !!hotelId,
    queryFn: async () => {
      const { data: bookedRoomIds } = await supabase
        .from('bookings')
        .select('room_id')
        .eq('hotel_id', hotelId)
        .in('status', ['confirmed', 'pending'])
        .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`)

      const bookedIds = bookedRoomIds?.map((b) => b.room_id) ?? []

      const query = supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('is_active', true)

      if (bookedIds.length > 0) {
        query.not('id', 'in', `(${bookedIds.join(',')})`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (booking: {
      hotel_id: string
      room_id: string
      guest_name: string
      guest_email: string
      guest_phone?: string
      check_in: string
      check_out: string
      total_price: number
      source?: string
    }) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert({ ...booking, status: 'pending' })
        .select()
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useUpdateBookingStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
  })
}
