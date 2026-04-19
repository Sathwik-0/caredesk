import type { Metadata } from 'next'
import './globals.css'
import { AppToaster } from '@/components/app-toaster'

export const metadata: Metadata = {
  title: 'CareDesk — Clinic Management',
  description: 'Modern clinic management for Indian clinics',
  icons: { icon: '/favicon.svg' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  )
}
