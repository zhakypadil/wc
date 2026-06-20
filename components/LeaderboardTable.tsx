import Link from 'next/link'
import type { LeaderboardEntry } from '@/lib/types'

// gold, silver, bronze
const MEDAL_COLORS = ['#F2B705', '#C2C8D2', '#CE8A4E']

function initials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

function formatUpdated(iso: string) {
  try {
    const d = new Date(iso)
    return (
      d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
      ' · ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
      ' UTC'
    )
  } catch {
    return iso
  }
}

const S = {
  anton: "var(--font-anton, 'Anton', sans-serif)",
  archivo: "var(--font-archivo, 'Archivo', sans-serif)",
  upper: 'uppercase' as const,
  right: 'right' as const,
  center: 'center' as const,
  left: 'left' as const,
}

export default function LeaderboardTable({
  entries,
  lastUpdated,
  source,
  heroImage = '/images/crowd.jpg',
}: {
  entries: LeaderboardEntry[]
  lastUpdated: string
  source: string
  heroImage?: string
}) {
  const maxPts = entries[0]?.score.totalPoints || 1

  // Podium visual order: 2nd | 1st | 3rd
  const top3 = entries.slice(0, 3)
  const podium = [top3[1], top3[0], top3[2]].filter((e): e is LeaderboardEntry => !!e)

  return (
    <div style={{ fontFamily: S.archivo, color: '#101826', background: '#F6F1E5', minHeight: '100vh' }}>

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'relative', minHeight: '84vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        <img
          src={heroImage} alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,18,38,.55) 0%, rgba(8,18,38,.05) 30%, rgba(8,18,38,.35) 60%, rgba(8,18,38,.92) 100%)' }} />

        {/* Nav */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '26px clamp(20px,5vw,64px)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#E5197B', boxShadow: '0 0 0 4px rgba(229,25,123,.28)', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, letterSpacing: '.18em', fontSize: 12, textTransform: S.upper, color: '#fff' }}>
              FIFA World Cup 26 · Friends League
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.25)', padding: '8px 14px', borderRadius: 999 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#36D07A', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '.06em', color: '#fff', textTransform: S.upper }}>{entries.length} managers · live</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ position: 'relative', padding: '0 clamp(20px,5vw,64px) clamp(40px,6vw,76px)' }}>
          <p style={{ margin: '0 0 10px', fontWeight: 700, letterSpacing: '.22em', fontSize: 'clamp(12px,1.4vw,15px)', textTransform: S.upper, color: 'rgba(255,255,255,.82)' }}>
            Prediction Leaderboard
          </p>
          <h1 style={{ margin: 0, fontFamily: S.anton, fontWeight: 400, fontSize: 'clamp(60px,13vw,200px)', lineHeight: .84, letterSpacing: '-.015em', textTransform: S.upper, color: '#fff', textShadow: '0 6px 40px rgba(0,0,0,.35)' }}>
            World Cup <span style={{ color: '#F2B705' }}>2026</span>
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 'clamp(36px,5vw,64px)' }}>
            {[['48', 'Teams'], ['104', 'Matches'], [String(entries.length), 'Predicting']].map(([n, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 9, background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)', padding: '11px 18px', borderRadius: 14 }}>
                <span style={{ fontFamily: S.anton, fontSize: 24, color: '#fff' }}>{n}</span>
                <span style={{ fontSize: 12, letterSpacing: '.08em', textTransform: S.upper, color: 'rgba(255,255,255,.72)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Podium ─────────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(44px,6vw,84px) clamp(20px,5vw,40px) clamp(20px,3vw,32px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 'clamp(28px,4vw,50px)', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '0 0 6px', fontWeight: 700, letterSpacing: '.2em', fontSize: 12, textTransform: S.upper, color: '#E5197B' }}>On top of the table</p>
            <h2 style={{ margin: 0, fontFamily: S.anton, fontWeight: 400, fontSize: 'clamp(36px,5.5vw,64px)', lineHeight: .9, letterSpacing: '-.01em', textTransform: S.upper, color: '#101826' }}>The Podium</h2>
          </div>
          <p style={{ margin: 0, maxWidth: 320, fontSize: 14, lineHeight: 1.65, color: '#5A6473', textAlign: S.right }}>
            Group-stage accuracy plus knockout calls. Tap any manager to open their full prediction sheet.
          </p>
        </div>

        {/* 3-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.18fr 1fr', gap: 'clamp(10px,1.8vw,22px)', alignItems: 'end' }}>
          {podium.map(entry => {
            const { rank, score } = entry
            const champ = rank === 1
            const mc = MEDAL_COLORS[rank - 1]
            const label = champ ? 'Champion-elect' : rank === 2 ? 'Runner-up' : 'Third'
            const icon = champ ? '👑' : rank === 2 ? '🥈' : '🥉'
            return (
              <Link key={score.name} href={`/player/${encodeURIComponent(score.name)}`} style={{ textDecoration: 'none' }} className="podium-link">
                <div style={{
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  minHeight: champ ? 300 : 240,
                  padding: 'clamp(16px,2.2vw,26px)',
                  borderRadius: 20, overflow: 'hidden',
                  background: champ ? 'linear-gradient(160deg,#13203A 0%,#0B1428 100%)' : '#fff',
                  border: champ ? `2px solid ${mc}` : '1px solid #EAE3D3',
                  boxShadow: champ ? '0 18px 50px rgba(11,20,40,.32)' : '0 2px 10px rgba(16,24,38,.06)',
                }}>
                  {/* Confetti for #1 */}
                  {champ && [
                    { left: '10%', bg: '#F2B705', d: '0s',   round: false },
                    { left: '26%', bg: '#E5197B', d: '.5s',  round: false },
                    { left: '44%', bg: '#10A14A', d: '.9s',  round: true  },
                    { left: '62%', bg: '#fff',    d: '.3s',  round: false },
                    { left: '78%', bg: '#F2B705', d: '1.1s', round: false },
                    { left: '91%', bg: '#E5197B', d: '.7s',  round: false },
                  ].map((p, i) => (
                    <span key={i} style={{
                      position: 'absolute', left: p.left, top: 0,
                      width: 8, height: 12, background: p.bg, opacity: 0,
                      borderRadius: p.round ? '50%' : 2, pointerEvents: 'none',
                      animation: `confettiFall 3.2s linear infinite`,
                      animationDelay: p.d,
                    }} />
                  ))}

                  {/* Rank badge + icon */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: S.anton, fontSize: 26, background: mc, color: rank === 1 ? '#1A1205' : '#2B3445', flexShrink: 0 }}>{rank}</div>
                    <span style={{ fontSize: champ ? 28 : 22 }}>{icon}</span>
                  </div>

                  {/* Player info */}
                  <div style={{ position: 'relative', marginTop: 'auto', paddingTop: 20 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '.14em', textTransform: S.upper, color: champ ? 'rgba(255,255,255,.65)' : '#9AA3B1' }}>{label}</p>
                    <h3 style={{ margin: '0 0 14px', fontWeight: 800, fontSize: 'clamp(16px,2.2vw,24px)', lineHeight: 1.1, color: champ ? '#fff' : '#101826', overflowWrap: 'break-word' }}>{score.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                      <span style={{ fontFamily: S.anton, fontSize: 'clamp(38px,5.5vw,64px)', lineHeight: .82, color: champ ? '#fff' : '#101826' }}>{score.totalPoints}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: S.upper, color: champ ? 'rgba(255,255,255,.65)' : '#9AA3B1' }}>pts</span>
                    </div>
                    <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 12, padding: '5px 9px', borderRadius: 7, background: champ ? 'rgba(255,255,255,.12)' : '#EAF7EF', color: champ ? 'rgba(255,255,255,.85)' : '#0C7C3E' }}>Grp {score.groupPoints}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 12, padding: '5px 9px', borderRadius: 7, background: champ ? 'rgba(255,255,255,.12)' : '#FFF4D6', color: champ ? 'rgba(255,255,255,.85)' : '#9A6B00' }}>KO {score.knockoutPoints}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Full Standings ──────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(20px,5vw,40px) 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontFamily: S.anton, fontWeight: 400, fontSize: 'clamp(28px,4vw,48px)', lineHeight: .9, textTransform: S.upper, color: '#101826' }}>Full Standings</h2>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#8A93A1', letterSpacing: '.04em' }}>{entries.length} managers · sorted by total points</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr 78px 78px 92px', gap: 14, padding: '0 18px 12px', borderBottom: '2px solid #101826', minWidth: 460 }}>
            {(['Pos', 'Manager', 'Group', 'Knockout', 'Total'] as const).map((h, i) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: S.upper, color: '#8A93A1', textAlign: i >= 2 ? (i === 4 ? S.right : S.center) : S.left }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 460 }}>
            {entries.map(({ rank, score }) => {
              const top = rank <= 3
              const mc = MEDAL_COLORS[rank - 1]
              const ini = initials(score.name)
              return (
                <Link key={score.name} href={`/player/${encodeURIComponent(score.name)}`} style={{ textDecoration: 'none' }} className="standings-link">
                  <div className="standings-row" style={{
                    padding: '14px 18px', borderRadius: 14, marginBottom: 3,
                    background: top ? '#fff' : 'transparent',
                    border: `1px solid ${top ? '#EFE8D8' : 'transparent'}`,
                    borderLeft: `4px solid ${top ? mc! : 'transparent'}`,
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr 78px 78px 92px', gap: 14, alignItems: 'center' }}>
                      <span style={{ fontFamily: S.anton, fontSize: 21, color: top ? '#101826' : '#AEB5C0', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(rank).padStart(2, '0')}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, background: top ? mc! : '#ECE6D8', color: top ? (rank === 1 ? '#1A1205' : '#2B3445') : '#6B7482' }}>{ini}</div>
                        <span style={{ fontWeight: 700, fontSize: 'clamp(13px,1.7vw,16px)', color: '#101826', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{score.name}</span>
                      </div>
                      <div style={{ justifySelf: S.center }}>
                        <span style={{ fontVariantNumeric: 'tabular-nums', background: '#EAF7EF', color: '#0C7C3E', fontWeight: 700, fontSize: 13, padding: '4px 10px', borderRadius: 7 }}>{score.groupPoints}</span>
                      </div>
                      <div style={{ justifySelf: S.center }}>
                        <span style={{ fontVariantNumeric: 'tabular-nums', background: '#FFF4D6', color: '#9A6B00', fontWeight: 700, fontSize: 13, padding: '4px 10px', borderRadius: 7 }}>{score.knockoutPoints}</span>
                      </div>
                      <div style={{ justifySelf: 'end' }}>
                        <span style={{ fontFamily: S.anton, fontSize: 25, lineHeight: .9, color: '#101826', fontVariantNumeric: 'tabular-nums' }}>{score.totalPoints}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, height: 5, borderRadius: 5, background: '#E7E1D2', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.round((score.totalPoints / maxPts) * 100)}%`, borderRadius: 5, background: 'linear-gradient(90deg,#12A14B,#F2B705)' }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {entries.length === 0 && (
          <div style={{ textAlign: S.center, padding: '80px 0', color: '#9AA3B1' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📂</div>
            <p style={{ fontSize: 15 }}>No prediction files found in <code>data/predictions/</code></p>
          </div>
        )}
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer style={{ maxWidth: 1040, margin: 'clamp(40px,5vw,64px) auto 0', padding: '28px clamp(20px,5vw,40px) 64px', borderTop: '1px solid #DAD3C2', display: 'flex', flexWrap: 'wrap', gap: '12px 32px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#E5197B', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, letterSpacing: '.16em', fontSize: 11, textTransform: S.upper, color: '#101826' }}>Friends League · WC26</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', fontSize: 13, color: '#6B7482' }}>
          <span><strong style={{ color: '#101826' }}>{entries.length}</strong> managers</span>
          <span>Updated {formatUpdated(lastUpdated)}</span>
          {source !== 'empty' && <span>Source · {source}</span>}
        </div>
      </footer>
    </div>
  )
}
