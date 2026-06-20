import fs from 'fs'
import path from 'path'
import { cacheLife, cacheTag } from 'next/cache'
import { parsePlayerFile } from './excel-parser'
import { fetchLiveResults } from './results-fetcher'
import { computeLeaderboard, computePlayerScore } from './scorer'
import type { PlayerPredictions, LiveResults, LeaderboardEntry, PlayerScore } from './types'

const PREDICTIONS_DIR = path.join(process.cwd(), 'data', 'predictions')
const RESULTS_REVALIDATE = 60

// ─── Predictions ──────────────────────────────────────────────────────────────
export async function getAllPredictions(): Promise<PlayerPredictions[]> {
  'use cache'
  cacheTag('predictions')
  cacheLife('hours')

  if (!fs.existsSync(PREDICTIONS_DIR)) return []

  const files = fs
    .readdirSync(PREDICTIONS_DIR)
    .filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'))

  const results: PlayerPredictions[] = []
  for (const file of files) {
    try {
      results.push(parsePlayerFile(path.join(PREDICTIONS_DIR, file)))
    } catch (err) {
      console.error(`[excel-parser] Skipping ${file}:`, err)
    }
  }
  return results
}

// ─── Live results ─────────────────────────────────────────────────────────────
export async function getLiveResults(): Promise<LiveResults> {
  'use cache'
  cacheTag('results')
  cacheLife({ revalidate: RESULTS_REVALIDATE })

  return fetchLiveResults()
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  'use cache'
  cacheTag('leaderboard')
  cacheLife({ revalidate: RESULTS_REVALIDATE })

  const [predictions, results] = await Promise.all([
    getAllPredictions(),
    getLiveResults(),
  ])
  return computeLeaderboard(predictions, results)
}

// ─── Single player ────────────────────────────────────────────────────────────
export async function getPlayerScore(name: string): Promise<PlayerScore | null> {
  'use cache'
  cacheTag('leaderboard', `player:${name}`)
  cacheLife({ revalidate: RESULTS_REVALIDATE })

  const [predictions, results] = await Promise.all([
    getAllPredictions(),
    getLiveResults(),
  ])

  const player = predictions.find(
    p => p.name.toLowerCase() === name.toLowerCase()
  )
  if (!player) return null
  return computePlayerScore(player, results)
}
