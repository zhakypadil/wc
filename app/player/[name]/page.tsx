import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'
import { getPlayerScore } from '@/lib/data'
import PlayerBreakdown from '@/components/PlayerBreakdown'

interface Props {
  params: Promise<{ name: string }>
}

// ── Cached per-player data ────────────────────────────────────────────────────
async function CachedPlayerBreakdown({ name }: { name: string }) {
  'use cache'
  cacheTag('leaderboard', `player:${name}`)
  cacheLife({ revalidate: 60 })

  const score = await getPlayerScore(name)
  if (!score) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">🤷</div>
        <p className="text-white/60">
          Player <strong>{name}</strong> not found.
        </p>
        <Link href="/" className="mt-4 inline-block text-wc-gold hover:underline text-sm">
          Back to leaderboard
        </Link>
      </div>
    )
  }
  return <PlayerBreakdown score={score} />
}

// ── Runtime wrapper (accesses params → lives inside Suspense) ─────────────────
async function PlayerPageContent({ params }: Props) {
  const { name } = await params
  const displayName = decodeURIComponent(name)

  return (
    <>
      <div className="mb-6 px-4 pt-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black">{displayName}</h1>
        <p className="text-white/40 text-sm mt-1">Prediction breakdown</p>
      </div>
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <CachedPlayerBreakdown name={displayName} />
      </div>
    </>
  )
}

// ── Page shell (fully static) ─────────────────────────────────────────────────
export default function PlayerPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-wc-dark text-white">
      {/* Static header */}
      <div className="bg-gradient-to-b from-wc-green/30 to-wc-dark pt-8 pb-4 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors"
          >
            ← Leaderboard
          </Link>
        </div>
      </div>

      {/* Dynamic content inside Suspense */}
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-4 animate-pulse">
            <div className="h-8 w-40 rounded-lg bg-white/10" />
            <div className="h-4 w-24 rounded-lg bg-white/5" />
            <div className="h-28 rounded-xl bg-white/5" />
            <div className="h-64 rounded-xl bg-white/5" />
          </div>
        }
      >
        <PlayerPageContent params={params} />
      </Suspense>
    </main>
  )
}
