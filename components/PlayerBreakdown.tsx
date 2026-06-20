import Link from 'next/link'
import type { PlayerScore, GroupMatchScore, KnockoutRoundScore } from '@/lib/types'

const S = {
  anton: "var(--font-anton, 'Anton', sans-serif)",
  archivo: "var(--font-archivo, 'Archivo', sans-serif)",
  upper: 'uppercase' as const,
  center: 'center' as const,
}

const KO_LABELS: Record<string, string> = {
  roundOf32:   'Round of 32',
  roundOf16:   'Round of 16',
  quarterFinal: 'Quarter-finals',
  semiFinal:   'Semi-finals',
  final:       'Final',
  winner:      'Champion',
  thirdPlace:  '3rd Place',
}

const KO_PTS: Record<string, string> = {
  roundOf32:   '+3 / team',
  roundOf16:   '+6 / team',
  quarterFinal: '+12 / team',
  semiFinal:   '+24 / team',
  final:       '+36 / team',
  winner:      '+48',
  thirdPlace:  '+12',
}

// ── Group match row ───────────────────────────────────────────────────────────

function GroupRow({ m }: { m: GroupMatchScore }) {
  const pending = m.actualOutcome === null
  const pts = m.points

  return (
    <tr style={{ borderBottom: '1px solid #EAE3D3' }}>
      <td style={{ padding: '11px 14px', fontSize: 12, color: '#9AA3B1', whiteSpace: 'nowrap' as const }}>{m.round}</td>
      <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 600 }}>
        <span style={{ color: m.outcomeCorrect ? '#101826' : '#6B7482' }}>{m.homeTeam}</span>
        <span style={{ color: '#C2CAD4', margin: '0 6px' }}>vs</span>
        <span style={{ color: m.outcomeCorrect ? '#101826' : '#6B7482' }}>{m.awayTeam}</span>
      </td>
      <td style={{ padding: '11px 14px', textAlign: S.center, fontFamily: 'monospace', fontSize: 13, color: '#6B7482', whiteSpace: 'nowrap' as const }}>
        {m.predictedOutcome} · {m.predictedHomeGoals}–{m.predictedAwayGoals}
      </td>
      <td style={{ padding: '11px 14px', textAlign: S.center, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'nowrap' as const }}>
        {pending ? (
          <span style={{ color: '#C2CAD4' }}>–</span>
        ) : (
          <span style={{ color: m.outcomeCorrect ? '#0C7C3E' : '#BE3A5A' }}>
            {m.actualOutcome} · {m.actualHomeGoals}–{m.actualAwayGoals}
          </span>
        )}
      </td>
      <td style={{ padding: '11px 14px', textAlign: S.center }}>
        {pending ? (
          <span style={{ color: '#C2CAD4', fontSize: 12 }}>–</span>
        ) : (
          <span style={{
            fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 13,
            padding: '4px 10px', borderRadius: 7,
            background: pts >= 3 ? '#EAF7EF' : pts > 0 ? '#FFF4D6' : '#F5F0E8',
            color: pts >= 3 ? '#0C7C3E' : pts > 0 ? '#9A6B00' : '#9AA3B1',
          }}>+{pts}</span>
        )}
      </td>
    </tr>
  )
}

// ── Knockout card ─────────────────────────────────────────────────────────────

function KoCard({ r }: { r: KnockoutRoundScore }) {
  const label = KO_LABELS[r.round] ?? r.round
  const ptLabel = KO_PTS[r.round] ?? ''
  const hasContent = r.predicted.length > 0

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EAE3D3', padding: '18px 20px', boxShadow: '0 1px 6px rgba(16,24,38,.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: S.upper, color: '#9AA3B1' }}>{label}</p>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#B4BCCA' }}>{ptLabel}</p>
        </div>
        {r.resolved && (
          <div style={{ textAlign: S.center, flexShrink: 0 }}>
            <span style={{ fontFamily: S.anton, fontSize: 28, lineHeight: .9, color: r.totalPoints > 0 ? '#101826' : '#C2CAD4' }}>{r.totalPoints}</span>
            <p style={{ margin: '2px 0 0', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: S.upper, color: '#9AA3B1' }}>pts</p>
          </div>
        )}
        {!r.resolved && !hasContent && (
          <span style={{ fontSize: 11, color: '#C2CAD4', fontStyle: 'italic' }}>Not yet</span>
        )}
        {!r.resolved && hasContent && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#FFF4D6', color: '#9A6B00' }}>In progress</span>
        )}
      </div>

      {hasContent ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {r.predicted.map(team => {
            const correct = r.correct.some(c => c.toLowerCase() === team.toLowerCase())
            const wrong = r.resolved && !correct
            return (
              <span key={team} style={{
                fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
                background: correct ? '#EAF7EF' : wrong ? '#FEF0F3' : '#F5F0E8',
                color: correct ? '#0C7C3E' : wrong ? '#BE3A5A' : '#6B7482',
                textDecoration: wrong ? 'line-through' : 'none',
              }}>{team}</span>
            )
          })}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: '#C2CAD4', fontStyle: 'italic' }}>No predictions yet</p>
      )}

      {r.resolved && r.predicted.length > 0 && (
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#9AA3B1' }}>
          {r.correct.length} / {r.predicted.length} correct
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PlayerBreakdown({ score, rank, fanImage = '/images/fan.jpg' }: { score: PlayerScore; rank: number; fanImage?: string }) {
  const hasBonus = score.finalBonusPoints > 0

  return (
    <div style={{ fontFamily: S.archivo, color: '#101826', background: '#F6F1E5', minHeight: '100vh' }}>

      {/* ── Player hero ──────────────────────────────────────────────────────── */}
      <header style={{ position: 'relative', minHeight: '42vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        <img src={fanImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,18,38,.60) 0%, rgba(8,18,38,.10) 35%, rgba(8,18,38,.55) 65%, rgba(8,18,38,.90) 100%)' }} />

        {/* Back link */}
        <div style={{ position: 'relative', padding: '24px clamp(20px,5vw,48px)' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.78)', fontSize: 14, fontWeight: 600, textDecoration: 'none', letterSpacing: '.03em' }}>
            <span style={{ fontSize: 16 }}>←</span> Leaderboard
          </Link>
        </div>

        {/* Player name + rank + score */}
        <div style={{ position: 'relative', padding: '0 clamp(20px,5vw,48px) clamp(32px,5vw,56px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: S.anton, fontSize: 18, lineHeight: 1,
              padding: '5px 12px', borderRadius: 8,
              background: rank === 1 ? '#F2B705' : rank === 2 ? '#C2C8D2' : rank === 3 ? '#CE8A4E' : 'rgba(255,255,255,.18)',
              color: rank <= 3 ? '#101826' : '#fff',
            }}>#{rank}</span>
            {rank === 1 && <span style={{ fontSize: 20 }}>👑</span>}
          </div>
          <h1 style={{ margin: 0, fontFamily: S.anton, fontWeight: 400, fontSize: 'clamp(44px,9vw,100px)', lineHeight: .88, letterSpacing: '-.015em', textTransform: S.upper, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,.3)' }}>
            {score.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 14 }}>
            <span style={{ fontFamily: S.anton, fontSize: 'clamp(28px,4vw,42px)', color: '#F2B705' }}>{score.totalPoints}</span>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: S.upper, color: 'rgba(255,255,255,.65)' }}>total pts</span>
          </div>
        </div>
      </header>

      {/* ── Stat cards ───────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(28px,4vw,48px) clamp(20px,5vw,40px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(10px,1.5vw,18px)' }}>
          {[
            { label: 'Group Stage', pts: score.groupPoints,       icon: '⚽', bg: '#EAF7EF', accent: '#0C7C3E', iconBg: '#D0F0DF' },
            { label: 'Knockout',    pts: score.knockoutPoints,    icon: '🏆', bg: '#FFF4D6', accent: '#9A6B00', iconBg: '#FFE8A0' },
            { label: 'Final Bonus', pts: score.finalBonusPoints,  icon: '🎯', bg: '#FEF0F8', accent: '#BE3A5A', iconBg: '#FDD6EB' },
          ].map(({ label, pts, icon, bg, accent, iconBg }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 18, border: '1px solid #EAE3D3', padding: 'clamp(14px,2vw,22px)', boxShadow: '0 1px 6px rgba(16,24,38,.05)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>{icon}</div>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: S.upper, color: '#9AA3B1' }}>{label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontFamily: S.anton, fontSize: 'clamp(28px,3.5vw,38px)', lineHeight: .9, color: accent }}>{pts}</span>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: S.upper, color: '#C2CAD4', letterSpacing: '.08em' }}>pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bonus banner */}
        {hasBonus && (
          <div style={{ marginTop: 'clamp(16px,2vw,24px)', background: 'linear-gradient(135deg,#13203A,#0B1428)', borderRadius: 18, padding: 'clamp(18px,2.5vw,28px)', display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 36, flexShrink: 0 }}>🎯</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 15, color: '#fff' }}>Final Score Bonus!</p>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,.55)' }}>Predicted the exact scoreline of the final</p>
            </div>
            <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
              <span style={{ fontFamily: S.anton, fontSize: 32, color: '#F2B705' }}>+{score.finalBonusPoints}</span>
              <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 700, textTransform: S.upper, color: 'rgba(255,255,255,.45)', letterSpacing: '.1em' }}>pts</p>
            </div>
          </div>
        )}

        {/* ── Knockout Calls ────────────────────────────────────────────────── */}
        <section style={{ marginTop: 'clamp(36px,5vw,56px)' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, letterSpacing: '.2em', fontSize: 12, textTransform: S.upper, color: '#E5197B' }}>Stage predictions</p>
            <h2 style={{ margin: 0, fontFamily: S.anton, fontWeight: 400, fontSize: 'clamp(28px,4vw,44px)', lineHeight: .9, textTransform: S.upper, color: '#101826' }}>Knockout Calls</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 'clamp(10px,1.5vw,16px)' }}>
            {score.knockoutScores.map(r => (
              <KoCard key={r.round} r={r} />
            ))}
          </div>
        </section>

        {/* ── Group Stage Sheet ─────────────────────────────────────────────── */}
        <section style={{ marginTop: 'clamp(36px,5vw,56px)' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, letterSpacing: '.2em', fontSize: 12, textTransform: S.upper, color: '#10A14A' }}>Match by match</p>
            <h2 style={{ margin: 0, fontFamily: S.anton, fontWeight: 400, fontSize: 'clamp(28px,4vw,44px)', lineHeight: .9, textTransform: S.upper, color: '#101826' }}>Group Stage</h2>
          </div>

          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EAE3D3', overflow: 'hidden', boxShadow: '0 1px 6px rgba(16,24,38,.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead>
                  <tr style={{ background: '#101826' }}>
                    {['Rnd', 'Match', 'Prediction', 'Result', 'Pts'].map((h, i) => (
                      <th key={h} style={{ padding: '13px 14px', textAlign: (i >= 2 ? S.center : 'left') as 'left' | 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: S.upper, color: 'rgba(255,255,255,.7)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {score.groupMatchScores.map((m, i) => (
                    <tr key={`${m.homeTeam}|${m.awayTeam}`} style={{ background: i % 2 === 0 ? '#fff' : '#FBF9F3', borderBottom: '1px solid #EAE3D3' }}>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#9AA3B1', whiteSpace: 'nowrap' as const }}>{m.round}</td>
                      <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 600 }}>
                        <span style={{ color: m.outcomeCorrect ? '#101826' : '#6B7482' }}>{m.homeTeam}</span>
                        <span style={{ color: '#C2CAD4', margin: '0 6px' }}>vs</span>
                        <span style={{ color: m.outcomeCorrect ? '#101826' : '#6B7482' }}>{m.awayTeam}</span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: S.center, fontFamily: 'monospace', fontSize: 13, color: '#6B7482', whiteSpace: 'nowrap' as const }}>
                        {m.predictedOutcome} · {m.predictedHomeGoals}–{m.predictedAwayGoals}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: S.center, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'nowrap' as const }}>
                        {m.actualOutcome === null ? (
                          <span style={{ color: '#C2CAD4' }}>–</span>
                        ) : (
                          <span style={{ color: m.outcomeCorrect ? '#0C7C3E' : '#BE3A5A' }}>
                            {m.actualOutcome} · {m.actualHomeGoals}–{m.actualAwayGoals}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: S.center }}>
                        {m.actualOutcome === null ? (
                          <span style={{ color: '#C2CAD4', fontSize: 12 }}>–</span>
                        ) : (
                          <span style={{
                            fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 13,
                            padding: '4px 10px', borderRadius: 7,
                            background: m.points >= 3 ? '#EAF7EF' : m.points > 0 ? '#FFF4D6' : '#F5F0E8',
                            color: m.points >= 3 ? '#0C7C3E' : m.points > 0 ? '#9A6B00' : '#9AA3B1',
                          }}>+{m.points}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {score.groupMatchScores.length === 0 && (
                <div style={{ padding: '48px 20px', textAlign: S.center, color: '#9AA3B1', fontSize: 14 }}>
                  No group stage predictions found.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Back link footer */}
        <div style={{ marginTop: 'clamp(40px,5vw,64px)', paddingBottom: 64, textAlign: S.center }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6B7482', fontSize: 14, fontWeight: 600, textDecoration: 'none', letterSpacing: '.04em' }}>
            ← Back to leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}
