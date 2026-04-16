import { Icon } from '@iconify/react'

import VideoEmbed from '@/components/VideoEmbed'
import { config } from '@/config/site.config'
import { talkList } from '@/config/talks.config'
import { formatDateZh } from '@/utils/format'

const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
}

export default function TalkMoments() {
  const sortedTalks = [...talkList]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 30)

  return (
    <section className="gh-card moments-card">
      <div className="card-header">
        <Icon icon="ph:chat-circle-text" className="card-h-icon" />
        <span className="card-h-title">说说</span>
      </div>

      <div className="card-body moments-body">
        <p className="moments-intro">记录生活点滴，一些想法。</p>

        {sortedTalks.length ? (
          <div className="talk-list gh-timeline">
            {sortedTalks.map((talk, index) => (
              <div
                key={`${talk.date}-${talk.location || 'talk'}-${talk.text.slice(0, 24)}`}
                className="gh-timeline-item"
              >
                <div className="gh-timeline-avatar">
                  <img src={config.avatarUrl} alt={config.name} loading="lazy" width="40" height="40" decoding="async" />
                </div>

                <article className="gh-comment-bubble">
                  <div className="bubble-header">
                    <span className="bubble-nick">
                      {config.name}
                      <Icon className="verified" icon="material-symbols:verified-rounded" />
                    </span>
                    <span className="bubble-action">发表了动态</span>
                    <span className="bubble-date">on {formatDateZh(talk.date, true)}</span>
                    <span className="talk-serial">#{String(sortedTalks.length - index).padStart(2, '0')}</span>
                  </div>

                  <div className="bubble-body">
                    <div className="talk-content">
                      {talk.text ? (
                        <div className="text" dangerouslySetInnerHTML={{ __html: renderTalkText(talk.text) }} />
                      ) : null}

                      {talk.images?.length ? (
                        <div className="images">
                          {talk.images.map((image, imageIndex) => (
                            <div key={`${talk.date}-${image}`} className="image">
                              <img
                                src={image}
                                alt={`说说配图 ${imageIndex + 1}`}
                                loading="lazy"
                                width="400"
                                height="400"
                                decoding="async"
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {talk.video ? <VideoEmbed className="talk-video" {...talk.video} /> : null}
                    </div>

                    {talk.tags?.length || talk.location ? (
                      <div className="talk-bottom">
                        <div className="tags">
                          {(talk.tags || []).map(tag => (
                            <span key={tag} className="tag">
                              <Icon icon="tabler:tag" />
                              <span>{tag}</span>
                            </span>
                          ))}

                          {talk.location ? (
                            <a
                              className="location"
                              href={`https://bing.com/maps?q=${encodeURIComponent(talk.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`搜索 ${talk.location}`}
                            >
                              <Icon icon="tabler:map-pin-filled" />
                              <span>{talk.location}</span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              </div>
            ))}
          </div>
        ) : (
          <div className="moments-empty">暂时还没有说说内容。</div>
        )}

        <div className="talk-footer">当前展示 {sortedTalks.length} 条记录</div>
      </div>
    </section>
  )
}

function renderTalkText(value: string) {
  return value
    .replace(/[&<>"']/g, character => htmlEscapeMap[character] || character)
    .replace(/\n/g, '<br>')
}
