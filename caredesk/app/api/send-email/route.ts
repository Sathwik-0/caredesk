import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-admin'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, patientId, doctorId, date, time } = body

    if (type === 'appointment_confirmation') {
      const [patientRes, doctorRes] = await Promise.all([
        supabaseAdmin.from('patients').select('profiles(full_name, email)').eq('id', patientId).single(),
        supabaseAdmin.from('doctors').select('profiles(full_name), specialization, consultation_fee').eq('id', doctorId).single()
      ])
      const patient = patientRes.data as any
      const doctor = doctorRes.data as any
      const patientEmail = patient?.profiles?.email
      if (!patientEmail) return NextResponse.json({ error: 'No email found' }, { status: 400 })

      await resend.emails.send({
        from: FROM,
        to: patientEmail,
        subject: 'Appointment Confirmed — CareDesk',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0a0a0a">
            <div style="background:linear-gradient(135deg,#0d9488,#2563eb);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px">
              <h1 style="color:white;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.03em">CareDesk</h1>
              <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase">Clinic Management</p>
            </div>
            <h2 style="color:#f9fafb;margin-bottom:8px;font-size:20px">Appointment Confirmed ✅</h2>
            <p style="color:#9ca3af;margin-bottom:24px">Hello ${patient?.profiles?.full_name},<br>Your appointment has been successfully booked.</p>
            <div style="background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="color:#6b7280;padding:8px 0;font-size:14px;width:140px">Doctor</td><td style="color:#f9fafb;font-weight:600;font-size:14px">Dr. ${doctor?.profiles?.full_name}</td></tr>
                <tr><td style="color:#6b7280;padding:8px 0;font-size:14px">Specialization</td><td style="color:#d1d5db;font-size:14px">${doctor?.specialization}</td></tr>
                <tr><td style="color:#6b7280;padding:8px 0;font-size:14px">Date</td><td style="color:#d1d5db;font-size:14px">${date}</td></tr>
                <tr><td style="color:#6b7280;padding:8px 0;font-size:14px">Time</td><td style="color:#d1d5db;font-size:14px">${time}</td></tr>
                <tr><td style="color:#6b7280;padding:8px 0;font-size:14px">Fee</td><td style="color:#0d9488;font-weight:600;font-size:14px">₹${doctor?.consultation_fee}</td></tr>
              </table>
            </div>
            <p style="color:#6b7280;font-size:14px">Please arrive 10 minutes early. To cancel, login to CareDesk.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0">
            <p style="color:#4b5563;font-size:12px;text-align:center">CareDesk — Modern clinic management for India</p>
          </div>
        `
      })
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
