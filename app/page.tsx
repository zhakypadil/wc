import { Suspense } from 'react'
import { connection } from 'next/server'
import { cacheLife, cacheTag } from 'next/cache'
import { getLeaderboard, getLiveResults } from '@/lib/data'
import LeaderboardTable from '@/components/LeaderboardTable'

const CROWD_IMAGES = ['/images/crowd.jpg', '/images/crowd2.jpg']

async function CachedLeaderboard({ heroImage }: { heroImage: string }) {
  'use cache'
  cacheTag('leaderboard')
  cacheLife({ revalidate: 60 })

  const [entries, results] = await Promise.all([
    getLeaderboard(),
    getLiveResults(),
  ])

  return (
    <LeaderboardTable
      entries={entries}
      lastUpdated={results.lastUpdated}
      source={results.source}
      heroImage={heroImage}
    />
  )
}

async function LiveLeaderboard() {
  await connection()
  const heroImage = CROWD_IMAGES[Math.floor(Math.random() * CROWD_IMAGES.length)]
  return <CachedLeaderboard heroImage={heroImage} />
}

function LeaderboardSkeleton() {
  return (
    <div style={{ background: '#F6F1E5', minHeight: '100vh' }}>
      {/* Hero skeleton */}
      <div style={{ minHeight: '84vh', background: 'linear-gradient(180deg, #0B1428 0%, #1A2B4A 50%, #0B1428 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(40px,6vw,76px) clamp(20px,5vw,64px)' }}>
        <div style={{ width: 220, height: 20, borderRadius: 8, background: 'rgba(255,255,255,.12)', marginBottom: 16, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '60%', height: 80, borderRadius: 12, background: 'rgba(255,255,255,.1)', marginBottom: 24, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ width: 110, height: 46, borderRadius: 14, background: 'rgba(255,255,255,.08)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />)}
        </div>
      </div>
      {/* Standings skeleton */}
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(44px,6vw,84px) clamp(20px,5vw,40px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 48 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 240, borderRadius: 20, background: '#EAE3D3', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />)}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: 72, borderRadius: 14, background: '#EAE3D3', marginBottom: 4, animation: 'skeletonPulse 1.5s ease-in-out infinite', opacity: 1 - i * 0.07 }} />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <main>
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LiveLeaderboard />
      </Suspense>
    </main>
  )
}
