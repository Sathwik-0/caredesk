'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '', specialization: '', qualification: '', consultation_fee: '300', phone: '', available_from: '09:00', available_to: '18:00' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => { loadDoctors() }, [])

  const loadDoctors = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data } = await supabase.from('doctors').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false })
    setDoctors(data || [])
  }

  const addDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const res = await fetch('/api/admin/create-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const json = await res.json()
    if (json.error) { setMsg(json.error); setLoading(false); return }
    setMsg('Doctor added successfully!')
    setShowAdd(false)
    setForm({ email: '', password: '', full_name: '', specialization: '', qualification: '', consultation_fee: '300', phone: '', available_from: '09:00', available_to: '18:00' })
    loadDoctors()
    setLoading(false)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const inputClass = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500'

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <AdminSidebar onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Doctors</h1>
          <button type="button" onClick={() => setShowAdd(true)} className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 active:scale-95">+ Add Doctor</button>
        </div>
        {msg && <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.includes('success') ? 'border-teal-500/20 bg-teal-500/10 text-teal-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>{msg}</div>}

        {showAdd && (
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[#111111] p-6">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-white/40">Add New Doctor</h2>
            <form onSubmit={addDoctor} className="grid grid-cols-2 gap-4">
              {[
                ['full_name','Full Name','text','Dr. Ramesh Kumar'],
                ['email','Email','email','doctor@clinic.com'],
                ['password','Password','password','Min 8 chars'],
                ['phone','Phone','tel','+91 98765 43210'],
                ['specialization','Specialization','text','General Medicine'],
                ['qualification','Qualification','text','MBBS, MD'],
                ['consultation_fee','Consultation Fee (₹)','number','300'],
              ].map(([k,l,t,p]) => (
                <div key={k}>
                  <label className="mb-1 block text-sm font-medium text-white/60">{l}</label>
                  <input type={t} placeholder={p} value={(form as any)[k]} onChange={e => setForm({...form, [k]: e.target.value})}
                    required={!['phone','qualification'].includes(k)} className={inputClass} />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm font-medium text-white/60">Available From</label>
                <input type="time" value={form.available_from} onChange={e => setForm({...form, available_from: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/60">Available To</label>
                <input type="time" value={form.available_to} onChange={e => setForm({...form, available_to: e.target.value})} className={inputClass} />
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="rounded-xl bg-teal-500 px-6 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50">{loading ? 'Adding...' : 'Add Doctor'}</button>
                <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-6 py-2 text-sm text-white/70 hover:bg-white/[0.08]">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {doctors.map(d => (
            <div key={d.id} className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-sm font-semibold text-teal-400">{d.profiles?.full_name?.charAt(0)}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">Dr. {d.profiles?.full_name}</p>
                  <p className="text-sm text-white/50">{d.specialization}</p>
                  <p className="mt-1 text-xs text-white/30">{d.profiles?.email}</p>
                  {d.available_from && <p className="text-xs text-white/30 mt-0.5">Hours: {d.available_from?.slice(0,5)} – {d.available_to?.slice(0,5)}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">₹{d.consultation_fee}</p>
                  <p className="text-xs text-white/30">per visit</p>
                </div>
              </div>
            </div>
          ))}
          {doctors.length === 0 && <div className="col-span-2 rounded-2xl border border-white/[0.06] bg-[#111111] py-12 text-center text-white/40"><p className="mb-2 text-3xl">👨‍⚕️</p><p className="text-sm">No doctors added yet</p></div>}
        </div>
      </main>
    </div>
  )
}
