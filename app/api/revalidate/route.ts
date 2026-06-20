// POST /api/revalidate?tag=predictions  → clears parsed Excel cache
// POST /api/revalidate?tag=results      → clears live results cache
// POST /api/revalidate?tag=all          → clears both

import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const tag = req.nextUrl.searchParams.get('tag') ?? 'all'

  if (tag === 'predictions' || tag === 'all') revalidateTag('predictions', {})
  if (tag === 'results'     || tag === 'all') revalidateTag('results', {})
  if (tag === 'leaderboard' || tag === 'all') revalidateTag('leaderboard', {})

  return NextResponse.json({ revalidated: true, tag })
}
