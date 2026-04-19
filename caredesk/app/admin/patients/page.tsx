'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminPatients() {
  const [patients, setPatients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('patients').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false })
      setPatients(data || [])
    }
    load()
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const filtered = patients.filter(p =>
    p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <AdminSidebar onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Patients ({patients.length})</h1>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-64 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111111]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['Name','Email','Phone','Gender','Blood Group','Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-white/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-white/[0.04] text-sm text-white/80 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-medium text-white/90">{p.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-white/50">{p.profiles?.email}</td>
                  <td className="px-4 py-3 text-white/50">{p.profiles?.phone || '—'}</td>
                  <td className="px-4 py-3 capitalize text-white/50">{p.gender || '—'}</td>
                  <td className="px-4 py-3 text-white/50">{p.blood_group || '—'}</td>
                  <td className="px-4 py-3 text-white/30">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-white/40">No patients found</div>}
        </div>
      </main>
    </div>
  )
}
