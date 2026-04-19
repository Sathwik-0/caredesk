'use client'
import { Toaster } from 'sonner'

export function AppToaster() {
  return (
    <Toaster theme="dark" position="top-center" closeButton
      toastOptions={{
        classNames: {
          toast: '!bg-[#111111] !border !border-white/[0.1] !text-white !shadow-2xl !backdrop-blur-xl',
          title: '!text-white !font-semibold !tracking-tight',
          description: '!text-white/55',
          error: '!border !border-red-500/30 !bg-[#140808] [&_[data-icon]]:!text-red-400',
          success: '!border !border-teal-500/35 !bg-[#061a18] [&_[data-icon]]:!text-teal-400',
        },
      }}
    />
  )
}
