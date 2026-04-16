import { XMLParser } from 'fast-xml-parser'

import { getRssUrl, publicSiteConfig } from '@/lib/site'

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

export type ArticleFeedItem = {
  id: string
  title: string
  url: string
  summary: string
  publishedAt: string
}

export type ArticleFeedResponse = {
  sourceTitle: string
  sourceLink: string
  updatedAt: string
  items: ArticleFeedItem[]
}

const CACHE_TTL = 5 * 60 * 1000
const HTML_ENTITY_MAP: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': '\''
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '$',
  isArray: name => name === 'item',
  parseTagValue: true,
  trimValues: true
})

let cacheEntry: { expiresAt: number; data: ArticleFeedResponse } | null = null

export const defaultArticleFeed: ArticleFeedResponse = {
  sourceTitle: '',
  sourceLink: '',
  updatedAt: '',
  items: []
}

export async function getArticleFeed(): Promise<ArticleFeedResponse> {
  const now = Date.now()
  if (cacheEntry && cacheEntry.expiresAt > now) {
    return cacheEntry.data
  }

  const rssUrl = getRssUrl()
  const response = await fetch(rssUrl, {
    cache: 'no-store',
    headers: {
      'User-Agent': `Cotovo/1.0 (+${publicSiteConfig.siteUrl})`
    }
  })

  if (!response.ok) {
    throw new Error(`RSS feed request failed: ${response.status}`)
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

  const result: ArticleFeedResponse = {
    sourceTitle: channel?.title || '博客文章',
    sourceLink: channel?.link || rssUrl,
    updatedAt: channel?.lastBuildDate || '',
    items
  }

  cacheEntry = {
    data: result,
    expiresAt: now + CACHE_TTL
  }

  return result
}

function sanitizeSummary(value?: string) {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/gi, (_, entity: string) => HTML_ENTITY_MAP[entity.toLowerCase()] || ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
