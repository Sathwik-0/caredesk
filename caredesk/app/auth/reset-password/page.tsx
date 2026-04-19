'use client'
import { useState, Suspense } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import Link from 'next/link'

function ResetForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createSupabaseBrowser()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ''
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/update-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] px-4">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 sm:p-12 w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center"><span className="text-black font-bold text-lg">C</span></div>
          <span className="text-2xl font-bold tracking-tighter text-white">CareDesk</span>
        </div>
        <p className="text-xs text-white/30 tracking-widest uppercase mb-8">Clinic Management</p>
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20"><span className="text-3xl text-teal-400">✉</span></div>
            <h2 className="text-xl font-bold text-white mb-3">Check your email</h2>
            <p className="text-sm text-gray-400 mb-6">Reset link sent to <strong className="text-white/80">{email}</strong></p>
            <Link href="/auth/login" className="text-sm text-teal-500 hover:text-teal-400">← Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reset Password</h1>
            <p className="text-sm text-gray-400 mb-8">Enter your email and we will send a reset link.</p>
            {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
            <form onSubmit={handleReset}>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 mb-4" />
              <button type="submit" disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg px-4 py-3 mt-2 transition-all duration-300 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <span className="text-sm text-gray-400 text-center mt-6 block">
              <Link href="/auth/login" className="text-teal-500 hover:text-teal-400">← Back to Sign In</Link>
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050505]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /></div>}>
      <ResetForm />
    </Suspense>
  )
}
