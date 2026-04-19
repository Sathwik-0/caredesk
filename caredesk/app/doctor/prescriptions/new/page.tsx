'use client'
import { Suspense, useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DoctorSidebar } from '@/components/doctor-sidebar'

function NewPrescriptionContent() {
  const [form, setForm] = useState({ diagnosis: '', instructions: '', follow_up_date: '' })
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }])
  const [loading, setLoading] = useState(false)
  const [doctorId, setDoctorId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [user, setUser] = useState<any>(null)
  const supabase = createSupabaseBrowser()
  const router = useRouter()
  const params = useSearchParams()
  const appointmentId = params.get('appointment')
  const patientId = params.get('patient')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setUser(profile)
      const { data: doc } = await supabase.from('doctors').select('id').eq('profile_id', user.id).single()
      if (doc) setDoctorId(doc.id)
      if (patientId) {
        const { data: pat } = await supabase.from('patients').select('profiles(full_name)').eq('id', patientId).single()
        setPatientName((pat as any)?.profiles?.full_name || '')
      }
    }
    load()
  }, [])

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }])
  const updateMed = (i: number, k: string, v: string) => setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [k]: v } : m))
  const removeMed = (i: number) => setMedicines(prev => prev.filter((_, idx) => idx !== i))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('prescriptions').insert({
      appointment_id: appointmentId, doctor_id: doctorId, patient_id: patientId,
      medicines: medicines.filter(m => m.name),
      diagnosis: form.diagnosis, instructions: form.instructions,
      follow_up_date: form.follow_up_date || null
    })
    if (!error) {
      await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId)
      router.push('/doctor')
    }
    setLoading(false)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const fieldClass = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500'

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <DoctorSidebar userName={user?.full_name} onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <div className="mb-6 flex items-center gap-2 text-sm text-white/40">
          <Link href="/doctor/prescriptions" className="hover:text-teal-400 transition-colors">Prescriptions</Link>
          <span>/</span><span className="text-white/60">New</span>
        </div>
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">New Prescription</h1>
        {patientName && <p className="mb-6 text-sm text-white/50">Patient: <span className="text-teal-400">{patientName}</span></p>}
        <form onSubmit={save} className="max-w-2xl space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-[#111111] p-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-white/40">Diagnosis & Notes</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/60">Diagnosis *</label>
              <input value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} required className={fieldClass} placeholder="e.g. Viral fever, Hypertension" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/60">Instructions for patient</label>
              <textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} rows={3} className={fieldClass} placeholder="Rest well, drink plenty of fluids..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/60">Follow-up date</label>
              <input type="date" value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} className={`${fieldClass} w-auto`} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-widest text-white/40">Medicines</h2>
              <button type="button" onClick={addMedicine} className="text-sm text-teal-400 hover:text-teal-300 transition-colors">+ Add medicine</button>
            </div>
            <div className="space-y-3">
              {medicines.map((m, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-start">
                  <input value={m.name} onChange={e => updateMed(i, 'name', e.target.value)} placeholder="Medicine name" className={fieldClass} />
                  <input value={m.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="Dosage (1-0-1)" className={fieldClass} />
                  <div className="flex gap-2">
                    <input value={m.duration} onChange={e => updateMed(i, 'duration', e.target.value)} placeholder="5 days" className={`flex-1 ${fieldClass}`} />
                    {medicines.length > 1 && <button type="button" onClick={() => removeMed(i)} className="px-2 text-red-400 hover:text-red-300 transition-colors">×</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 font-medium text-white hover:opacity-95 disabled:opacity-50 transition-opacity">
            {loading ? 'Saving...' : 'Save Prescription'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default function NewPrescription() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <NewPrescriptionContent />
    </Suspense>
  )
}
