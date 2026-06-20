import type {
  PlayerPredictions,
  LiveResults,
  PlayerScore,
  LeaderboardEntry,
  GroupMatchScore,
  KnockoutRoundScore,
  KnockoutRound,
  Outcome,
} from './types'
import { teamsMatch } from './team-names'

// ─── Points constants ─────────────────────────────────────────────────────────
const KNOCKOUT_POINTS: Record<KnockoutRound, number> = {
  roundOf32: 3,
  roundOf16: 6,
  quarterFinal: 12,
  semiFinal: 24,
  final: 36,
  winner: 48,
  thirdPlace: 12,
}

const KNOCKOUT_LABELS: Record<KnockoutRound, string> = {
  roundOf32: 'Round of 32',
  roundOf16: 'Round of 16',
  quarterFinal: 'Quarter-finals',
  semiFinal: 'Semi-finals',
  final: 'Final',
  winner: '🥇 Champion',
  thirdPlace: '🥉 Third Place',
}

const KNOCKOUT_ROUNDS: KnockoutRound[] = [
  'roundOf32', 'roundOf16', 'quarterFinal', 'semiFinal',
  'final', 'winner', 'thirdPlace',
]

// ─── Group-stage scoring ──────────────────────────────────────────────────────
// Nested tiers:
//   Exact score → 3 pts
//   Correct outcome + correct goal difference → 2 pts
//   Correct outcome only → 1 pt
//   Wrong outcome → 0 pts

function goalDiff(h: number, a: number) { return h - a }

function scoreGroupMatch(
  predicted: {
    homeTeam: string; awayTeam: string; round: string
    outcome: Outcome; homeGoals: number; awayGoals: number
  },
  result: {
    outcome: Outcome; homeGoals: number; awayGoals: number
  }
): GroupMatchScore {
  const outcomeCorrect = predicted.outcome === result.outcome
  const exactScoreCorrect =
    outcomeCorrect &&
    predicted.homeGoals === result.homeGoals &&
    predicted.awayGoals === result.awayGoals
  const goalDiffCorrect =
    outcomeCorrect &&
    goalDiff(predicted.homeGoals, predicted.awayGoals) ===
      goalDiff(result.homeGoals, result.awayGoals)

  const points = exactScoreCorrect ? 3 : goalDiffCorrect ? 2 : outcomeCorrect ? 1 : 0

  return {
    homeTeam: predicted.homeTeam,
    awayTeam: predicted.awayTeam,
    round: predicted.round,
    predictedOutcome: predicted.outcome,
    predictedHomeGoals: predicted.homeGoals,
    predictedAwayGoals: predicted.awayGoals,
    actualOutcome: result.outcome,
    actualHomeGoals: result.homeGoals,
    actualAwayGoals: result.awayGoals,
    points,
    outcomeCorrect,
    goalDiffCorrect,
    exactScoreCorrect,
  }
}

// ─── Knockout scoring ─────────────────────────────────────────────────────────
function scoreKnockoutRound(
  round: KnockoutRound,
  predicted: string | string[],
  actual: { teams: string[]; resolved: boolean }
): KnockoutRoundScore {
  const predictedArr = Array.isArray(predicted) ? predicted : predicted ? [predicted] : []
  const actualArr = actual.teams

  const correct = predictedArr.filter(p =>
    actualArr.some(a => teamsMatch(p, a))
  )

  const totalPoints = actual.resolved ? correct.length * KNOCKOUT_POINTS[round] : 0

  return {
    round,
    pointsPerTeam: KNOCKOUT_POINTS[round],
    predicted: predictedArr,
    actual: actualArr,
    correct,
    totalPoints,
    resolved: actual.resolved,
  }
}

// ─── Final-bonus scoring ──────────────────────────────────────────────────────
// +8 ONLY if the predicted winner AND exact final score both match the real final.
function scoreFinalBonus(predictions: PlayerPredictions, results: LiveResults): number {
  const fb = predictions.finalBonus
  if (!fb) return 0

  const winnerResult = results.knockout['winner']
  const finalResult = results.knockout['final']
  if (!winnerResult.resolved || !finalResult.resolved || !results.finalScore) return 0

  const actualWinner = winnerResult.teams[0] ?? ''
  const fs = results.finalScore

  // 1. Predicted winner must match actual winner
  const predictedWinnerIsA = teamsMatch(fb.teamA, actualWinner)
  const predictedWinnerIsB = teamsMatch(fb.teamB, actualWinner)
  if (!predictedWinnerIsA && !predictedWinnerIsB) return 0

  // 2. Predicted final teams must match actual final teams
  if (
    !finalResult.teams.some(t => teamsMatch(t, fb.teamA)) ||
    !finalResult.teams.some(t => teamsMatch(t, fb.teamB))
  ) return 0

  // 3. Exact score: the predicted score is from teamA's perspective (teamA-teamB h-a)
  // Map predicted goals to home/away based on which is the actual home team
  const teamAIsHome = teamsMatch(fb.teamA, fs.homeTeam)
  const predHome = teamAIsHome ? fb.homeGoals : fb.awayGoals
  const predAway = teamAIsHome ? fb.awayGoals : fb.homeGoals

  return predHome === fs.homeGoals && predAway === fs.awayGoals ? 8 : 0
}

// ─── Full player score ────────────────────────────────────────────────────────
export function computePlayerScore(
  predictions: PlayerPredictions,
  results: LiveResults
): PlayerScore {
  // Group stage
  const groupMatchScores: GroupMatchScore[] = predictions.groupMatches.map(pred => {
    const actual = results.groupMatches.find(
      r => teamsMatch(r.homeTeam, pred.homeTeam) && teamsMatch(r.awayTeam, pred.awayTeam)
    )
    if (!actual) {
      return {
        homeTeam: pred.homeTeam,
        awayTeam: pred.awayTeam,
        round: pred.round,
        predictedOutcome: pred.outcome,
        predictedHomeGoals: pred.homeGoals,
        predictedAwayGoals: pred.awayGoals,
        actualOutcome: null,
        actualHomeGoals: null,
        actualAwayGoals: null,
        points: 0,
        outcomeCorrect: false,
        goalDiffCorrect: false,
        exactScoreCorrect: false,
      }
    }
    return scoreGroupMatch(pred, actual)
  })

  const groupPoints = groupMatchScores.reduce((s, m) => s + m.points, 0)

  // Knockout rounds
  const knockoutScores: KnockoutRoundScore[] = KNOCKOUT_ROUNDS.map(round => {
    const predicted =
      round === 'winner' || round === 'thirdPlace'
        ? predictions.knockout[round]
        : predictions.knockout[round]
    return scoreKnockoutRound(round, predicted, results.knockout[round])
  })

  const knockoutPoints = knockoutScores.reduce((s, r) => s + r.totalPoints, 0)

  const finalBonusPoints = scoreFinalBonus(predictions, results)

  return {
    name: predictions.name,
    totalPoints: groupPoints + knockoutPoints + finalBonusPoints,
    groupPoints,
    knockoutPoints,
    finalBonusPoints,
    groupMatchScores,
    knockoutScores,
  }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export function computeLeaderboard(
  allPredictions: PlayerPredictions[],
  results: LiveResults
): LeaderboardEntry[] {
  const scores = allPredictions.map(p => computePlayerScore(p, results))

  scores.sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name))

  const entries: LeaderboardEntry[] = []
  let rank = 1
  for (let i = 0; i < scores.length; i++) {
    if (i > 0 && scores[i].totalPoints < scores[i - 1].totalPoints) rank = i + 1
    entries.push({ rank, score: scores[i] })
  }

  return entries
}

export { KNOCKOUT_LABELS, KNOCKOUT_POINTS, KNOCKOUT_ROUNDS }
