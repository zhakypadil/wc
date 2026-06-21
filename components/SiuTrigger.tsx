'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Layer {
  id: number
  src: string
  leaving: boolean
}

const IMGS = [
  '/portugal/siu.jpg',
  '/portugal/siu4.jpg',
  '/portugal/siu5.webp',
  '/portugal/siu3.jpg',
  '/portugal/siu2.webp',
]

const COLORS = ['#e3262e', '#0a8a4f', '#f4c531', '#ffffff']
const SIU_WORDS = ['SIU!', 'SIUUU!', 'SIUUUU!', 'SIUU!', 'SIIUUU!']
const FONT_ANTON = "var(--font-anton, 'Anton', sans-serif)"
const FONT_ARCHIVO = "var(--font-archivo, 'Archivo', sans-serif)"

function makeSeededRng(init: number) {
  let s = init
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}

function makeConfetti(seed: number) {
  const rnd = makeSeededRng(seed * 9301 + 49297)
  const n = 22
  return Array.from({ length: n }, (_, i) => {
    const ang = (i / n) * Math.PI * 2 + rnd() * 0.5
    const dist = 170 + rnd() * 280
    const size = 7 + rnd() * 11
    return {
      i, size,
      x: Math.cos(ang) * dist,
      y: Math.sin(ang) * dist - 40,
      rot: rnd() * 720 - 360,
      round: rnd() > 0.6,
      color: COLORS[i % COLORS.length],
      delay: rnd() * 0.06,
      dur: 0.85 + rnd() * 0.4,
    }
  })
}

function makeWords(seed: number) {
  const rnd = makeSeededRng(seed * 4099 + 1313)
  const zones = [
    { x: 13, y: 18 }, { x: 87, y: 22 }, { x: 16, y: 80 }, { x: 84, y: 76 },
    { x: 50, y: 8 },  { x: 50, y: 93 }, { x:  7, y: 48 }, { x: 93, y: 52 },
  ]
  const order = zones.map(z => ({ z, k: rnd() })).sort((a, b) => a.k - b.k).map(o => o.z)
  return Array.from({ length: 6 }, (_, i) => {
    const z = order[i]
    const white = rnd() > 0.5
    return {
      i,
      left: Math.max(9, Math.min(91, z.x + (rnd() * 10 - 5))),
      top:  Math.max(12, Math.min(88, z.y + (rnd() * 12 - 6))),
      rot:  rnd() * 28 - 14,
      sf:   0.65 + rnd() * 0.7,
      color:  white ? 'rgba(255,255,255,.96)' : '#e3262e',
      stroke: white ? '1.5px rgba(227,38,46,.9)' : '1.5px rgba(255,255,255,.85)',
      delay: 0.05 + i * 0.05 + rnd() * 0.05,
      text: SIU_WORDS[Math.floor(rnd() * SIU_WORDS.length)],
    }
  })
}

export default function SiuTrigger() {
  const [layers, setLayers] = useState<Layer[]>([])
  const idxRef  = useRef(0)
  const uidRef  = useRef(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const playSound = useCallback(() => {
    const a = audioRef.current
    if (!a || !a.paused) return
    try { a.play().catch(() => {}) } catch {}
  }, [])

  const trigger = useCallback(() => {
    const src = IMGS[idxRef.current % IMGS.length]
    idxRef.current++
    const id = ++uidRef.current
    setLayers(prev => [
      ...prev.map(l => ({ ...l, leaving: true })),
      { id, src, leaving: false },
    ])
    playSound()
    setTimeout(() => {
      setLayers(prev => prev.filter(l => l.id === id || !l.leaving))
    }, 520)
  }, [playSound])

  const close = useCallback(() => {
    const a = audioRef.current
    if (a) { try { a.pause() } catch {} }
    setLayers(prev => prev.map(l => ({ ...l, leaving: true })))
    setTimeout(() => setLayers([]), 520)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      if (k === 'p') { e.preventDefault(); trigger() }
      else if (k === 'escape') { close() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [trigger, close])

  const entering = layers.filter(l => !l.leaving)
  const active   = entering.length > 0
  const burstId  = active ? entering[entering.length - 1].id : 0
  const goalNo   = active
    ? String((idxRef.current - 1) % IMGS.length + 1).padStart(2, '0')
    : '00'

  return (
    <>
      <audio ref={audioRef} src="/portugal/Portugal World Cup Song.m4a" preload="auto" />

      {/* Floating P trigger */}
      <button
        onClick={trigger}
        title="SIU! (or press P)"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 8999,
          width: 52, height: 52, borderRadius: 14, border: 'none',
          background: '#e3262e', cursor: 'pointer',
          fontFamily: FONT_ANTON, fontSize: 34, lineHeight: 1, paddingTop: 4,
          color: '#fff',
          boxShadow: '0 6px 24px rgba(227,38,46,.5)',
          transition: 'transform .15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) rotate(-3deg)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = '' }}
      >
        P
      </button>

      {/* Overlay */}
      <div
        onClick={active ? trigger : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000, overflow: 'hidden',
          background: active ? 'rgba(6,6,9,.5)' : 'transparent',
          backdropFilter:       active ? 'blur(7px) saturate(1.1)' : 'none',
          WebkitBackdropFilter: active ? 'blur(7px) saturate(1.1)' : 'none',
          transition: 'background .3s ease',
          pointerEvents: layers.length ? 'auto' : 'none',
          cursor: active ? 'pointer' : 'default',
        }}
      >
        {/* Rotating stadium spotlight */}
        {active && (
          <div style={{
            position: 'absolute', left: '50%', top: '50%', zIndex: 1,
            width: '150vmax', height: '150vmax',
            background: 'conic-gradient(from 0deg,rgba(227,38,46,.22),transparent 18%,rgba(227,38,46,.22) 36%,transparent 54%,rgba(227,38,46,.22) 72%,transparent 90%,rgba(227,38,46,.22))',
            animation: 'siuSpotSpin 9s linear infinite',
            pointerEvents: 'none', filter: 'blur(2px)',
          }} />
        )}

        {/* Red glow burst — keyed per burst to replay animation */}
        {active && (
          <div key={`glow-${burstId}`} style={{
            position: 'absolute', left: '50%', top: '50%', zIndex: 2,
            width: 620, height: 620, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(227,38,46,.6) 0%,rgba(227,38,46,.18) 42%,transparent 66%)',
            animation: 'siuGlowPop .95s ease-out both',
            pointerEvents: 'none',
          }} />
        )}

        {/* Image cards */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          {layers.map(l => (
            <img
              key={l.id}
              src={l.src}
              alt=""
              style={{
                position: l.leaving ? 'absolute' : 'relative',
                transformOrigin: 'center bottom',
                maxHeight: '72vh',
                maxWidth: 'min(86vw,640px)',
                width: 'auto', height: 'auto', display: 'block',
                borderRadius: 14,
                border: '3px solid rgba(255,255,255,.92)',
                boxShadow: '0 0 0 6px rgba(227,38,46,.92),0 28px 70px rgba(0,0,0,.65),0 0 130px rgba(227,38,46,.5)',
                animation: l.leaving
                  ? 'siuExit .44s cubic-bezier(.5,0,.78,.2) both'
                  : 'siuRise .74s cubic-bezier(.16,.86,.3,1.04) both',
                willChange: 'transform, opacity',
              }}
            />
          ))}
          {active && (
            <div key={`badge-${burstId}`} style={{
              marginTop: 18, display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 16px', borderRadius: 100,
              background: 'rgba(8,8,10,.6)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,.18)',
              fontFamily: FONT_ANTON, letterSpacing: '.08em',
              color: '#fff', fontSize: 15, textTransform: 'uppercase',
              animation: 'siuBadgeIn .5s .25s ease-out both',
            }}>
              <span style={{ color: '#f4c531' }}>SIU · GOAL No. {goalNo}</span>
            </div>
          )}
        </div>

        {/* Confetti — keyed per burst */}
        {active && (
          <div key={`conf-${burstId}`} style={{
            position: 'absolute', left: '50%', top: '50%', zIndex: 5,
            width: 0, height: 0, pointerEvents: 'none',
          }}>
            {makeConfetti(burstId).map(p => (
              <div
                key={p.i}
                style={{
                  position: 'absolute', left: 0, top: 0,
                  width: p.size, height: p.size,
                  background: p.color,
                  borderRadius: p.round ? '50%' : 2,
                  '--cx': `${p.x}px`, '--cy': `${p.y}px`, '--cr': `${p.rot}deg`,
                  animation: `siuConfetti ${p.dur}s ${p.delay}s cubic-bezier(.12,.7,.3,1) both`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* SIUUUU! words — keyed per burst */}
        {active && (
          <div key={`words-${burstId}`} style={{
            position: 'absolute', inset: 0, zIndex: 6,
            pointerEvents: 'none', overflow: 'hidden',
          }}>
            {makeWords(burstId).map(w => (
              <div key={w.i} style={{
                position: 'absolute',
                left: `${w.left}%`, top: `${w.top}%`,
                transform: `translate(-50%,-50%) rotate(${w.rot}deg)`,
              }}>
                <span style={{
                  display: 'inline-block',
                  fontFamily: FONT_ANTON, lineHeight: 1,
                  fontSize: `calc(clamp(22px,5.5vw,78px) * ${w.sf})`,
                  color: w.color,
                  WebkitTextStroke: w.stroke,
                  letterSpacing: '-.02em', whiteSpace: 'nowrap',
                  textShadow: '0 6px 26px rgba(0,0,0,.5)',
                  animation: `siuWordPop .5s ${w.delay}s cubic-bezier(.2,.9,.3,1.2) both`,
                  userSelect: 'none',
                }}>
                  {w.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* White flash — keyed per burst */}
        {active && (
          <div key={`flash-${burstId}`} style={{
            position: 'absolute', inset: 0, zIndex: 7, background: '#fff',
            pointerEvents: 'none', animation: 'siuFlashIn .32s ease-out both',
          }} />
        )}

        {/* Close button */}
        {active && (
          <button
            onClick={e => { e.stopPropagation(); close() }}
            title="Close (Esc)"
            style={{
              position: 'absolute', top: 22, right: 22, zIndex: 8,
              width: 46, height: 46, borderRadius: '50%',
              background: 'rgba(0,0,0,.5)', color: '#fff',
              border: '1px solid rgba(255,255,255,.35)',
              fontSize: 20, lineHeight: 1, cursor: 'pointer',
              backdropFilter: 'blur(6px)',
            }}
          >
            ✕
          </button>
        )}

        {/* Hint */}
        {active && (
          <div style={{
            position: 'absolute', bottom: 26, left: '50%',
            transform: 'translateX(-50%)', zIndex: 8,
            padding: '9px 18px', borderRadius: 100,
            background: 'rgba(0,0,0,.5)', color: '#fff',
            fontFamily: FONT_ARCHIVO, fontSize: 13, letterSpacing: '.04em',
            backdropFilter: 'blur(6px)', whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            Press P again for the next — Esc to close
          </div>
        )}
      </div>
    </>
  )
}
