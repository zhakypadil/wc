import Link from 'next/link'
import type { LeaderboardEntry } from '@/lib/types'

const MEDAL = ['🥇', '🥈', '🥉']

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-wc-gold to-yellow-300 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function LeaderboardTable({
  entries,
  lastUpdated,
  source,
}: {
  entries: LeaderboardEntry[]
  lastUpdated: string
  source: string
}) {
  const maxPts = entries[0]?.score.totalPoints ?? 1

  return (
    <div className="w-full">
      {/* Header meta */}
      <div className="flex items-center justify-between mb-4 text-xs text-white/50">
        <span>
          {entries.length} player{entries.length !== 1 ? 's' : ''}
        </span>
        <span>
          Last updated:{' '}
          {new Date(lastUpdated).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {source !== 'empty' && (
            <span className="ml-1 opacity-60">· {source}</span>
          )}
        </span>
      </div>

      {/* Podium cards for top 3 */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {entries.slice(0, 3).map(({ rank, score }) => (
            <Link
              key={score.name}
              href={`/player/${encodeURIComponent(score.name)}`}
              className={`
                relative rounded-2xl p-4 text-center transition-transform hover:scale-105
                ${rank === 1 ? 'bg-gradient-to-b from-yellow-400/30 to-yellow-600/10 ring-1 ring-yellow-400/40' : ''}
                ${rank === 2 ? 'bg-gradient-to-b from-gray-300/20 to-gray-400/10 ring-1 ring-gray-400/30' : ''}
                ${rank === 3 ? 'bg-gradient-to-b from-amber-600/20 to-amber-700/10 ring-1 ring-amber-600/30' : ''}
              `}
            >
              <div className="text-3xl mb-1">{MEDAL[rank - 1]}</div>
              <div className="font-bold text-white text-sm truncate">{score.name}</div>
              <div className="text-2xl font-black text-wc-gold mt-1">{score.totalPoints}</div>
              <div className="text-xs text-white/50">pts</div>
            </Link>
          ))}
        </div>
      )}

      {/* Full table */}
      <div className="space-y-2">
        {entries.map(({ rank, score }) => {
          const medal = rank <= 3 ? MEDAL[rank - 1] : null
          return (
            <Link
              key={score.name}
              href={`/player/${encodeURIComponent(score.name)}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
            >
              {/* Rank */}
              <span className="w-6 shrink-0 text-center font-mono text-sm text-white/60">
                {medal ?? rank}
              </span>

              {/* Name */}
              <span className="flex-1 font-semibold text-white group-hover:text-wc-gold transition-colors truncate">
                {score.name}
              </span>

              {/* Breakdown chips */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                  G {score.groupPoints}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  K {score.knockoutPoints}
                </span>
                {score.finalBonusPoints > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">
                    +8
                  </span>
                )}
              </div>

              {/* Total */}
              <span className="shrink-0 font-black text-lg text-wc-gold w-14 text-right">
                {score.totalPoints}
              </span>

              {/* Progress bar */}
              <div className="hidden sm:block w-24 shrink-0">
                <ProgressBar value={score.totalPoints} max={maxPts} />
              </div>
            </Link>
          )
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <div className="text-5xl mb-3">📂</div>
          <p className="text-sm">
            No prediction files found in <code>data/predictions/</code>
          </p>
          <p className="text-xs mt-1">
            Drop player Excel files there to get started.
          </p>
        </div>
      )}
    </div>
  )
}
