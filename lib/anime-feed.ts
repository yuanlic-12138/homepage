import { animeList } from '@/config/site.config'
import { getBangumiApiBase, publicSiteConfig } from '@/lib/site'

type LocalAnime = (typeof animeList)[number]

export type AnimeCard = {
  id: number | null
  name: string
  cover: string
  summary: string
  heat: number
  totalEpisodes: number
  status?: string
  url: string
  source: 'bangumi' | 'local'
}

type BangumiSubject = {
  id: number
  name?: string
  name_cn?: string
  summary?: string
  image?: string
  images?: {
    common?: string
    medium?: string
    large?: string
  }
  total_episodes?: number
  eps?: number
  collection?: {
    doing?: number
    collect?: number
    wish?: number
    on_hold?: number
    dropped?: number
  }
}

type BangumiSearchResponse = {
  data?: BangumiSubject[]
}

export type AnimeFeedResponse = {
  updatedAt: string
  source: 'bangumi'
  items: AnimeCard[]
}

const CACHE_TTL = 60 * 60 * 1000
const SUMMARY_FALLBACK = '暂时还没有同步到官方简介。'

let cacheEntry: { expiresAt: number; data: AnimeFeedResponse } | null = null

export const defaultAnimeFeed: AnimeFeedResponse = {
  updatedAt: '',
  source: 'bangumi',
  items: []
}

export async function getAnimeFeed(): Promise<AnimeFeedResponse> {
  const now = Date.now()
  if (cacheEntry && cacheEntry.expiresAt > now) {
    return cacheEntry.data
  }

  const requestOptions = {
    apiBaseUrl: getBangumiApiBase(),
    siteUrl: publicSiteConfig.siteUrl
  }

  const items = sortAnimeCards(
    await mapWithConcurrency(animeList, 4, anime => fetchAnimeCard(anime, requestOptions))
  )

  const response: AnimeFeedResponse = {
    updatedAt: new Date().toISOString(),
    source: 'bangumi',
    items
  }

  cacheEntry = {
    data: response,
    expiresAt: now + CACHE_TTL
  }

  return response
}

async function fetchAnimeCard(
  anime: LocalAnime,
  requestOptions: { apiBaseUrl: string; siteUrl: string }
): Promise<AnimeCard> {
  try {
    if (anime.bangumiId) {
      const subject = await fetchSubjectById(anime.bangumiId, requestOptions)
      if (subject) {
        return normalizeAnimeCard(anime, subject)
      }
    }

    const candidates = buildSearchKeywords(anime)
    for (const keyword of candidates) {
      const results = await searchBangumi(keyword, requestOptions)
      const subject = pickBestSubject(results, keyword)
      if (subject) {
        return normalizeAnimeCard(anime, subject)
      }
    }
  } catch {
    // 上游不可用时使用本地数据
  }

  return buildFallbackCard(anime)
}

async function fetchSubjectById(
  id: number,
  requestOptions: { apiBaseUrl: string; siteUrl: string }
) {
  const response = await fetch(`${requestOptions.apiBaseUrl}/v0/subjects/${id}`, {
    cache: 'no-store',
    headers: createBangumiHeaders(requestOptions.siteUrl)
  })

  if (!response.ok) {
    return null
  }

  return (await response.json()) as BangumiSubject
}

async function searchBangumi(
  keyword: string,
  requestOptions: { apiBaseUrl: string; siteUrl: string }
) {
  const response = await fetch(`${requestOptions.apiBaseUrl}/v0/search/subjects?limit=5`, {
    method: 'POST',
    cache: 'no-store',
    headers: createBangumiHeaders(requestOptions.siteUrl),
    body: JSON.stringify({
      keyword,
      sort: 'match',
      filter: { type: [2] }
    })
  })

  if (!response.ok) {
    throw new Error(`Bangumi search failed: ${response.status}`)
  }

  const payload = (await response.json()) as BangumiSearchResponse
  return payload.data ?? []
}

function createBangumiHeaders(siteUrl: string) {
  return {
    'Content-Type': 'application/json',
    Origin: siteUrl,
    Referer: siteUrl,
    'User-Agent': `Cotovo/1.0 (+${siteUrl})`
  }
}

function buildSearchKeywords(anime: LocalAnime) {
  const keywords = new Set<string>()
  keywords.add(anime.name)
  keywords.add(
    anime.name
      .replace(/第1季/g, '第一季')
      .replace(/第2季/g, '第二季')
      .replace(/第3季/g, '第三季')
      .replace(/第4季/g, '第四季')
      .replace(/第5季/g, '第五季')
      .replace(/第6季/g, '第六季')
      .replace(/II/g, '2')
  )

  return Array.from(keywords).filter(Boolean)
}

function pickBestSubject(subjects: BangumiSubject[], keyword: string) {
  if (!subjects.length) {
    return null
  }

  const normalizedKeyword = normalizeText(keyword)

  return [...subjects].sort((left, right) => {
    return scoreSubject(right, normalizedKeyword) - scoreSubject(left, normalizedKeyword)
  })[0]
}

function scoreSubject(subject: BangumiSubject, normalizedKeyword: string) {
  const candidates = [subject.name_cn, subject.name].filter(Boolean).map(normalizeText)
  let score = 0

  if (candidates.includes(normalizedKeyword)) {
    score += 100
  }

  if (candidates.some(item => item.includes(normalizedKeyword) || normalizedKeyword.includes(item))) {
    score += 40
  }

  return score
}

function normalizeAnimeCard(anime: LocalAnime, subject: BangumiSubject): AnimeCard {
  return {
    id: subject.id,
    name: anime.name,
    cover: subject.images?.large || subject.images?.medium || subject.images?.common || subject.image || '',
    summary: subject.summary?.trim() || SUMMARY_FALLBACK,
    heat: getHeat(subject.collection),
    totalEpisodes: resolveTotalEpisodes(anime, subject),
    status: resolveAnimeStatus(anime),
    url: `https://bgm.tv/subject/${subject.id}`,
    source: 'bangumi'
  }
}

function buildFallbackCard(anime: LocalAnime): AnimeCard {
  return {
    id: null,
    name: anime.name,
    cover: '',
    summary: SUMMARY_FALLBACK,
    heat: 0,
    totalEpisodes: anime.total,
    status: resolveAnimeStatus(anime),
    url: '',
    source: 'local'
  }
}

function getEpisodeCount(subject: BangumiSubject) {
  return subject.total_episodes || subject.eps || 0
}

function resolveTotalEpisodes(anime: LocalAnime, subject: BangumiSubject) {
  const subjectEpisodes = getEpisodeCount(subject)
  return Math.max(subjectEpisodes, anime.total || 0)
}

function resolveAnimeStatus(anime: LocalAnime) {
  if (anime.status) {
    return anime.status
  }

  return (anime.current || 0) >= (anime.total || 1) ? '完结' : '更新中'
}

function sortAnimeCards<T extends { status?: string }>(items: T[]) {
  return [...items].sort((left, right) => getStatusPriority(left.status) - getStatusPriority(right.status))
}

function getStatusPriority(status?: string) {
  return status === '更新中' ? 0 : 1
}

function getHeat(collection?: BangumiSubject['collection']) {
  if (!collection) {
    return 0
  }

  return (collection.doing || 0) + (collection.collect || 0)
}

function normalizeText(value?: string) {
  return (value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[·:：_\-—]/g, '')
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>
) {
  const results = new Array<R>(items.length)
  let currentIndex = 0

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++
      results[index] = await mapper(items[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))

  return results
}
