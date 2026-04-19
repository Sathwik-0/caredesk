'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PatientSidebar } from '@/components/patient-sidebar'
import { toast } from 'sonner'

export default function PatientProfile() {
  const [user, setUser] = useState<any>(null)
  const [patientId, setPatientId] = useState('')
  const [form, setForm] = useState({ full_name: '', phone: '', date_of_birth: '', gender: '', blood_group: '', address: '', emergency_contact: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setUser(profile)
      let { data: patient } = await supabase.from('patients').select('*').eq('profile_id', user.id).single()
      if (!patient) {
        const { data: newPat } = await supabase.from('patients').insert({ profile_id: user.id }).select().single()
        patient = newPat
      }
      if (patient) {
        setPatientId(patient.id)
        setForm({
          full_name: profile?.full_name || '',
          phone: profile?.phone || '',
          date_of_birth: patient.date_of_birth || '',
          gender: patient.gender || '',
          blood_group: patient.blood_group || '',
          address: patient.address || '',
          emergency_contact: patient.emergency_contact || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const [profileUpdate, patientUpdate] = await Promise.all([
      supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone }).eq('id', user.id),
      supabase.from('patients').update({
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        address: form.address || null,
        emergency_contact: form.emergency_contact || null,
      }).eq('id', patientId)
    ])
    if (profileUpdate.error || patientUpdate.error) {
      toast.error('Failed to save changes')
    } else {
      toast.success('Profile updated successfully')
      setUser((prev: any) => ({ ...prev, full_name: form.full_name }))
    }
    setSaving(false)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const inputClass = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500'

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <PatientSidebar userName={user?.full_name} patientId={patientId} onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="mb-6 text-sm text-white/40">Update your personal and medical information</p>

        <form onSubmit={save} className="max-w-2xl space-y-6">
          {/* Personal Info */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-6 space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-white/40">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/60">Full Name</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/60">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/60">Date of Birth</label>
                <input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/60">Gender</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className={inputClass}>
                  <option value="" className="bg-gray-900">Select gender</option>
                  <option value="male" className="bg-gray-900">Male</option>
                  <option value="female" className="bg-gray-900">Female</option>
                  <option value="other" className="bg-gray-900">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/60">Address</label>
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} className={inputClass} placeholder="Your address" />
            </div>
          </div>

          {/* Medical Info */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-6 space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-white/40">Medical Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/60">Blood Group</label>
                <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })} className={inputClass}>
                  <option value="" className="bg-gray-900">Select blood group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg} className="bg-gray-900">{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/60">Emergency Contact</label>
                <input type="tel" value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} className={inputClass} placeholder="+91 98765 43210" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 font-medium text-white disabled:opacity-50 hover:opacity-95 transition-opacity">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </main>
    </div>
  )
}
