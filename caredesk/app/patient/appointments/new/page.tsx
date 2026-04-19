'use client'
import { Suspense, useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { PatientSidebar } from '@/components/patient-sidebar'
import { toast } from 'sonner'

function BookAppointmentContent() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [clinicId, setClinicId] = useState('')
  const [form, setForm] = useState({ doctor_id: '', appointment_date: '', appointment_time: '', reason: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createSupabaseBrowser()
  const router = useRouter()
  const params = useSearchParams()
  const patientId = params.get('patient')

  useEffect(() => {
    const load = async () => {
      setInitializing(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setUser(profile)

      // Resolve clinic
      const { data: clinic } = await supabase.from('clinics').select('id').limit(1).single()
      if (!clinic) { toast.error('Clinic configuration error'); setInitializing(false); return }
      setClinicId(clinic.id)

      // Fetch doctors for this clinic
      const { data, error } = await supabase.from('doctors')
        .select('*, profiles(full_name)')
        .eq('clinic_id', clinic.id)
        .order('created_at')
      setDoctors(data || [])
      setInitializing(false)
    }
    load()
  }, [])

  const book = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId) { toast.error('Clinic configuration error'); return }
    setLoading(true)
    const { error } = await supabase.from('appointments').insert({
      patient_id: patientId, doctor_id: form.doctor_id,
      appointment_date: form.appointment_date, appointment_time: form.appointment_time,
      reason: form.reason, status: 'scheduled', clinic_id: clinicId
    })
    if (!error) {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'appointment_confirmation', patientId, doctorId: form.doctor_id, date: form.appointment_date, time: form.appointment_time })
      })
      setSuccess(true)
      setTimeout(() => router.push('/patient'), 2000)
    } else {
      toast.error('Failed to book appointment')
    }
    setLoading(false)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const today = new Date().toISOString().split('T')[0]
  const timeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00']
  const fieldClass = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500'

  if (success) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#111111] p-8 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="mb-2 text-xl font-bold text-white">Appointment Booked!</h2>
        <p className="text-sm text-white/50">Confirmation email sent. Redirecting...</p>
      </div>
    </div>
  )

  if (initializing) return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <PatientSidebar patientId={patientId || undefined} onLogout={logout} />
      <main className="ml-64 flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /></main>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <PatientSidebar userName={user?.full_name} patientId={patientId || undefined} onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-white">Book Appointment</h1>
        <form onSubmit={book} className="max-w-lg space-y-5 rounded-2xl border border-white/[0.06] bg-[#111111] p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">Select Doctor *</label>
            <select value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })} required className={fieldClass}>
              <option value="" className="bg-gray-900">Choose a doctor...</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id} className="bg-gray-900">
                  Dr. {d.profiles?.full_name} — {d.specialization} (₹{d.consultation_fee})
                </option>
              ))}
            </select>
            {doctors.length === 0 && <p className="mt-1 text-xs text-yellow-400/80">No doctors available yet. Contact clinic admin.</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">Date *</label>
            <input type="date" value={form.appointment_date} min={today} onChange={e => setForm({ ...form, appointment_date: e.target.value })} required className={fieldClass} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white/60">Time *</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(t => (
                <button key={t} type="button" onClick={() => setForm({ ...form, appointment_time: t })}
                  className={`rounded-xl border py-2 text-sm font-medium transition-colors ${form.appointment_time === t ? 'border-teal-500/50 bg-teal-500/20 text-teal-400' : 'border-white/[0.08] text-white/60 hover:border-teal-500/30'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">Reason for visit</label>
            <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className={fieldClass} placeholder="e.g. Fever, follow-up, general checkup" />
          </div>
          <button type="submit" disabled={loading || !form.doctor_id || !form.appointment_date || !form.appointment_time}
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 font-medium text-white disabled:opacity-50 hover:opacity-95 transition-opacity">
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default function BookAppointment() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <BookAppointmentContent />
    </Suspense>
  )
}
