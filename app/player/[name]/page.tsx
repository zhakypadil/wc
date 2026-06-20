import { Suspense } from 'react'
import { connection } from 'next/server'
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'
import { getLeaderboard } from '@/lib/data'
import PlayerBreakdown from '@/components/PlayerBreakdown'

interface Props {
  params: Promise<{ name: string }>
}

const FAN_IMAGES = ['/images/fan.jpg', '/images/fan2.jpg']

async function CachedPlayerBreakdown({ name, fanImage }: { name: string; fanImage: string }) {
  'use cache'
  cacheTag('leaderboard', `player:${name}`)
  cacheLife({ revalidate: 60 })

  const entries = await getLeaderboard()
  const entry = entries.find(e => e.score.name.toLowerCase() === name.toLowerCase())

  if (!entry) {
    return (
      <div style={{ minHeight: '100vh', background: '#F6F1E5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: "'Archivo', sans-serif" }}>
        <div style={{ fontSize: 64 }}>🤷</div>
        <p style={{ color: '#6B7482', fontSize: 16 }}>Player <strong style={{ color: '#101826' }}>{name}</strong> not found.</p>
        <Link href="/" style={{ color: '#E5197B', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>← Back to leaderboard</Link>
      </div>
    )
  }

  return <PlayerBreakdown score={entry.score} rank={entry.rank} fanImage={fanImage} />
}

async function PlayerPageContent({ params }: Props) {
  await connection()
  const fanImage = FAN_IMAGES[Math.floor(Math.random() * FAN_IMAGES.length)]
  const { name } = await params
  const displayName = decodeURIComponent(name)
  return <CachedPlayerBreakdown name={displayName} fanImage={fanImage} />
}

function PlayerSkeleton() {
  return (
    <div style={{ background: '#F6F1E5', minHeight: '100vh' }}>
      {/* Header skeleton with fan image */}
      <div style={{ position: 'relative', minHeight: '42vh', overflow: 'hidden' }}>
        <img src="/images/fan.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', opacity: .7 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,18,38,.6) 0%, rgba(8,18,38,.85) 100%)' }} />
        <div style={{ position: 'relative', padding: '24px clamp(20px,5vw,48px)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>← Leaderboard</Link>
        </div>
      </div>
      {/* Content skeleton */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(28px,4vw,48px) clamp(20px,5vw,40px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 108, borderRadius: 18, background: '#EAE3D3', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
        <div style={{ height: 240, borderRadius: 18, background: '#EAE3D3', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

export default function PlayerPage({ params }: Props) {
  return (
    <Suspense fallback={<PlayerSkeleton />}>
      <PlayerPageContent params={params} />
    </Suspense>
  )
}
