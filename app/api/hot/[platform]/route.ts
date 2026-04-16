import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  context: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await context.params
    const response = await fetch(`https://hot-api.liiiu.cn/${platform}?cache=true`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Cotovo/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Hot feed request failed: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Hot feed request failed'

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
