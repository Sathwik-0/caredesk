'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, UserCheck, Users, FileText, LogOut } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/doctors', label: 'Doctors', icon: UserCheck },
  { href: '/admin/patients', label: 'Patients', icon: Users },
  { href: '/admin/invoices', label: 'Invoices', icon: FileText },
] as const

export function AdminSidebar({ userName, onLogout }: { userName?: string | null; onLogout: () => void }) {
  const pathname = usePathname()
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-[#111111]">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow-[0_0_12px_rgba(20,184,166,0.4)]">
          <span className="text-sm font-bold text-black">C</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">CareDesk</span>
      </div>
      <nav className="mt-2 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? 'border border-teal-500/20 bg-teal-500/10 text-teal-400' : 'text-white/50 hover:bg-white/[0.05] hover:text-white'}`}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-sm font-medium text-teal-400">
            {(userName || 'A').charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{userName || 'Admin'}</p>
            <p className="text-xs text-white/40">Administrator</p>
            <button type="button" onClick={onLogout} className="mt-1 flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
