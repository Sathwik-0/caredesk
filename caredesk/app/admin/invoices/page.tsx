'use client'
import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { toast } from 'sonner'

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setLoading(true)
      let q = supabase.from('invoices')
        .select('*, patients(profiles(full_name, phone)), appointments(appointment_date, appointment_time, doctors(profiles(full_name), specialization))')
        .order('created_at', { ascending: false })
      if (filter !== 'all') q = q.eq('status', filter)
      const { data } = await q
      setInvoices(data || [])
      setLoading(false)
    }
    load()
  }, [filter])

  const markPaid = async (id: string, method: string) => {
    const { error } = await supabase.from('invoices').update({
      status: 'paid', payment_method: method, paid_at: new Date().toISOString()
    }).eq('id', id)
    if (error) { toast.error('Failed to update invoice'); return }
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'paid', payment_method: method } : inv))
    toast.success('Invoice marked as paid')
  }

  const markCancelled = async (id: string) => {
    await supabase.from('invoices').update({ status: 'cancelled' }).eq('id', id)
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'cancelled' } : inv))
    toast.success('Invoice cancelled')
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }
  const statusBadge = (s: string) => ({
    paid: 'border border-teal-500/20 bg-teal-500/10 text-teal-400',
    pending: 'border border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
    cancelled: 'border border-red-500/20 bg-red-500/10 text-red-400',
  }[s] || 'border border-white/10 bg-white/5 text-white/50')

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0)

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans tracking-tight">
      <AdminSidebar onLogout={logout} />
      <main className="ml-64 min-h-screen p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Invoices</h1>
          <div className="flex flex-wrap gap-2">
            {['all','pending','paid','cancelled'].map(f => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? 'border border-teal-500/20 bg-teal-500/10 text-teal-400' : 'border border-white/[0.08] bg-white/[0.05] text-white/60 hover:bg-white/[0.08]'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4">
            <p className="text-xs font-medium uppercase tracking-widest text-teal-400/70 mb-1">Total Collected</p>
            <p className="text-3xl font-bold text-teal-400">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="text-xs font-medium uppercase tracking-widest text-yellow-400/70 mb-1">Pending Collection</p>
            <p className="text-3xl font-bold text-yellow-400">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>
        {loading ? <div className="py-20 text-center text-white/40">Loading...</div> : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111111]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {['Date','Patient','Doctor','Amount','Method','Status','Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-white/40">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-white/[0.04] text-sm text-white/80 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white/60">{inv.appointments?.appointment_date}</td>
                    <td className="px-4 py-3 font-medium">{inv.patients?.profiles?.full_name}</td>
                    <td className="px-4 py-3 text-white/60">Dr. {inv.appointments?.doctors?.profiles?.full_name}</td>
                    <td className="px-4 py-3 font-semibold text-white">₹{Number(inv.amount).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 capitalize text-white/50">{inv.payment_method || '—'}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(inv.status)}`}>{inv.status}</span></td>
                    <td className="px-4 py-3">
                      {inv.status === 'pending' && (
                        <div className="flex gap-1 flex-wrap">
                          {['cash','upi','card'].map(method => (
                            <button key={method} type="button" onClick={() => markPaid(inv.id, method)}
                              className="rounded-lg bg-teal-500/10 border border-teal-500/20 px-2 py-1 text-xs text-teal-400 hover:bg-teal-500/20 capitalize transition-colors">
                              {method}
                            </button>
                          ))}
                          <button type="button" onClick={() => markCancelled(inv.id)}
                            className="rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 transition-colors">
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && <div className="py-12 text-center text-sm text-white/40">No invoices found</div>}
          </div>
        )}
      </main>
    </div>
  )
}
