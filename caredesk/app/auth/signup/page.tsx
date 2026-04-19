'use client'
import { useState, Suspense } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const SplineScene = dynamic(() => import('@/components/spline-scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
    </div>
  ),
})

const LOGIN_SPLINE_SCENE = 'https://prod.spline.design/FEO7STPcAK7qaow6/scene.splinecode'

function SignupForm() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'patient', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.fullName, full_name: form.fullName, role: form.role, user_role: form.role, phone: form.phone, phone_number: form.phone },
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(() => router.push('/auth/login'), 3000)
  }

  if (success) return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] px-4">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-12 w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
          <span className="text-3xl text-teal-400">✓</span>
        </div>
        <h2 className="mb-3 text-xl font-bold text-white">Check your email</h2>
        <p className="text-sm text-gray-400">We sent a confirmation to <strong className="text-white/80">{form.email}</strong>. Click the link to activate your account.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] font-sans tracking-tight">
      <div className="hidden lg:flex items-center justify-center relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(13,148,136,0.15)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 mix-blend-screen">
          <SplineScene scene={LOGIN_SPLINE_SCENE} className="w-full h-full" />
        </div>
      </div>
      <div className="flex items-center justify-center p-6 overflow-y-auto">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] rounded-2xl p-8 sm:p-12 w-full max-w-md my-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <span className="text-black font-bold text-lg leading-none">C</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">CareDesk</span>
          </div>
          <p className="text-xs text-white/30 tracking-widest uppercase mb-8">Clinic Management</p>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Request Access</h1>
          <p className="text-sm text-gray-400 mb-8">Register your clinical credentials.</p>
          {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
          <form onSubmit={handleSignup}>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Full Name</label>
            <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required placeholder="Dr. Ramesh Kumar"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 mb-4" />
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@example.com"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 mb-4" />
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 mb-4" />
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Select Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 mb-4">
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} placeholder="Min 8 characters"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 mb-4" />
            <button type="submit" disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg px-4 py-3 mt-2 transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <span className="text-sm text-gray-400 text-center mt-6 block">
            Already have access?{' '}
            <Link href="/auth/login" className="text-teal-500 hover:text-teal-400 transition-colors">Sign In</Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050505]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /></div>}>
      <SignupForm />
    </Suspense>
  )
}
