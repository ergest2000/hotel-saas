import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

const empty = { name: '', category: 'Pastrim', unit: 'cope', quantity: 0, min_quantity: 5, unit_cost: 0, supplier_id: '' }
const categories = ['Pastrim','Lavanteri','F&B','Mirëmbajtje','Zyrë','Tjetër']
const units = ['cope','kg','liter','kuti','palë']

export default function AdminInventory() {
  const { profile } = useAuthStore()
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const [filterCat, setFilterCat] = useState('all')
  const [showLow, setShowLow] = useState(false)

  const { data: items } = useQuery({
    queryKey: ['admin-inventory', profile?.hotel_id],
    enabled: !!profile?.hotel_id,
    queryFn: async () => {
      const { data } = await supabase.from('inventory_items').select('*, suppliers(name)')
        .eq('hotel_id', profile!.hotel_id).order('category')
      return data
    },
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', profile?.hotel_id],
    enabled: !!profile?.hotel_id,
    queryFn: async () => {
      const { data } = await supabase.from('suppliers').select('id, name').eq('hotel_id', profile!.hotel_id).eq('is_active', true)
      return data
    },
  })

  const saveItem = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, supplier_id: data.supplier_id || null }
      if (editing) { const { error } = await supabase.from('inventory_items').update(payload).eq('id', editing.id); if (error) throw error }
      else { const { error } = await supabase.from('inventory_items').insert({ ...payload, hotel_id: profile!.hotel_id }); if (error) throw error }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-inventory'] }); setModal(false); setEditing(null); setForm(empty) },
  })

  const updateQty = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      const item = items?.find(i => i.id === id)
      if (!item) return
      await supabase.from('inventory_items').update({ quantity: Math.max(0, item.quantity + delta) }).eq('id', id)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inventory'] }),
  })

  const deleteItem = useMutation({
    mutationFn: async (id: string) => { await supabase.from('inventory_items').delete().eq('id', id) },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-inventory'] }),
  })

  const openEdit = (item: any) => {
    setEditing(item)
    setForm({ name: item.name, category: item.category, unit: item.unit, quantity: item.quantity, min_quantity: item.min_quantity, unit_cost: item.unit_cost ?? 0, supplier_id: item.supplier_id ?? '' })
    setModal(true)
  }

  const filtered = items?.filter(i => {
    if (filterCat !== 'all' && i.category !== filterCat) return false
    if (showLow && i.quantity > i.min_quantity) return false
    return true
  })

  const lowCount = items?.filter(i => i.quantity <= i.min_quantity).length ?? 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          {lowCount > 0 && <p className="text-sm text-red-500 mt-0.5">⚠ {lowCount} artikuj me stok të ulët</p>}
        </div>
        <button onClick={() => { setEditing(null); setForm(empty); setModal(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">+ Artikull i ri</button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setFilterCat('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterCat === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Të gjitha</button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterCat === c ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{c}</button>
        ))}
        <button onClick={() => setShowLow(v => !v)} className={`ml-auto px-4 py-1.5 rounded-full text-sm font-medium transition ${showLow ? 'bg-red-500 text-white' : 'bg-white border border-red-200 text-red-500 hover:bg-red-50'}`}>
          {showLow ? '✕ Stok i ulët' : '⚠ Stok i ulët'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Artikulli','Kategoria','Furnitori','Sasia','Min.','Kostoja',''].map(h => (
              <th key={h} className="text-left px-4 py-3 font-medium text-gray-400 text-xs uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered?.map(item => {
              const isLow = item.quantity <= item.min_quantity
              return (
                <tr key={item.id} className={`hover:bg-gray-50 ${isLow ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.unit}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">{item.category}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{(item.suppliers as any)?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty.mutate({ id: item.id, delta: -1 })} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">−</button>
                      <span className={`font-semibold min-w-[2rem] text-center text-sm ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{item.quantity}</span>
                      <button onClick={() => updateQty.mutate({ id: item.id, delta: 1 })} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">+</button>
                      {isLow && <span className="text-xs text-red-500 font-medium">Ulët!</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{item.min_quantity}</td>
                  <td className="px-4 py-3 text-gray-500">€{item.unit_cost}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(item)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50 text-gray-600">Ndrysho</button>
                      <button onClick={() => { if (confirm(`Fshi "${item.name}"?`)) deleteItem.mutate(item.id) }} className="text-xs bg-red-50 text-red-500 rounded-lg px-2 py-1 hover:bg-red-100">Fshi</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered?.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Nuk ka artikuj.</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-5">{editing ? 'Ndrysho artikullin' : 'Artikull i ri'}</h2>
            <div className="space-y-3">
              <input placeholder="Emri i artikullit" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm" />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sasia</label>
                  <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minimumi</label>
                  <input type="number" value={form.min_quantity} onChange={e => setForm(f => ({ ...f, min_quantity: +e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Kosto/njësi (€)</label>
                <input type="number" value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: +e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm" />
              </div>
              <select value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm">
                <option value="">Pa furnitor</option>
                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">Anulo</button>
              <button onClick={() => saveItem.mutate(form)} disabled={!form.name || saveItem.isPending}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saveItem.isPending ? 'Duke ruajtur...' : 'Ruaj'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
