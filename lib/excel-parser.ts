import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import type {
  PlayerPredictions,
  GroupMatchPrediction,
  KnockoutPredictions,
  FinalBonusPrediction,
  Outcome,
} from './types'
import { normalizeTeamName } from './team-names'

// Column B label → internal round key + how many teams to expect
const KO_LABEL_MAP = new Map<string, { key: keyof KnockoutPredictions; size: number }>([
  ['16-Finalist',    { key: 'roundOf32',   size: 32 }],
  ['8-Finalist',     { key: 'roundOf16',   size: 16 }],
  ['Quarterfinalist',{ key: 'quarterFinal',size: 8  }],
  ['Semifinalist',   { key: 'semiFinal',   size: 4  }],
  ['Finalist',       { key: 'final',       size: 2  }],
  ['\u{1F947}Winner',    { key: 'winner',      size: 1  }], // 🥇
  ['\u{1F949}3rd place', { key: 'thirdPlace',  size: 1  }], // 🥉
])

// Group-code pattern: single letter A-L followed by 1, 2, or 3  e.g. "A1", "L3"
const GROUP_CODE_RE = /^[A-L][123]$/

function str(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

// "Adil_WC2026.xlsx" → "Adil",  "Shyn.xlsx" → "Shyn"
function filenameToName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath)).replace(/_WC\d{4}$/i, '')
}

function parseOutcome(code: string): Outcome | null {
  if (code === '1' || code === 'X' || code === '2') return code
  return null
}

function parseGroupPrediction(s: string): {
  outcome: Outcome; homeGoals: number; awayGoals: number
} | null {
  const m = s.match(/^([1X2])\|(\d+)-(\d+)$/)
  if (!m) return null
  const outcome = parseOutcome(m[1])
  if (!outcome) return null
  return { outcome, homeGoals: Number(m[2]), awayGoals: Number(m[3]) }
}

function splitTeams(s: string): [string, string] | null {
  // Prefer " - " separator; fall back to first "-"
  const sd = s.indexOf(' - ')
  if (sd !== -1) return [s.slice(0, sd).trim(), s.slice(sd + 3).trim()]
  const d = s.indexOf('-')
  if (d === -1) return null
  return [s.slice(0, d).trim(), s.slice(d + 1).trim()]
}

function parseFinalBonus(colC: string): FinalBonusPrediction | null {
  // Format: "TeamA-TeamB·O|h-a"  (middle dot U+00B7)
  const dot = colC.indexOf('·')
  if (dot === -1) return null
  const teamsPart = colC.slice(0, dot)
  const predPart  = colC.slice(dot + 1)
  const pred = parseGroupPrediction(predPart)
  if (!pred) return null
  const teams = splitTeams(teamsPart)
  if (!teams) return null
  return {
    teamA: normalizeTeamName(teams[0]),
    teamB: normalizeTeamName(teams[1]),
    ...pred,
  }
}

const CACHE_DIR = path.join(process.cwd(), 'data', 'predictions', '.cache')

function readJsonCache(filePath: string): PlayerPredictions | null {
  try {
    const cachePath = path.join(CACHE_DIR, path.basename(filePath) + '.json')
    if (!fs.existsSync(cachePath)) return null
    const { mtime, data } = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
    if (mtime !== fs.statSync(filePath).mtimeMs) return null
    return data as PlayerPredictions
  } catch {
    return null
  }
}

function writeJsonCache(filePath: string, data: PlayerPredictions): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    const cachePath = path.join(CACHE_DIR, path.basename(filePath) + '.json')
    fs.writeFileSync(cachePath, JSON.stringify({ mtime: fs.statSync(filePath).mtimeMs, data }))
  } catch { /* read-only fs — skip */ }
}

export function parsePlayerFile(filePath: string): PlayerPredictions {
  const cached = readJsonCache(filePath)
  if (cached) return cached

  const buf = fs.readFileSync(filePath)
  const wb = XLSX.read(buf, {
    cellFormula: false, cellHTML: false, cellStyles: false,
    sheets: ['Home', 'Pool'],
    sheetRows: 260,
  })

  // ── Player name ──────────────────────────────────────────────────────────────
  let playerName = ''

  function isValidName(v: string) {
    return v !== '' && v.toLowerCase() !== 'name' && !/^\d+$/.test(v)
  }

  const homeSheet = wb.Sheets['Home']
  if (homeSheet) {
    const v = str(homeSheet['C10']?.v)
    if (isValidName(v)) playerName = v
  }

  const poolSheet = wb.Sheets['Pool']
  if (!poolSheet) {
    const fallback = filenameToName(filePath)
    return { name: playerName || fallback, sourceFile: path.basename(filePath), groupMatches: [], knockout: emptyKnockout(), finalBonus: null }
  }

  const rows: unknown[][] = XLSX.utils.sheet_to_json(poolSheet, { header: 1, defval: '', raw: true })

  if (!playerName) {
    const v = str(rows[4]?.[2])
    if (isValidName(v)) playerName = v
  }
  if (!playerName) playerName = filenameToName(filePath)

  // ── Parse rows ───────────────────────────────────────────────────────────────
  const groupMatches: GroupMatchPrediction[] = []
  const knockout = emptyKnockout()
  let finalBonus: FinalBonusPrediction | null = null

  for (const row of rows) {
    const colA = str(row[0])
    const colB = str(row[1])
    const colC = str(row[2])

    // ── Group-stage match ────────────────────────────────────────────────────
    // colA = "A1".."L3": letter = group, digit = round number (1/2/3)
    if (GROUP_CODE_RE.test(colA) && colB && colC) {
      const pred = parseGroupPrediction(colC)
      if (pred) {
        const teams = splitTeams(colB)
        if (teams) {
          const roundDigit = colA[1]
          const round = roundDigit === '1' ? 'R1' : roundDigit === '2' ? 'R2' : 'R3'
          groupMatches.push({
            homeTeam: normalizeTeamName(teams[0]),
            awayTeam: normalizeTeamName(teams[1]),
            round,
            ...pred,
          })
        }
      }
      continue
    }

    // ── Knockout team prediction ─────────────────────────────────────────────
    // colB = "16-Finalist" / "8-Finalist" / … / "🥇Winner" / "🥉3rd place"
    const koLabel = KO_LABEL_MAP.get(colB)
    if (koLabel && colC) {
      const teamName = normalizeTeamName(colC)
      const { key } = koLabel
      if (key === 'winner' || key === 'thirdPlace') {
        knockout[key] = teamName
      } else {
        ;(knockout[key] as string[]).push(teamName)
      }
      continue
    }

    // ── Final bonus ──────────────────────────────────────────────────────────
    // colA = "F" and colC contains the middle-dot prediction string
    if (colA === 'F' && colC.includes('·')) {
      finalBonus = parseFinalBonus(colC)
    }
  }

  const result: PlayerPredictions = { name: playerName, sourceFile: path.basename(filePath), groupMatches, knockout, finalBonus }
  writeJsonCache(filePath, result)
  return result
}

function emptyKnockout(): KnockoutPredictions {
  return { roundOf32: [], roundOf16: [], quarterFinal: [], semiFinal: [], final: [], winner: '', thirdPlace: '' }
}
