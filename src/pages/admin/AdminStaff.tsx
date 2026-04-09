import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

const empty = { full_name: '', role: 'receptionist', department: '', phone: '', salary: 0, hired_at: '' }
const roles = ['receptionist','housekeeper','manager','hr','admin']
const departments = ['Recepsion','Pastrim','Restorant','Mirëmbajtje','HR','Menaxhim']

const roleColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  hr: 'bg-teal-100 text-teal-700',
  receptionist: 'bg-green-100 text-green-700',
  housekeeper: 'bg-amber-100 text-amber-700',
}

export default function AdminStaff() {
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const [tab, setTab] = useState<'staff'|'shifts'>('staff')

  const { data: staffList } = useQuery({
    queryKey: ['admin-staff', profile?.hotel_id],
    enabled: !!profile?.hotel_id,
    queryFn: async () => {
      const { data } = await supabase.from('staff').select('*').eq('hotel_id', profile!.hotel_id).order('full_name')
      return data
    },
  })

  const { data: shifts } = useQuery({
    queryKey: ['admin-shifts', profile?.hotel_id],
    enabled: !!profile?.hotel_id && tab === 'shifts',
    queryFn: async () => {
      const { data } = await supabase.from('shifts').select('*, staff(full_name, role)')
        .eq('hotel_id', profile!.hotel_id)
        .gte('shift_date', new Date().toISOString().split('T')[0])
        .order('shift_date').limit(30)
      return data
    },
  })

  const saveStaff = useMutation({
    mutationFn: async (data: any) => {
      if (editing) { const { error } = await supabase.from('staff').update(data).eq('id', editing.id); if (error) throw error }
      else { const { error } = await supabase.from('staff').insert({ ...data, hotel_id: profile!.hotel_id }); if (error) throw error }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-staff'] }); setModal(false); setEditing(null); setForm(empty) },
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await supabase.from('staff').update({ is_active }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-staff'] }),
  })

  const openEdit = (s: any) => {
    setEditing(s)
    setForm({ full_name: s.full_name, role: s.role, department: s.department ?? '', phone: s.phone ?? '', salary: s.salary ?? 0, hired_at: s.hired_at ?? '' })
    setModal(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Stafi</h1>
        <button onClick={() => { setEditing(null); setForm(empty); setModal(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">+ Staf i ri</button>
      </div>

      <div className="flex gap-2 mb-5">
        {(['staff','shifts'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            {t === 'staff' ? 'Lista e stafit' : 'Shift-et'}
          </button>
        ))}
      </div>

      {tab === 'staff' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Emri','Roli','Departamenti','Telefon','Paga','Punësuar',''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-400 text-xs uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staffList?.map(s => (
                <tr key={s.id} className={`hover:bg-gray-50 ${!s.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.full_name}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColor[s.role] ?? 'bg-gray-100 text-gray-500'}`}>{s.role}</span></td>
                  <td className="px-4 py-3 text-gray-500">{s.department}</td>
                  <td className="px-4 py-3 text-gray-500">{s.phone}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">€{s.salary?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.hired_at}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(s)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50 text-gray-600">Ndrysho</button>
                      <button onClick={() => toggleActive.mutate({ id: s.id, is_active: !s.is_active })}
                        className={`text-xs rounded-lg px-2 py-1 ${s.is_active ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                        {s.is_active ? 'Çaktivo' : 'Aktivo'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staffList?.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Nuk ka staf të regjistruar.</div>}
        </div>
      )}

      {tab === 'shifts' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Stafi','Roli','Data','Ora','Statusi','Shënime'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-400 text-xs uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shifts?.map(sh => (
                <tr key={sh.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{(sh.staff as any)?.full_name}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs capitalize ${roleColor[(sh.staff as any)?.role] ?? 'bg-gray-100 text-gray-500'}`}>{(sh.staff as any)?.role}</span></td>
                  <td className="px-4 py-3 text-gray-500">{sh.shift_date}</td>
                  <td className="px-4 py-3 text-gray-500">{sh.start_time} – {sh.end_time}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded capitalize">{sh.status}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{sh.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {shifts?.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Nuk ka shift-e të planifikuara.</div>}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-5">{editing ? 'Ndrysho stafin' : 'Staf i ri'}</h2>
            <div className="space-y-3">
              <input placeholder="Emri i plotë" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm">
                <option value="">Zgjidh departamentin</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input placeholder="Telefon" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm" />
              <input type="number" placeholder="Paga mujore (€)" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: +e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm" />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data e punësimit</label>
                <input type="date" value={form.hired_at} onChange={e => setForm(f => ({ ...f, hired_at: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">Anulo</button>
              <button onClick={() => saveStaff.mutate(form)} disabled={!form.full_name || saveStaff.isPending}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saveStaff.isPending ? 'Duke ruajtur...' : 'Ruaj'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
