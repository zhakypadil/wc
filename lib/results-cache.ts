import fs from 'fs'
import path from 'path'
import type { MatchResult, KnockoutRound, KnockoutRoundResults, FinalMatchScore } from './types'

export interface CachedResults {
  groupMatches: MatchResult[]
  knockout: Record<KnockoutRound, KnockoutRoundResults>
  finalScore: FinalMatchScore | null
}

const CACHE_FILE = path.join(process.cwd(), 'data', 'results-cache.json')

const EMPTY_KO: Record<KnockoutRound, KnockoutRoundResults> = {
  roundOf32:    { teams: [], resolved: false },
  roundOf16:    { teams: [], resolved: false },
  quarterFinal: { teams: [], resolved: false },
  semiFinal:    { teams: [], resolved: false },
  final:        { teams: [], resolved: false },
  winner:       { teams: [], resolved: false },
  thirdPlace:   { teams: [], resolved: false },
}

export function loadResultsCache(): CachedResults {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
    }
  } catch { /* ignore */ }
  return { groupMatches: [], knockout: structuredClone(EMPTY_KO), finalScore: null }
}

export function saveResultsCache(data: CachedResults): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  } catch { /* read-only filesystem (e.g. Vercel) — silently skip */ }
}
