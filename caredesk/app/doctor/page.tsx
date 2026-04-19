'use client'
import { useEffect, useRef, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DoctorSidebar } from '@/components/doctor-sidebar'
import { toast } from 'sonner'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctor, setDoctor] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'today'|'all'>('today')
  const clinicIdRef = useRef<string | null>(null)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile?.role !== 'doctor') { router.push('/auth/login'); return }
      setUser(profile)
      const { data: doc } = await supabase.from('doctors').select('*').eq('profile_id', user.id).single()
      setDoctor(doc)
      if (doc?.clinic_id) clinicIdRef.current = doc.clinic_id
    }
    init()
  }, [])

  useEffect(() => {
    if (!doctor) return
    const fetch = async () => {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const base = supabase.from('appointments')
        .select('*, patients(id, profile_id, profiles(full_name, phone))')
        .eq('doctor_id', doctor.id)
      const q = tab === 'today'
        ? base.eq('appointment_date', today).order('appointment_time')
        : base.order('appointment_date', { ascending: false }).order('appointment_time')
      const { data } = await q
      setAppointments(data || [])
      setLoading(false)
    }
    fetch()
  }, [tab, doctor])

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }

  const statusBadge = (s: string) => ({
    scheduled: 'border border-blue-500/20 bg-blue-500/10 text-blue-400',
    confirmed: 'border border-purple-500/20 bg-purple-500/10 text-purple-400',
    completed: 'border border-teal-500/20 bg-teal-500/10 text-teal-400',
    cancelled: 'border border-red-500/20 bg-red-500/10 text-red-400',
  }[s] || 'border border-white/10 bg-white/5 text-white/50')

  const markComplete = async (id: string) => {
    const appt = appointments.find(a => a.id === id)
    if (!appt) return
    await supabase.from('appointments').update({ status: 'completed' }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a))
    let clinicId = clinicIdRef.current || doctor?.clinic_id
    if (!clinicId) { toast.error('Invoice not created: clinic error'); return }
    const { error } = await supabase.from('invoices').insert({
      appointment_id: id, patient_id: appt.patient_id,
      amount: doctor?.consultation_fee || 300,
      status: 'pending', clinic_id: clinicId
    })
    if (error) toast.error('Appointment done but invoice failed')
    else toast.success('Appointment completed & invoice created')
  }

  if (loading && !doctor) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="text-center"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /><p className="text-sm text-white/50">Loading...</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <DoctorSidebar userName={user?.full_name} onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[#111111] p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">Dr. {user?.full_name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">{doctor?.specialization}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">₹{doctor?.consultation_fee} per visit</span>
            {doctor?.available_from && <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">{doctor.available_from?.slice(0,5)} – {doctor.available_to?.slice(0,5)}</span>}
          </div>
        </div>

        <div className="mb-6 inline-flex rounded-xl bg-white/[0.05] p-1">
          {(['today','all'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-teal-500/20 text-teal-400' : 'text-white/50 hover:text-white'}`}>
              {t === 'today' ? 'Today' : 'All Appointments'}
            </button>
          ))}
        </div>

        {loading ? <div className="py-20 text-center text-white/40">Loading...</div> : (
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-[#111111] py-16 text-center text-white/40">
                <p className="mb-3 text-4xl">🗓️</p>
                <p className="text-sm">{tab === 'today' ? 'No appointments today' : 'No appointments yet'}</p>
              </div>
            ) : appointments.map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#111111] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-sm font-semibold text-teal-400">
                    {a.patients?.profiles?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{a.patients?.profiles?.full_name || 'Unknown Patient'}</p>
                    <p className="text-xs text-white/50">{a.appointment_date} at {a.appointment_time?.slice(0,5)}</p>
                    <p className="text-xs text-white/30">{a.patients?.profiles?.phone || 'No phone'}</p>
                    {a.reason && <p className="mt-0.5 text-xs text-white/30">Reason: {a.reason}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(a.status)}`}>{a.status}</span>
                  {a.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => markComplete(a.id)} className="rounded-xl bg-teal-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-600">Mark Done</button>
                      <Link href={`/doctor/prescriptions/new?appointment=${a.id}&patient=${a.patient_id}`} className="rounded-xl border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.08]">Prescribe</Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
