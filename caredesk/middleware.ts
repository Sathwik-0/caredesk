import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = pathname.startsWith('/auth')
  const isAdminRoute = pathname.startsWith('/admin')
  const isDoctorRoute = pathname.startsWith('/doctor')
  const isPatientRoute = pathname.startsWith('/patient')
  const isApiAdminRoute = pathname.startsWith('/api/admin')
  const isProtected = isAdminRoute || isDoctorRoute || isPatientRoute || isApiAdminRoute

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user && isProtected) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role ?? user.user_metadata?.role

    if (isAdminRoute && role !== 'admin') return NextResponse.redirect(new URL('/auth/login', request.url))
    if (isDoctorRoute && role !== 'doctor') return NextResponse.redirect(new URL('/auth/login', request.url))
    if (isPatientRoute && role !== 'patient') return NextResponse.redirect(new URL('/auth/login', request.url))
    if (isApiAdminRoute && role !== 'admin') return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  }

  if (user && isAuthRoute) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role ?? user.user_metadata?.role
    const dest = role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/patient'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
