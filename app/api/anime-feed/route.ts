import { NextResponse } from 'next/server'

import { getAnimeFeed } from '@/lib/anime-feed'

export async function GET() {
  try {
    const data = await getAnimeFeed()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200'
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Anime feed request failed'

    return NextResponse.json(
      { message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  }
}
