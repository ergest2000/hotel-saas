import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

const empty = { name: '', type: 'double', capacity: 2, price_per_night: 0, description: '' }

export default function AdminRooms() {
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(empty)

  const { data: rooms } = useQuery({
    queryKey: ['admin-rooms', profile?.hotel_id],
    enabled: !!profile?.hotel_id,
    queryFn: async () => {
      const { data } = await supabase.from('rooms').select('*').eq('hotel_id', profile!.hotel_id).order('name')
      return data
    },
  })

  const saveRoom = useMutation({
    mutationFn: async (data: any) => {
      if (editing) {
        const { error } = await supabase.from('rooms').update(data).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('rooms').insert({ ...data, hotel_id: profile!.hotel_id })
        if (error) throw error
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-rooms'] }); setModal(false); setEditing(null); setForm(empty) },
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await supabase.from('rooms').update({ is_active }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-rooms'] }),
  })

  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ name: r.name, type: r.type, capacity: r.capacity, price_per_night: r.price_per_night, description: r.description ?? '' })
    setModal(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dhomat</h1>
        <button onClick={() => { setEditing(null); setForm(empty); setModal(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          + Dhomë e re
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {rooms?.map(room => (
          <div key={room.id} className={`bg-white border border-gray-100 rounded-2xl p-5 ${!room.is_active ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{room.name}</h3>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{room.type} · {room.capacity} persona</p>
              </div>
              <p className="text-lg font-semibold text-blue-600">€{room.price_per_night}</p>
            </div>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{room.description}</p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(room)} className="flex-1 text-xs border border-gray-200 rounded-xl py-1.5 hover:bg-gray-50 text-gray-600">Ndrysho</button>
              <button onClick={() => toggleActive.mutate({ id: room.id, is_active: !room.is_active })}
                className={`flex-1 text-xs rounded-xl py-1.5 ${room.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {room.is_active ? 'Çaktivo' : 'Aktivo'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-5">{editing ? 'Ndrysho dhomën' : 'Dhomë e re'}</h2>
            <div className="space-y-3">
              <input placeholder="Emri i dhomës" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                {['single','double','suite','family'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
              <input type="number" placeholder="Kapaciteti" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: +e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              <input type="number" placeholder="Çmimi / natë (€)" value={form.price_per_night} onChange={e => setForm(f => ({ ...f, price_per_night: +e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              <textarea placeholder="Përshkrimi" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">Anulo</button>
              <button onClick={() => saveRoom.mutate(form)} disabled={!form.name || saveRoom.isPending}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saveRoom.isPending ? 'Duke ruajtur...' : 'Ruaj'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
