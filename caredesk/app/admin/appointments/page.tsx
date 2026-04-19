'use client'
import { useEffect, useRef, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { toast } from 'sonner'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const clinicIdRef = useRef<string | null>(null)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: clinic } = await supabase.from('clinics').select('id').limit(1).single()
      if (clinic) clinicIdRef.current = clinic.id
    }
    init()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let q = supabase.from('appointments').select('*, patients(profiles(full_name, phone)), doctors(profiles(full_name), specialization, consultation_fee)').order('appointment_date', { ascending: false }).order('appointment_time')
      if (filter !== 'all') q = q.eq('status', filter)
      const { data } = await q
      setAppointments(data || [])
      setLoading(false)
    }
    load()
  }, [filter])

  const updateStatus = async (id: string, status: string) => {
    const appt = appointments.find(a => a.id === id)
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (status === 'completed' && appt) {
      const clinicId = clinicIdRef.current
      if (!clinicId) { toast.error('Clinic configuration error'); return }
      await supabase.from('invoices').insert({ appointment_id: id, patient_id: appt.patient_id, amount: appt.doctors?.consultation_fee || 300, status: 'pending', clinic_id: clinicId })
      toast.success('Appointment completed & invoice created')
    }
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const statusBadge = (s: string) => ({ scheduled: 'border border-blue-500/20 bg-blue-500/10 text-blue-400', confirmed: 'border border-purple-500/20 bg-purple-500/10 text-purple-400', completed: 'border border-teal-500/20 bg-teal-500/10 text-teal-400', cancelled: 'border border-red-500/20 bg-red-500/10 text-red-400', no_show: 'border border-white/10 bg-white/5 text-white/50' }[s] || 'border border-white/10 bg-white/5 text-white/50')

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <AdminSidebar onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Appointments</h1>
          <div className="flex flex-wrap gap-2">
            {['all','scheduled','confirmed','completed','cancelled','no_show'].map(f => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? 'border border-teal-500/20 bg-teal-500/10 text-teal-400' : 'border border-white/[0.08] bg-white/[0.05] text-white/60 hover:bg-white/[0.08]'}`}>
                {f.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="py-20 text-center text-white/40">Loading...</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111111]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {['Date','Time','Patient','Doctor','Reason','Status','Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-white/40">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id} className="border-b border-white/[0.04] text-sm text-white/80 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">{a.appointment_date}</td>
                    <td className="px-4 py-3 font-mono text-white/60">{a.appointment_time?.slice(0,5)}</td>
                    <td className="px-4 py-3">{a.patients?.profiles?.full_name}</td>
                    <td className="px-4 py-3 text-white/60">Dr. {a.doctors?.profiles?.full_name}</td>
                    <td className="max-w-32 truncate px-4 py-3 text-white/50">{a.reason || '—'}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(a.status)}`}>{a.status}</span></td>
                    <td className="px-4 py-3">
                      {a.status === 'scheduled' && (
                        <div className="flex gap-1">
                          <button type="button" onClick={() => updateStatus(a.id, 'completed')} className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-600 active:scale-95">Complete</button>
                          <button type="button" onClick={() => updateStatus(a.id, 'cancelled')} className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20">Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && <div className="py-12 text-center text-sm text-white/40">No appointments found</div>}
          </div>
        )}
      </main>
    </div>
  )
}
