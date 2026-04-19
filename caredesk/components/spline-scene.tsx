'use client'
// IMPORTANT: @splinetool/react-spline v4 requires '/next' export for Next.js
import Spline from '@splinetool/react-spline/next'

type Props = { scene: string; className?: string }

export default function SplineScene({ scene, className }: Props) {
  return <Spline scene={scene} className={className} style={{ width: '100%', height: '100%' }} />
}
