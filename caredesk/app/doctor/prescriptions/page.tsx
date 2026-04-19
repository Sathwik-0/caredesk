'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { DoctorSidebar } from '@/components/doctor-sidebar'

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setUser(profile)
      const { data: doc } = await supabase.from('doctors').select('id').eq('profile_id', user.id).single()
      if (!doc) return
      const { data } = await supabase.from('prescriptions')
        .select('*, patients(profiles(full_name)), appointments(appointment_date)')
        .eq('doctor_id', doc.id).order('created_at', { ascending: false })
      setPrescriptions(data || [])
    }
    load()
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <DoctorSidebar userName={user?.full_name} onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">Prescriptions</h1>
        <p className="mb-6 text-xs font-medium uppercase tracking-widest text-white/40">History</p>
        <div className="space-y-4">
          {prescriptions.map(p => (
            <div key={p.id} className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{p.patients?.profiles?.full_name}</p>
                  <p className="text-xs text-white/40">{p.appointments?.appointment_date} · {p.diagnosis}</p>
                </div>
              </div>
              {p.medicines?.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/40">Medicines</p>
                  <div className="space-y-2">
                    {p.medicines.map((m: any, i: number) => (
                      <div key={i} className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-white/80">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-white/40">{m.dosage}</span>
                        <span className="text-white/40">{m.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {p.instructions && <p className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-200/80">📝 {p.instructions}</p>}
              {p.follow_up_date && <p className="mt-2 text-xs text-white/40">Follow-up: {p.follow_up_date}</p>}
            </div>
          ))}
          {prescriptions.length === 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-[#111111] py-16 text-center text-white/40">
              <p className="mb-2 text-3xl">💊</p><p className="text-sm">No prescriptions yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
