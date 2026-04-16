import { NextResponse } from 'next/server'

import { getArticleFeed } from '@/lib/article-feed'

export async function GET() {
  try {
    const data = await getArticleFeed()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Article feed request failed'

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
