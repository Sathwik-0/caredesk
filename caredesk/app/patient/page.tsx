'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PatientSidebar } from '@/components/patient-sidebar'

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [patientId, setPatientId] = useState('')
  const [tab, setTab] = useState<'appointments'|'prescriptions'|'invoices'>('appointments')
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile?.role !== 'patient') { router.push('/auth/login'); return }
      setUser(profile)

      let { data: patient } = await supabase.from('patients').select('id').eq('profile_id', user.id).single()
      if (!patient) {
        const { data: newPat } = await supabase.from('patients').insert({ profile_id: user.id }).select().single()
        patient = newPat
      }
      if (!patient) return
      setPatientId(patient.id)

      const [appts, rx, inv] = await Promise.all([
        supabase.from('appointments').select('*, doctors(profiles(full_name), specialization)').eq('patient_id', patient.id).order('appointment_date', { ascending: false }),
        supabase.from('prescriptions').select('*, doctors(profiles(full_name)), appointments(appointment_date)').eq('patient_id', patient.id).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*, appointments(appointment_date, doctors(profiles(full_name)))').eq('patient_id', patient.id).order('created_at', { ascending: false })
      ])
      setAppointments(appts.data || [])
      setPrescriptions(rx.data || [])
      setInvoices(inv.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const statusBadge = (s: string) => ({ scheduled: 'border border-blue-500/20 bg-blue-500/10 text-blue-400', confirmed: 'border border-purple-500/20 bg-purple-500/10 text-purple-400', completed: 'border border-teal-500/20 bg-teal-500/10 text-teal-400', cancelled: 'border border-red-500/20 bg-red-500/10 text-red-400' }[s] || 'border border-white/10 bg-white/5 text-white/50')
  const invBadge = (s: string) => s === 'paid' ? 'border border-teal-500/20 bg-teal-500/10 text-teal-400' : 'border border-yellow-500/20 bg-yellow-500/10 text-yellow-400'

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="text-center"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /><p className="text-sm text-white/50">Loading...</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <PatientSidebar userName={user?.full_name} patientId={patientId} onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Hello, {user?.full_name?.split(' ')[0]} 👋</h1>
            <p className="mt-1 text-sm text-white/40">Manage your health with CareDesk</p>
          </div>
          {patientId && (
            <Link href={`/patient/appointments/new?patient=${patientId}`} className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 active:scale-95 transition-all">
              + Book Appointment
            </Link>
          )}
        </div>

        <div className="mb-6 inline-flex rounded-xl bg-white/[0.05] p-1">
          {(['appointments','prescriptions','invoices'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-teal-500/20 text-teal-400' : 'text-white/50 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'appointments' && (
          <div className="space-y-3">
            {appointments.map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#111111] p-4 hover:border-white/[0.12] transition-all">
                <div>
                  <p className="font-medium text-white">Dr. {a.doctors?.profiles?.full_name}</p>
                  <p className="text-sm text-white/50">{a.doctors?.specialization}</p>
                  <p className="mt-1 text-xs text-white/30">{a.appointment_date} at {a.appointment_time?.slice(0,5)}</p>
                  {a.reason && <p className="text-xs text-white/30">Reason: {a.reason}</p>}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(a.status)}`}>{a.status}</span>
              </div>
            ))}
            {appointments.length === 0 && <div className="rounded-2xl border border-white/[0.06] bg-[#111111] py-16 text-center text-white/40"><p className="mb-2 text-3xl">📅</p><p className="text-sm">No appointments yet</p></div>}
          </div>
        )}

        {tab === 'prescriptions' && (
          <div className="space-y-4">
            {prescriptions.map(p => (
              <div key={p.id} className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5">
                <div className="mb-3">
                  <p className="font-medium text-white">Dr. {p.doctors?.profiles?.full_name}</p>
                  <p className="text-xs text-white/40">{p.appointments?.appointment_date} · {p.diagnosis}</p>
                </div>
                {p.medicines?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {p.medicines.map((m: any, i: number) => (
                      <div key={i} className="flex gap-4 rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-2 text-sm text-white/80">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-white/40">{m.dosage}</span>
                        <span className="text-white/40">{m.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
                {p.instructions && <p className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-200/80">📝 {p.instructions}</p>}
                {p.follow_up_date && <p className="mt-2 text-xs text-white/40">Follow-up: {p.follow_up_date}</p>}
              </div>
            ))}
            {prescriptions.length === 0 && <div className="rounded-2xl border border-white/[0.06] bg-[#111111] py-16 text-center text-white/40"><p className="mb-2 text-3xl">💊</p><p className="text-sm">No prescriptions yet</p></div>}
          </div>
        )}

        {tab === 'invoices' && (
          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#111111] p-4">
                <div>
                  <p className="font-medium text-white">Dr. {inv.appointments?.doctors?.profiles?.full_name}</p>
                  <p className="text-xs text-white/40">{inv.appointments?.appointment_date}</p>
                  {inv.payment_method && <p className="text-xs text-white/30 capitalize mt-0.5">Paid via {inv.payment_method}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">₹{Number(inv.amount).toLocaleString('en-IN')}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${invBadge(inv.status)}`}>{inv.status}</span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <div className="rounded-2xl border border-white/[0.06] bg-[#111111] py-16 text-center text-white/40"><p className="mb-2 text-3xl">₹</p><p className="text-sm">No invoices yet</p></div>}
          </div>
        )}
      </main>
    </div>
  )
}
