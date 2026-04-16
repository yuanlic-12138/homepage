import type { CSSProperties } from 'react'

import type { TalkVideoType } from '@/config/talks.config'

type VideoEmbedProps = {
  id: string
  type?: TalkVideoType
  autoplay?: boolean
  ratio?: string | number
  poster?: string
  width?: string
  height?: string
  className?: string
}

export default function VideoEmbed({
  id,
  type = 'raw',
  autoplay,
  ratio,
  poster,
  width,
  height,
  className
}: VideoEmbedProps) {
  const resolvedRatio = getResolvedRatio(type, ratio)
  const resolvedSrc = getResolvedSrc({ id, type, autoplay })
  const embedTitle = getEmbedTitle(type)

  const style: CSSProperties = {
    aspectRatio: resolvedRatio,
    maxWidth: width,
    maxHeight: height
  }

  return (
    <div className={['video-embed', className].filter(Boolean).join(' ')} style={style}>
      {type === 'raw' ? (
        <video
          className="video-element"
          poster={poster}
          src={resolvedSrc}
          controls
          preload="metadata"
        />
      ) : (
        <iframe
          className="video-element"
          src={resolvedSrc}
          title={embedTitle}
          loading="lazy"
          scrolling="no"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  )
}

function getResolvedRatio(type: TalkVideoType, ratio?: string | number) {
  if (ratio) {
    return ratio
  }

  switch (type) {
    case 'douyin':
      return '27 / 56'
    case 'douyin-wide':
      return '1198 / 731'
    case 'raw':
      return undefined
    default:
      return '16 / 9'
  }
}

function getResolvedSrc(props: { id: string; type: TalkVideoType; autoplay?: boolean }) {
  switch (props.type) {
    case 'bilibili':
      return `https://player.bilibili.com/player.html?bvid=${props.id}&autoplay=${props.autoplay ? 1 : 0}`
    case 'bilibili-nano':
      return `https://www.bilibili.com/blackboard/newplayer.html?bvid=${props.id}&autoplay=${props.autoplay ? 1 : 0}`
    case 'youtube':
      return `https://www.youtube.com/embed/${props.id}?rel=0&disablekb=1&playsinline=1&autoplay=${props.autoplay ? 1 : 0}`
    case 'douyin':
    case 'douyin-wide':
      return `https://open.douyin.com/player/video?vid=${props.id}`
    case 'tiktok':
      return `https://www.tiktok.com/embed/v3/${props.id}`
    default:
      return props.id
  }
}

function getEmbedTitle(type: TalkVideoType) {
  switch (type) {
    case 'bilibili':
    case 'bilibili-nano':
      return 'Bilibili 视频播放器'
    case 'youtube':
      return 'YouTube 视频播放器'
    case 'douyin':
    case 'douyin-wide':
      return '抖音视频播放器'
    case 'tiktok':
      return 'TikTok 视频播放器'
    default:
      return '视频播放器'
  }
}
