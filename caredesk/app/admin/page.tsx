'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminSidebar } from '@/components/admin-sidebar'
import { Calendar, Users, UserCheck, IndianRupee, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ appointments: 0, patients: 0, doctors: 0, revenue: 0, pending: 0 })
  const [todayAppts, setTodayAppts] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/auth/login'); return }
      setUser(profile)
      const today = new Date().toISOString().split('T')[0]
      const [appts, patients, doctors, invoices, todayList] = await Promise.all([
        supabase.from('appointments').select('id', { count: 'exact' }),
        supabase.from('patients').select('id', { count: 'exact' }),
        supabase.from('doctors').select('id', { count: 'exact' }),
        supabase.from('invoices').select('amount, status'),
        supabase.from('appointments').select('*, patients(profiles(full_name)), doctors(profiles(full_name), specialization)').eq('appointment_date', today).order('appointment_time')
      ])
      const paidRevenue = invoices.data?.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0) || 0
      const pendingRevenue = invoices.data?.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0) || 0
      setStats({ appointments: appts.count || 0, patients: patients.count || 0, doctors: doctors.count || 0, revenue: paidRevenue, pending: pendingRevenue })
      setTodayAppts(todayList.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const statusBadge = (s: string) => ({ scheduled: 'border border-blue-500/20 bg-blue-500/10 text-blue-400', confirmed: 'border border-purple-500/20 bg-purple-500/10 text-purple-400', completed: 'border border-teal-500/20 bg-teal-500/10 text-teal-400', cancelled: 'border border-red-500/20 bg-red-500/10 text-red-400', no_show: 'border border-white/10 bg-white/5 text-white/50' }[s] || 'border border-white/10 bg-white/5 text-white/50')

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="text-center"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /><p className="text-sm text-white/50">Loading...</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <AdminSidebar userName={user?.full_name} onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Good morning 👋</h1>
          <p className="mt-1 text-sm text-white/40">Here&apos;s what&apos;s happening at your clinic today</p>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: 'Appointments', value: stats.appointments, icon: Calendar },
            { label: 'Patients', value: stats.patients, icon: Users },
            { label: 'Doctors', value: stats.doctors, icon: UserCheck },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee },
            { label: 'Pending', value: `₹${stats.pending.toLocaleString('en-IN')}`, icon: Clock },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-[#111111] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12]">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">{s.label}</p>
              <div className="flex items-start justify-between gap-2">
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-400"><s.icon className="h-5 w-5" /></div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#111111] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-white/40">Today&apos;s Appointments</h2>
            <Link href="/admin/appointments" className="text-sm text-teal-400 hover:text-teal-300">View all</Link>
          </div>
          {todayAppts.length === 0 ? (
            <div className="py-12 text-center text-white/30"><p className="mb-3 text-4xl">📅</p><p className="text-sm">No appointments today</p></div>
          ) : (
            <div className="space-y-2">
              {todayAppts.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="rounded-lg bg-white/5 px-2 py-1 font-mono text-xs text-white/60">{a.appointment_time?.slice(0, 5)}</span>
                    <div>
                      <p className="text-sm font-medium text-white/90">{a.patients?.profiles?.full_name}</p>
                      <p className="text-xs text-white/40">Dr. {a.doctors?.profiles?.full_name} · {a.doctors?.specialization}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(a.status)}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
