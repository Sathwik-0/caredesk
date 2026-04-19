'use client'
import { useState, Suspense } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function UpdateForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] px-4">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 sm:p-12 w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center"><span className="text-black font-bold text-lg">C</span></div>
          <span className="text-2xl font-bold tracking-tighter text-white">CareDesk</span>
        </div>
        <p className="text-xs text-white/30 tracking-widest uppercase mb-8">Clinic Management</p>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">New Password</h1>
        <p className="text-sm text-gray-400 mb-8">Enter your new password below.</p>
        {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleUpdate}>
          <label className="text-sm font-medium text-gray-300 mb-1.5 block">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Min 8 characters"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 mb-4" />
          <label className="text-sm font-medium text-gray-300 mb-1.5 block">Confirm Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8} placeholder="Repeat password"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 mb-4" />
          <button type="submit" disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg px-4 py-3 mt-2 transition-all duration-300 disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050505]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /></div>}>
      <UpdateForm />
    </Suspense>
  )
}
