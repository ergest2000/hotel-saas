import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

const CHANNELS = ['booking.com','expedia','airbnb','logdify','myallocator']
const channelColor: Record<string, string> = {
  'booking.com': 'bg-blue-100 text-blue-700',
  'expedia': 'bg-yellow-100 text-yellow-700',
  'airbnb': 'bg-red-100 text-red-700',
  'logdify': 'bg-purple-100 text-purple-700',
  'myallocator': 'bg-green-100 text-green-700',
}

export default function AdminChannels() {
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ room_id: '', channel: 'booking.com', external_room_id: '' })

  const { data: rooms } = useQuery({
    queryKey: ['rooms-simple', profile?.hotel_id],
    enabled: !!profile?.hotel_id,
    queryFn: async () => {
      const { data } = await supabase.from('rooms').select('id, name').eq('hotel_id', profile!.hotel_id)
      return data
    },
  })

  const { data: mappings } = useQuery({
    queryKey: ['channel-mappings', profile?.hotel_id],
    enabled: !!profile?.hotel_id,
    queryFn: async () => {
      const { data } = await supabase.from('channel_mappings').select('*, rooms(name)')
        .eq('hotel_id', profile!.hotel_id).order('channel')
      return data
    },
  })

  const saveMapping = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('channel_mappings').insert({ ...data, hotel_id: profile!.hotel_id })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channel-mappings'] }); setModal(false); setForm({ room_id: '', channel: 'booking.com', external_room_id: '' }) },
  })

  const deleteMapping = useMutation({
    mutationFn: async (id: string) => { await supabase.from('channel_mappings').delete().eq('id', id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['channel-mappings'] }),
  })

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Channel Manager</h1>
          <p className="text-sm text-gray-400 mt-0.5">Lidh dhomat me OTA platformat</p>
        </div>
        <button onClick={() => setModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">+ Shto lidhje</button>
      </div>

      {/* Webhook URLs */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
        <h2 className="font-medium text-blue-800 mb-3 text-sm">Webhook URLs — shto në çdo OTA</h2>
        <div className="space-y-2">
          {CHANNELS.map(ch => (
            <div key={ch} className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded font-medium w-28 text-center ${channelColor[ch] ?? 'bg-gray-100 text-gray-500'}`}>{ch}</span>
              <code className="text-xs bg-white border border-blue-100 rounded-lg px-3 py-1.5 flex-1 text-gray-600 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {supabaseUrl}/functions/v1/ota-webhook?channel={ch}
              </code>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Dhoma lokale','Kanali','ID externe','Sinkronizimi',''].map(h => (
              <th key={h} className="text-left px-4 py-3 font-medium text-gray-400 text-xs uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mappings?.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{(m.rooms as any)?.name}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded font-medium ${channelColor[m.channel] ?? 'bg-gray-100 text-gray-500'}`}>{m.channel}</span></td>
                <td className="px-4 py-3 font-mono text-gray-400 text-xs">{m.external_room_id}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{m.last_synced_at ? new Date(m.last_synced_at).toLocaleString('sq-AL') : 'Asnjëherë'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { if (confirm('Fshi këtë lidhje?')) deleteMapping.mutate(m.id) }}
                    className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-lg hover:bg-red-100">Fshi</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mappings?.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Nuk ka lidhje të konfiguruara.</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-5">Shto lidhje OTA</h2>
            <div className="space-y-3">
              <select value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm">
                <option value="">Zgjidh dhomën</option>
                {rooms?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm">
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="ID e dhomës në OTA (p.sh. 12345)" value={form.external_room_id}
                onChange={e => setForm(f => ({ ...f, external_room_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm" />
              <p className="text-xs text-gray-400">ID-ja gjendet te paneli i OTA-s tek seksioni i dhomave.</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">Anulo</button>
              <button onClick={() => saveMapping.mutate(form)} disabled={!form.room_id || !form.external_room_id || saveMapping.isPending}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saveMapping.isPending ? 'Duke ruajtur...' : 'Shto lidhjen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
