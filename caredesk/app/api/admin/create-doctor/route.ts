import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() {},
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role ?? user.user_metadata?.role
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { email, password, full_name, specialization, qualification, consultation_fee, phone, available_from, available_to } = await req.json()

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name, role: 'doctor', phone }
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    // Get clinic id for this admin
    const { data: clinic } = await supabaseAdmin.from('clinics').select('id').limit(1).single()

    const { data: doctor, error: docError } = await supabaseAdmin.from('doctors').insert({
      profile_id: authUser.user.id,
      clinic_id: clinic?.id,
      specialization,
      qualification: qualification || null,
      consultation_fee: Number(consultation_fee) || 300,
      available_from: available_from || '09:00',
      available_to: available_to || '18:00',
    }).select().single()

    if (docError) return NextResponse.json({ error: docError.message }, { status: 400 })
    return NextResponse.json({ doctor })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
