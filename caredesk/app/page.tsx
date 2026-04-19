'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import HeroVisual from '@/components/HeroVisual'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

const features = [
  { icon: '📅', title: 'Appointments', desc: 'Patients book online. You see the full schedule. Automatic email reminders sent.' },
  { icon: '💊', title: 'Prescriptions', desc: 'Doctors write prescriptions digitally. Patients access their full history anytime.' },
  { icon: '₹', title: 'Billing', desc: 'Generate invoices in seconds. Track paid and pending payments. Daily reports.' },
]

const roles = [
  { role: 'Admin / Owner', points: ['Full dashboard & reports', 'Manage doctors & staff', 'Control billing & invoices', 'View all appointments'] },
  { role: 'Doctor', points: ["See today's schedule", 'Access patient history', 'Write prescriptions', 'Add visit notes'] },
  { role: 'Patient', points: ['Book appointments online', 'Get email reminders', 'View prescriptions', 'Track invoices'] },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]">
      <nav className="relative z-20 border-b border-white/[0.06] bg-[#050505]/80 px-6 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
              <span className="text-sm font-bold text-black">C</span>
            </div>
            <span className="font-heading text-xl text-white">CareDesk</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Login</Link>
            <Link href="/auth/signup" className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-teal-500/15">Get Started</Link>
          </div>
        </div>
      </nav>

      <motion.section variants={container} initial="hidden" animate="show"
        className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:pb-24 lg:pt-14">
        <motion.div variants={item} className="order-2 flex flex-col justify-center lg:order-1 lg:max-w-xl lg:pr-4">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-medium tracking-widest text-teal-400">
            <span>[</span><span>CLINIC MANAGEMENT</span><span>]</span>
          </div>
          <h1 className="font-heading text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Run your clinic.<br />Not your{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">paperwork.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-white/55 sm:text-lg">
            Appointments, prescriptions, billing and patient records — all in one place. Replace WhatsApp and registers with something that actually works.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/auth/signup" className="rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-teal-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]">Start Free</Link>
            <Link href="/auth/login" className="rounded-xl border border-white/10 bg-white/[0.03] px-8 py-3 text-base font-medium text-white/80 backdrop-blur-sm hover:bg-white/[0.06] transition-colors">Login</Link>
          </div>
        </motion.div>
        <motion.div variants={item} className="relative order-1 min-h-[420px] lg:order-2 lg:min-h-[700px]">
          <HeroVisual />
        </motion.div>
      </motion.section>

      <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
        className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
        <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-6">
          {features.map((f) => (
            <motion.article key={f.title} variants={item}
              className="group rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08] hover:border-teal-500/30 hover:bg-white/[0.04] transition-all duration-300 p-6 md:col-span-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/15 text-2xl ring-1 ring-teal-500/20">{f.icon}</div>
              <h3 className="font-heading mb-2 text-lg text-white">{f.title}</h3>
              <p className="text-sm text-white/50">{f.desc}</p>
            </motion.article>
          ))}
          <motion.div variants={item} className="rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08] hover:border-teal-500/30 hover:bg-white/[0.04] transition-all duration-300 p-6 md:col-span-6">
            <h2 className="font-heading mb-6 text-center text-xl text-white sm:text-2xl md:text-left">Works for everyone in your clinic</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {roles.map((r) => (
                <div key={r.role} className="rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-teal-500/30 transition-all duration-300 p-5">
                  <h3 className="font-heading mb-4 text-base text-white">{r.role}</h3>
                  <ul className="space-y-2.5">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-white/55">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-[10px] text-teal-400 ring-1 ring-teal-500/25">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="relative z-10 border-t border-white/[0.06] py-8 text-center text-sm text-white/35">
        CareDesk — Made for clinics in India
      </motion.footer>
    </div>
  )
}
