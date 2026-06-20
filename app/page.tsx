import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { getLeaderboard, getLiveResults } from '@/lib/data'
import LeaderboardTable from '@/components/LeaderboardTable'

async function LiveLeaderboard() {
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
    />
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-white/5" />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-wc-dark text-white">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-wc-green/40 via-wc-dark to-wc-dark pt-10 pb-8 px-4">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-wc-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-wc-green/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-2">🏆</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            World Cup 2026
          </h1>
          <p className="text-wc-gold font-bold text-lg mt-1">Prediction Leaderboard</p>
          <p className="text-white/40 text-sm mt-2">
            Live standings among friends · Auto-updates every minute
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Suspense fallback={<LeaderboardSkeleton />}>
          <LiveLeaderboard />
        </Suspense>
      </div>
    </main>
  )
}
