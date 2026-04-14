import { XMLParser } from 'fast-xml-parser'

type ParsedRss = {
  rss?: {
    channel?: {
      title?: string
      link?: string
      lastBuildDate?: string
      item?: Array<{
        title?: string
        link?: string
        description?: string
        pubDate?: string
        guid?: string
      }>
    }
  }
}

const RSS_URL = 'https://blog.coet.ink/rss.xml'
const RSS_HEADERS = {
  'User-Agent': 'Cotovo/1.0 (https://cotovo.local)'
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '$',
  isArray: (name) => name === 'item',
  parseTagValue: true,
  trimValues: true
})

export default defineEventHandler(async () => {
  const response = await fetch(RSS_URL, {
    headers: RSS_HEADERS
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: `RSS feed request failed: ${response.status}`
    })
  }

  const payload = parser.parse(await response.text()) as ParsedRss
  const channel = payload.rss?.channel
  const items = (channel?.item ?? []).map(item => ({
    id: item.guid || item.link || item.title || crypto.randomUUID(),
    title: item.title || '未命名文章',
    url: item.link || '',
    summary: sanitizeSummary(item.description),
    publishedAt: item.pubDate || ''
  }))

  return {
    sourceTitle: channel?.title || '博客文章',
    sourceLink: channel?.link || RSS_URL,
    updatedAt: channel?.lastBuildDate || '',
    items
  }
})

function sanitizeSummary(value?: string) {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, '\'')
    .replace(/\s+/g, ' ')
    .trim()
}
