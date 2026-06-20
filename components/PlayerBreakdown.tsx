import type { PlayerScore, GroupMatchScore, KnockoutRoundScore } from '@/lib/types'

function ScorePill({ points, max }: { points: number; max: number }) {
  const bg =
    points === max
      ? 'bg-green-500/25 text-green-300'
      : points > 0
      ? 'bg-yellow-500/20 text-yellow-300'
      : 'bg-white/10 text-white/40'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${bg}`}>
      +{points}
    </span>
  )
}

function OutcomeBadge({ correct }: { correct: boolean }) {
  return (
    <span className={`text-xs ${correct ? 'text-green-400' : 'text-red-400/60'}`}>
      {correct ? '✓' : '✗'}
    </span>
  )
}

function GroupMatchRow({ m }: { m: GroupMatchScore }) {
  const pending = m.actualOutcome === null
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-2 px-3 text-xs text-white/50">{m.round}</td>
      <td className="py-2 px-3 text-sm">
        <span className={m.outcomeCorrect ? 'text-white' : 'text-white/70'}>
          {m.homeTeam}
        </span>
        <span className="text-white/40 mx-1">vs</span>
        <span className={m.outcomeCorrect ? 'text-white' : 'text-white/70'}>
          {m.awayTeam}
        </span>
      </td>
      <td className="py-2 px-3 text-sm font-mono text-center">
        <span className="text-white/70">{m.predictedOutcome}</span>
        <span className="text-white/40 mx-1">|</span>
        <span className="text-white/70">
          {m.predictedHomeGoals}–{m.predictedAwayGoals}
        </span>
      </td>
      <td className="py-2 px-3 text-sm font-mono text-center">
        {pending ? (
          <span className="text-white/30">–</span>
        ) : (
          <>
            <span
              className={
                m.outcomeCorrect ? 'text-green-300' : 'text-red-400/70'
              }
            >
              {m.actualOutcome}
            </span>
            <span className="text-white/40 mx-1">|</span>
            <span className="text-white/70">
              {m.actualHomeGoals}–{m.actualAwayGoals}
            </span>
          </>
        )}
      </td>
      <td className="py-2 px-3 text-center">
        {pending ? (
          <span className="text-white/30 text-xs">–</span>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <OutcomeBadge correct={m.outcomeCorrect} />
            {m.outcomeCorrect && (
              <OutcomeBadge correct={m.goalDiffCorrect} />
            )}
            {m.goalDiffCorrect && (
              <OutcomeBadge correct={m.exactScoreCorrect} />
            )}
            <ScorePill points={m.points} max={3} />
          </div>
        )}
      </td>
    </tr>
  )
}

function KnockoutRoundRow({ r }: { r: KnockoutRoundScore }) {
  if (!r.resolved && r.actual.length === 0) {
    return (
      <div className="py-3 px-4 flex items-center gap-3">
        <span className="text-white/30 text-sm flex-1">Not yet played</span>
        <span className="text-white/20 text-xs">+{r.pointsPerTeam}/team</span>
        <span className="text-white/30 font-bold w-10 text-right">–</span>
      </div>
    )
  }

  return (
    <div className="py-3 px-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1">
            {r.predicted.map(team => {
              const isCorrect = r.correct.some(
                c => c.toLowerCase() === team.toLowerCase()
              )
              return (
                <span
                  key={team}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    isCorrect
                      ? 'bg-green-500/20 text-green-300 line-through-none'
                      : r.resolved
                      ? 'bg-red-500/10 text-red-400/60 line-through'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {team}
                </span>
              )
            })}
          </div>
          {r.resolved && (
            <div className="mt-1 text-xs text-white/40">
              {r.correct.length}/{r.predicted.length} correct
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-white/40 mb-0.5">+{r.pointsPerTeam}/team</div>
          <div className={`font-black text-lg ${r.totalPoints > 0 ? 'text-wc-gold' : 'text-white/30'}`}>
            {r.resolved ? r.totalPoints : '–'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PlayerBreakdown({ score }: { score: PlayerScore }) {
  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Group Stage', pts: score.groupPoints, color: 'text-green-400' },
          { label: 'Knockout', pts: score.knockoutPoints, color: 'text-blue-400' },
          { label: 'Final Bonus', pts: score.finalBonusPoints, color: 'text-yellow-400' },
        ].map(({ label, pts, color }) => (
          <div
            key={label}
            className="bg-white/5 rounded-xl p-3 text-center"
          >
            <div className={`text-2xl font-black ${color}`}>{pts}</div>
            <div className="text-xs text-white/50 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Group stage */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-2 px-1">
          Group Stage
        </h2>
        <div className="bg-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-xs text-white/30 border-b border-white/10">
                  <th className="text-left py-2 px-3">Rnd</th>
                  <th className="text-left py-2 px-3">Match</th>
                  <th className="text-center py-2 px-3">Prediction</th>
                  <th className="text-center py-2 px-3">Result</th>
                  <th className="text-center py-2 px-3">Points</th>
                </tr>
              </thead>
              <tbody>
                {score.groupMatchScores.map((m) => (
                  <GroupMatchRow key={`${m.homeTeam}|${m.awayTeam}`} m={m} />
                ))}
              </tbody>
            </table>
          </div>
          {score.groupMatchScores.length === 0 && (
            <div className="py-8 text-center text-white/30 text-sm">
              No group stage predictions parsed
            </div>
          )}
        </div>
      </section>

      {/* Knockout rounds */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-2 px-1">
          Knockout Stage
        </h2>
        <div className="bg-white/5 rounded-xl divide-y divide-white/5">
          {score.knockoutScores.map(r => (
            <div key={r.round}>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-white/60 uppercase tracking-wider">
                {r.round === 'roundOf32' && 'Round of 32 · +3/team'}
                {r.round === 'roundOf16' && 'Round of 16 · +6/team'}
                {r.round === 'quarterFinal' && 'Quarter-finals · +12/team'}
                {r.round === 'semiFinal' && 'Semi-finals · +24/team'}
                {r.round === 'final' && 'Final participants · +36/team'}
                {r.round === 'winner' && '🥇 Champion · +48'}
                {r.round === 'thirdPlace' && '🥉 Third Place · +12'}
              </div>
              <KnockoutRoundRow r={r} />
            </div>
          ))}
        </div>
      </section>

      {/* Final bonus */}
      {score.finalBonusPoints > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-2 px-1">
            Final Score Bonus
          </h2>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
            <div className="text-4xl mb-1">🎯</div>
            <div className="text-white font-semibold">Exact final score bonus!</div>
            <div className="text-wc-gold font-black text-2xl mt-1">+8 pts</div>
          </div>
        </section>
      )}
    </div>
  )
}
