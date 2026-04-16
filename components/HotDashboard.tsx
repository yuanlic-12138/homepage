'use client'

import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'

import { hotPlatforms } from '@/config/hot.config'
import type { HotPlatform } from '@/config/hot.config'
import { formatNumberWithSeparator, formatRelativeHours } from '@/utils/format'

type HotItem = {
  id?: string | number
  title?: string
  desc?: string
  url?: string
  mobileUrl?: string
  author?: string
  hot?: string | number
}

type HotResponse = {
  total?: number
  updateTime?: string
  data?: HotItem[]
}

const defaultHotResponse: HotResponse = {
  total: 0,
  updateTime: '',
  data: []
}

export default function HotDashboard() {
  const [currentPlatform, setCurrentPlatform] = useState<HotPlatform>(hotPlatforms[0])
  const [hotData, setHotData] = useState<HotResponse>(defaultHotResponse)
  const [pending, setPending] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    const load = async () => {
      setPending(true)
      setError(false)

      try {
        const payload = await fetchHotFeed(currentPlatform.id, controller.signal)
        if (!cancelled) {
          setHotData(payload)
        }
      } catch {
        if (!cancelled && !controller.signal.aborted) {
          setError(true)
        }
      } finally {
        if (!cancelled && !controller.signal.aborted) {
          setPending(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [currentPlatform.id])

  async function refresh() {
    setPending(true)
    setError(false)

    try {
      const payload = await fetchHotFeed(currentPlatform.id)
      setHotData(payload)
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  const relativeUpdateText = formatRelativeHours(hotData.updateTime)

  return (
    <div className="hot-dashboard">
      <section className="gh-card hot-main-card">
        <div className="hot-card-header">
          <div className="header-top">
            <div className="header-left">
              <Icon
                icon={currentPlatform.icon}
                className="platform-icon"
                style={{ color: currentPlatform.color }}
              />
              <div className="platform-titles">
                <span className="platform-name">{currentPlatform.name}</span>
                <span className="platform-tag">实时热榜</span>
              </div>
            </div>
            {hotData.updateTime ? (
              <div className="header-right">共 {hotData.total || 0} 条 · {relativeUpdateText}前更新</div>
            ) : null}
          </div>

          <div className="platform-pills">
            {hotPlatforms.map(platform => (
              <button
                key={platform.id}
                className={['platform-pill', currentPlatform.id === platform.id ? 'active' : ''].join(' ').trim()}
                onClick={() => setCurrentPlatform(platform)}
                style={
                  currentPlatform.id === platform.id
                    ? {
                        backgroundColor: `${platform.color}15`,
                        color: platform.color,
                        borderColor: `${platform.color}30`
                      }
                    : undefined
                }
              >
                <Icon icon={platform.icon} className="pill-icon" />
                {platform.name}
              </button>
            ))}
          </div>
        </div>

        <div className="hot-card-body">
          {pending ? (
            <div className="status-box">数据加载中...</div>
          ) : error ? (
            <div className="status-box error-box">
              <p>加载异常，请稍后重试</p>
              <button className="retry-btn" onClick={refresh}>
                重新加载
              </button>
            </div>
          ) : hotData.data?.length ? (
            <div className="hot-list">
              {hotData.data.map((item, index) => (
                <a
                  key={item.id || item.url || item.mobileUrl || item.title || index}
                  href={item.url || item.mobileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hot-item-link"
                >
                  <div className={`rank-badge rank-${index + 1}`}>{index + 1}</div>
                  <div className="item-content">
                    <div className="item-title">{item.title}</div>
                    {item.desc && item.desc !== item.title ? <div className="item-desc">{item.desc}</div> : null}
                    <div className="item-meta">
                      {item.author ? <span className="meta-item">作者：{item.author}</span> : null}
                      {item.hot ? (
                        <span className="meta-item">热度：{formatNumberWithSeparator(item.hot)}</span>
                      ) : null}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="status-box">暂无实时数据</div>
          )}
        </div>
      </section>
    </div>
  )
}

async function fetchHotFeed(platformId: string, signal?: AbortSignal) {
  const response = await fetch(`/api/hot/${platformId}`, {
    cache: 'no-store',
    signal
  })

  if (!response.ok) {
    throw new Error('Hot feed request failed')
  }

  const payload = (await response.json()) as HotResponse

  return {
    total: payload.total || 0,
    updateTime: payload.updateTime || '',
    data: payload.data ?? []
  } satisfies HotResponse
}
