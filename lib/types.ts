export type Outcome = '1' | 'X' | '2'

export type KnockoutRound =
  | 'roundOf32'
  | 'roundOf16'
  | 'quarterFinal'
  | 'semiFinal'
  | 'final'
  | 'winner'
  | 'thirdPlace'

// ─── Prediction types ───────────────────────────────────────────────────────

export interface GroupMatchPrediction {
  homeTeam: string
  awayTeam: string
  outcome: Outcome
  homeGoals: number
  awayGoals: number
  round: 'R1' | 'R2' | 'R3'
}

export interface KnockoutPredictions {
  roundOf32: string[]
  roundOf16: string[]
  quarterFinal: string[]
  semiFinal: string[]
  final: string[]
  winner: string
  thirdPlace: string
}

export interface FinalBonusPrediction {
  teamA: string
  teamB: string
  outcome: Outcome
  homeGoals: number
  awayGoals: number
}

export interface PlayerPredictions {
  name: string
  sourceFile: string
  groupMatches: GroupMatchPrediction[]
  knockout: KnockoutPredictions
  finalBonus: FinalBonusPrediction | null
}

// ─── Results types ───────────────────────────────────────────────────────────

export interface MatchResult {
  homeTeam: string
  awayTeam: string
  homeGoals: number
  awayGoals: number
  outcome: Outcome
  finished: boolean
  round: string
  fixtureId: number
}

export interface KnockoutRoundResults {
  teams: string[]
  resolved: boolean
}

export interface FinalMatchScore {
  homeTeam: string
  awayTeam: string
  homeGoals: number
  awayGoals: number
}

export interface LiveResults {
  groupMatches: MatchResult[]
  knockout: Record<KnockoutRound, KnockoutRoundResults>
  /** Actual goals scored in the Final (regular + extra time, not penalties). */
  finalScore: FinalMatchScore | null
  lastUpdated: string
  source: 'espn' | 'empty'
}

// ─── Scoring types ────────────────────────────────────────────────────────────

export interface GroupMatchScore {
  homeTeam: string
  awayTeam: string
  round: string
  predictedOutcome: Outcome
  predictedHomeGoals: number
  predictedAwayGoals: number
  actualOutcome: Outcome | null
  actualHomeGoals: number | null
  actualAwayGoals: number | null
  points: number
  outcomeCorrect: boolean
  goalDiffCorrect: boolean
  exactScoreCorrect: boolean
}

export interface KnockoutRoundScore {
  round: KnockoutRound
  pointsPerTeam: number
  predicted: string[]
  actual: string[]
  correct: string[]
  totalPoints: number
  resolved: boolean
}

export interface PlayerScore {
  name: string
  totalPoints: number
  groupPoints: number
  knockoutPoints: number
  finalBonusPoints: number
  groupMatchScores: GroupMatchScore[]
  knockoutScores: KnockoutRoundScore[]
}

export interface LeaderboardEntry {
  rank: number
  score: PlayerScore
}
