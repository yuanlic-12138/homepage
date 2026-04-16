'use client'

import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'

import type { ArticleFeedResponse } from '@/lib/article-feed'
import { publicSiteConfig } from '@/lib/site'
import { formatDateZh } from '@/utils/format'

type ArticleFeedProps = {
  initialData: ArticleFeedResponse
}

export default function ArticleFeed({ initialData }: ArticleFeedProps) {
  const [feedData, setFeedData] = useState<ArticleFeedResponse>(initialData)
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
        const payload = await fetchArticleFeed()
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

  const articles = feedData.items ?? []

  async function refreshFeed() {
    if (pending || isRefreshing) {
      return
    }

    setIsRefreshing(true)
    setError(false)

    try {
      const payload = await fetchArticleFeed()
      setFeedData(payload)
    } catch {
      setError(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <section className="gh-card article-feed-card">
      <div className="card-header article-feed-header">
        <div className="article-feed-title-wrap">
          <Icon icon="ph:article-medium" className="card-h-icon" />
          <span className="card-h-title">文章</span>
        </div>

        <button
          className="article-refresh-btn"
          type="button"
          disabled={pending || isRefreshing}
          aria-label="刷新文章列表"
          title="刷新文章列表"
          onClick={refreshFeed}
        >
          <Icon icon="ph:arrows-clockwise" />
        </button>
      </div>

      <div className="card-body article-feed-body">
        <div className="article-feed-top">
          <p className="article-feed-intro">
            来自{' '}
            <a href={feedData.sourceLink || publicSiteConfig.blogHomeUrl} target="_blank" rel="noreferrer">
              {feedData.sourceTitle || '博客 RSS'}
            </a>{' '}
            的最新文章
          </p>

          {feedData.updatedAt ? (
            <p className="article-feed-updated">源更新时间：{formatDateZh(feedData.updatedAt)}</p>
          ) : null}
        </div>

        {pending ? (
          <div className="article-state">
            <Icon icon="ph:spinner-gap" className="spinner" />
            正在同步文章...
          </div>
        ) : error ? (
          <div className="article-state error">
            <Icon icon="ph:warning-circle" />
            文章加载失败
          </div>
        ) : articles.length ? (
          <div className="gh-issue-list">
            {articles.map(article => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="gh-issue-item"
              >
                <div className="issue-icon-wrap">
                  <Icon icon="ph:record-fill" className="issue-icon" />
                </div>
                <div className="issue-content">
                  <h3 className="issue-title">{article.title}</h3>
                  <div className="issue-meta">
                    <span className="meta-id">#{article.id ? article.id.toString().slice(0, 5) : 'Feed'}</span>{' '}
                    opened on {formatDateZh(article.publishedAt)} by {feedData.sourceTitle}
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="article-state">暂时还没有文章内容。</div>
        )}
      </div>
    </section>
  )
}

async function fetchArticleFeed() {
  const response = await fetch('/api/article-feed', { cache: 'no-store' })

  if (!response.ok) {
    throw new Error('Article feed request failed')
  }

  const payload = (await response.json()) as Partial<ArticleFeedResponse>

  return {
    sourceTitle: payload.sourceTitle || '',
    sourceLink: payload.sourceLink || '',
    updatedAt: payload.updatedAt || '',
    items: payload.items ?? []
  } satisfies ArticleFeedResponse
}
