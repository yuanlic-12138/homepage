import { animeList } from '~/config/site.config'

type LocalAnime = (typeof animeList)[number]

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

const BANGUMI_API = 'https://api.bgm.tv'
const BANGUMI_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Cotovo/1.0 (https://cotovo.local)'
}

const SUMMARY_FALLBACK = '暂时还没有同步到官方简介。'

export default defineEventHandler(async () => {
  const items = sortAnimeCards(
    await mapWithConcurrency(animeList, 4, fetchAnimeCard)
  )

  return {
    updatedAt: new Date().toISOString(),
    source: 'bangumi',
    items
  }
})

async function fetchAnimeCard(anime: LocalAnime) {
  try {
    // 优先使用精确 ID 直取，彻底消除搜索歧义
    if (anime.bangumiId) {
      const subject = await fetchSubjectById(anime.bangumiId)
      if (subject) {
        return normalizeAnimeCard(anime, subject)
      }
    }

    // 无 ID 时回退搜索
    const candidates = buildSearchKeywords(anime)
    for (const keyword of candidates) {
      const results = await searchBangumi(keyword)
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

async function fetchSubjectById(id: number) {
  const response = await fetch(`${BANGUMI_API}/v0/subjects/${id}`, {
    headers: BANGUMI_HEADERS
  })

  if (!response.ok) {
    return null
  }

  return await response.json() as BangumiSubject
}

async function searchBangumi(keyword: string) {
  const response = await fetch(`${BANGUMI_API}/v0/search/subjects?limit=5`, {
    method: 'POST',
    headers: BANGUMI_HEADERS,
    body: JSON.stringify({
      keyword,
      sort: 'match',
      filter: { type: [2] }
    })
  })

  if (!response.ok) {
    throw new Error(`Bangumi search failed: ${response.status}`)
  }

  const payload = await response.json() as BangumiSearchResponse
  return payload.data ?? []
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

  if (candidates.some((item) => item.includes(normalizedKeyword) || normalizedKeyword.includes(item))) {
    score += 40
  }

  return score
}

function normalizeAnimeCard(anime: LocalAnime, subject: BangumiSubject) {
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

function buildFallbackCard(anime: LocalAnime) {
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
  return [...items].sort((left, right) => {
    return getStatusPriority(left.status) - getStatusPriority(right.status)
  })
}

function getStatusPriority(status?: string) {
  return status === '更新中' ? 0 : 1
}

function getHeat(collection?: BangumiSubject['collection']) {
  if (!collection) {
    return 0
  }

  return (
    (collection.doing || 0) +
    (collection.collect || 0)
  )
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

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  )

  return results
}
