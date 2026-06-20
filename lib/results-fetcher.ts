import type { LiveResults, MatchResult, KnockoutRound, KnockoutRoundResults, Outcome } from './types'
import { normalizeTeamName } from './team-names'
import { loadResultsCache, saveResultsCache } from './results-cache'

const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
const ESPN_DATE_RANGE = '20260611-20260725'

interface EspnCompetitor {
  homeAway: 'home' | 'away'
  winner?: boolean
  score: string
  team: { displayName: string }
}

interface EspnCompetition {
  status: { type: { state: string } }
  competitors: EspnCompetitor[]
}

interface EspnEvent {
  season: { slug: string }
  competitions: EspnCompetition[]
}

function classifyEspnSlug(slug: string): KnockoutRound | 'group' | 'unknown' {
  switch (slug) {
    case 'group-stage':     return 'group'
    case 'round-of-32':     return 'roundOf32'
    case 'round-of-16':     return 'roundOf16'
    case 'quarterfinals':   return 'quarterFinal'
    case 'semifinals':      return 'semiFinal'
    case '3rd-place-match': return 'thirdPlace'
    case 'final':           return 'final'
    default:                return 'unknown'
  }
}

function emptyKnockout(): Record<KnockoutRound, KnockoutRoundResults> {
  const empty: KnockoutRoundResults = { teams: [], resolved: false }
  return {
    roundOf32:    { ...empty },
    roundOf16:    { ...empty },
    quarterFinal: { ...empty },
    semiFinal:    { ...empty },
    final:        { ...empty },
    winner:       { ...empty },
    thirdPlace:   { ...empty },
  }
}

export async function fetchLiveResults(): Promise<LiveResults> {
  const cache = loadResultsCache()

  let events: EspnEvent[] = []
  try {
    const url = `${ESPN_SCOREBOARD}?dates=${ESPN_DATE_RANGE}&limit=200`
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (res.ok) events = (await res.json())?.events ?? []
  } catch { /* fall through to cache */ }

  if (!events.length && !cache.groupMatches.length) {
    return {
      groupMatches: [],
      knockout: emptyKnockout(),
      finalScore: null,
      lastUpdated: new Date().toISOString(),
      source: 'empty',
    }
  }

  type KoBucket = {
    teams: Set<string>
    total: number
    done: number
    winner?: string
    finalGoals?: { homeTeam: string; awayTeam: string; homeGoals: number; awayGoals: number }
  }
  const espnGroupMatches: MatchResult[] = []
  const koBuckets: Record<string, KoBucket> = {}

  for (const event of events) {
    const roundKey = classifyEspnSlug(event.season?.slug ?? '')
    if (roundKey === 'unknown') continue
    const comp = event.competitions?.[0]
    if (!comp) continue
    const home = comp.competitors.find(c => c.homeAway === 'home')
    const away = comp.competitors.find(c => c.homeAway === 'away')
    if (!home || !away) continue

    const homeTeam = normalizeTeamName(home.team.displayName)
    const awayTeam = normalizeTeamName(away.team.displayName)
    const finished = comp.status.type.state === 'post'
    const homeGoals = parseInt(home.score, 10) || 0
    const awayGoals = parseInt(away.score, 10) || 0

    if (roundKey === 'group') {
      if (!finished) continue
      const outcome: Outcome = homeGoals > awayGoals ? '1' : homeGoals < awayGoals ? '2' : 'X'
      espnGroupMatches.push({
        homeTeam, awayTeam, homeGoals, awayGoals,
        outcome, finished, round: 'Group Stage', fixtureId: 0,
      })
    } else {
      const bucket = koBuckets[roundKey] ??= { teams: new Set(), total: 0, done: 0 }
      bucket.total++
      if (finished) {
        bucket.done++
        bucket.teams.add(homeTeam)
        bucket.teams.add(awayTeam)
        const winnerTeam =
          home.winner === true ? homeTeam
          : away.winner === true ? awayTeam
          : homeGoals > awayGoals ? homeTeam : awayTeam
        if (roundKey === 'final') {
          bucket.winner = winnerTeam
          bucket.finalGoals = { homeTeam, awayTeam, homeGoals, awayGoals }
        }
        if (roundKey === 'thirdPlace') bucket.winner = winnerTeam
      }
    }
  }

  const cachedGroupKeys = new Set(cache.groupMatches.map(m => `${m.homeTeam}|${m.awayTeam}`))
  let changed = false
  for (const m of espnGroupMatches) {
    if (!cachedGroupKeys.has(`${m.homeTeam}|${m.awayTeam}`)) {
      cache.groupMatches.push(m)
      changed = true
    }
  }

  for (const [roundKey, bucket] of Object.entries(koBuckets)) {
    const key = roundKey as KnockoutRound
    const teams = [...bucket.teams]
    const resolved = bucket.total > 0 && bucket.done === bucket.total
    const cached = cache.knockout[key]
    if (teams.length > cached.teams.length || (resolved && !cached.resolved)) {
      cache.knockout[key] = { teams, resolved }
      changed = true
    }
    if (key === 'final' && bucket.winner && !cache.knockout.winner.resolved) {
      cache.knockout.winner = { teams: [bucket.winner], resolved: true }
      cache.finalScore = bucket.finalGoals ?? null
      changed = true
    }
    if (key === 'thirdPlace' && bucket.winner && !cache.knockout.thirdPlace.resolved) {
      cache.knockout.thirdPlace = { teams: [bucket.winner], resolved: true }
      changed = true
    }
  }

  if (changed) saveResultsCache(cache)

  return {
    groupMatches: cache.groupMatches,
    knockout: cache.knockout,
    finalScore: cache.finalScore,
    lastUpdated: new Date().toISOString(),
    source: 'espn',
  }
}
