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

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  async function withTimeout<T>(promise: any, ms = 15000): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | null = null
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Request timed out. Please try again.')), ms)
    })
    try { return await Promise.race([Promise.resolve(promise), timeout]) }
    finally { if (timer) clearTimeout(timer) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const signInResult: any = await withTimeout(supabase.auth.signInWithPassword({ email, password }))
      const { data, error } = signInResult
      if (error) { setError(error.message); return }
      const profileResult: any = await withTimeout(supabase.from('profiles').select('role').eq('id', data.user.id).single())
      const { data: profile, error: profileError } = profileResult
      if (profile?.role === 'admin') router.push('/admin')
      else if (profile?.role === 'doctor') router.push('/doctor')
      else if (profile?.role === 'patient') router.push('/patient')
      else {
        const metaRole = data.user?.user_metadata?.role as string | undefined
        if (metaRole === 'admin') router.push('/admin')
        else if (metaRole === 'doctor') router.push('/doctor')
        else if (metaRole === 'patient') router.push('/patient')
        else if (profileError) setError(`Login succeeded but profile lookup failed: ${profileError.message}`)
        else router.push('/patient')
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected login error. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] font-sans tracking-tight">
      <div className="hidden lg:flex items-center justify-center relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(13,148,136,0.15)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 mix-blend-screen">
          <SplineScene scene={LOGIN_SPLINE_SCENE} className="w-full h-full" />
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),0_0_0_1px_rgba(20,184,166,0.05)] rounded-2xl p-8 sm:p-12 w-full max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <span className="text-black font-bold text-lg leading-none">C</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">CareDesk</span>
          </div>
          <p className="text-xs text-white/30 tracking-widest uppercase mb-8">Clinic Management</p>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-400 mb-8">Sign in to your dashboard</p>
          {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
          <form onSubmit={handleLogin}>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 mb-4" />
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 mb-4" />
            <button type="submit" disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg px-4 py-3 mt-2 transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-4">
            <Link href="/auth/reset-password" className="hover:text-teal-400 transition-colors">Forgot Password?</Link>
          </p>
          <span className="text-sm text-gray-400 text-center mt-4 block">
            No account?{' '}
            <Link href="/auth/signup" className="text-teal-500 hover:text-teal-400 transition-colors">Request Access</Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050505]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
