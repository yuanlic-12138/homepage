'use client'

import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'

import type { AnimeFeedResponse } from '@/lib/anime-feed'
import { formatCompactCount } from '@/utils/format'

type AnimeTrackerProps = {
  initialData: AnimeFeedResponse
}

export default function AnimeTracker({ initialData }: AnimeTrackerProps) {
  const [feedData, setFeedData] = useState<AnimeFeedResponse>(initialData)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (initialData.items.length) {
      return
    }

    let cancelled = false

    const load = async () => {
      setPending(true)
      setError(false)

      try {
        const payload = await fetchAnimeFeed()
        if (!cancelled) {
          setFeedData(payload)
        }
      } catch {
        if (!cancelled) {
          setError(true)
        }
      } finally {
        if (!cancelled) {
          setPending(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [initialData.items.length])

  const animeItems = feedData.items ?? []

  async function refreshFeed() {
    if (pending || isRefreshing) {
      return
    }

    setIsRefreshing(true)
    setError(false)

    try {
      const payload = await fetchAnimeFeed()
      setFeedData(payload)
    } catch {
      setError(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <section className="gh-card">
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon icon="ph:television" className="card-h-icon" />
          <span className="card-h-title">追番记录</span>
        </div>
        <button
          className="anime-refresh-btn"
          type="button"
          disabled={pending || isRefreshing}
          aria-label="刷新追番记录"
          title="刷新追番记录"
          onClick={refreshFeed}
        >
          <Icon icon="ph:arrows-clockwise" />
        </button>
      </div>

      <div className="card-body anime-body">
        {pending ? (
          <div className="anime-status">
            <Icon icon="ph:spinner-gap" className="spinner" /> 正在同步档案...
          </div>
        ) : error ? (
          <div className="anime-status error">
            <Icon icon="ph:warning-circle" /> 档案加载失败
          </div>
        ) : (
          <div className="anime-list">
            {animeItems.map(anime => (
              <article key={`${anime.name}-${anime.id || 'local'}`} className="repo-row">
                <div className="repo-main">
                  <h3 className="repo-title">
                    {anime.url ? (
                      <a href={anime.url} target="_blank" rel="noreferrer" className="repo-link">
                        {anime.name}
                      </a>
                    ) : (
                      <span className="repo-link-fallback">{anime.name}</span>
                    )}
                  </h3>
                  <p className="repo-desc">{anime.summary}</p>
                  <div className="repo-meta">
                    <span className="meta-item">
                      <span
                        className={[
                          'repo-language-color',
                          anime.status === '完结' ? 'is-completed' : 'is-updating'
                        ].join(' ')}
                      />
                      <span className="meta-text">{anime.status || '番剧'}</span>
                    </span>
                    <span className="meta-item">
                      <Icon icon="ph:star" className="meta-icon" />
                      <span className="meta-text">{formatCompactCount(anime.heat)}</span>
                    </span>
                    <span className="meta-item">
                      <Icon icon="ph:film-strip" className="meta-icon" />
                      <span className="meta-text">{anime.totalEpisodes || '未知'} 集</span>
                    </span>
                  </div>
                </div>

                <div className="repo-side">
                  {anime.url ? (
                    <a href={anime.url} target="_blank" rel="noreferrer" className="repo-cover-link">
                      <img
                        src={anime.cover || '/og-image.jpg'}
                        alt={anime.name}
                        className="repo-cover"
                        loading="lazy"
                        width="60"
                        height="80"
                        decoding="async"
                      />
                    </a>
                  ) : (
                    <div className="repo-cover-link">
                      <img
                        src={anime.cover || '/og-image.jpg'}
                        alt={anime.name}
                        className="repo-cover"
                        loading="lazy"
                        width="60"
                        height="80"
                        decoding="async"
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

async function fetchAnimeFeed() {
  const response = await fetch('/api/anime-feed', { cache: 'no-store' })

  if (!response.ok) {
    throw new Error('Anime feed request failed')
  }

  const payload = (await response.json()) as Partial<AnimeFeedResponse>

  return {
    updatedAt: payload.updatedAt || '',
    source: 'bangumi',
    items: payload.items ?? []
  } satisfies AnimeFeedResponse
}
