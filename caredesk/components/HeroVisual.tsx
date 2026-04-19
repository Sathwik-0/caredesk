'use client'
import dynamic from 'next/dynamic'

const LANDING_SCENE = 'https://prod.spline.design/FnUG9GYKOEzkzfVN/scene.splinecode'

const SplineScene = dynamic(() => import('./spline-scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-teal-500 animate-pulse">
      LOADING...
    </div>
  ),
})

export default function HeroVisual() {
  const scene = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL || LANDING_SCENE
  return (
    <div className="relative flex h-[500px] w-full items-center justify-center lg:h-[700px]">
      <div className="relative h-full w-full mix-blend-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(13,148,136,0.15)_0%,transparent_70%)] blur-2xl pointer-events-none -z-10" />
        <SplineScene scene={scene} className="h-full w-full" />
      </div>
    </div>
  )
}
