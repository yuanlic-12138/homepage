import { Icon } from '@iconify/react'

import TimelineCard from '@/components/TimelineCard'
import TypewriterCard from '@/components/TypewriterCard'
import { getTechColor, getTechKind, primaryTechKinds, techBarSegments } from '@/config/homepage.ui'
import { config, techStack } from '@/config/site.config'

export default function HomeOverviewPanel() {
  const primaryTechStack = techStack.filter(item => primaryTechKinds.includes(getTechKind(item.name)))
  const ecosystemTechStack = techStack.filter(item => !primaryTechKinds.includes(getTechKind(item.name)))

  return (
    <>
      <section className="gh-card readme-card">
        <div className="card-header">
          <Icon icon="ph:file-text" className="card-h-icon" />
          <span className="card-h-title">个人简介</span>
        </div>
        <div className="card-body markdown">
          <h2>
            你好 <span className="intro-wave">👋</span>
          </h2>
          <blockquote>
            <TypewriterCard className="flat-tw" />
          </blockquote>
          <p>
            欢迎来到 <b>{config.name}</b> 的数字空间。
          </p>
          <p>{config.professions.join('、')}。正在探索代码与 AI 的交汇点。</p>
        </div>
      </section>

      <section className="gh-card">
        <div className="card-header">
          <Icon icon="ph:terminal-window" className="card-h-icon" />
          <span className="card-h-title">技术栈体系 (Tech Stack)</span>
        </div>
        <div className="card-body">
          <h3 className="section-heading">Languages &amp; Frameworks</h3>
          <div className="gh-lang-bar">
            {techBarSegments.map(segment => (
              <span
                key={segment.name}
                title={`${segment.name} ${segment.width}%`}
                style={{ width: `${segment.width}%`, backgroundColor: segment.color }}
              />
            ))}
          </div>

          <ul className="gh-lang-list section-block">
            {primaryTechStack.map(item => (
              <li key={item.name}>
                <span className="lang-dot" style={{ backgroundColor: getTechColor(item.name) }} />
                <span className="lang-name">{item.name}</span>
              </li>
            ))}
          </ul>

          <h3 className="section-heading">Topics &amp; Ecosystem</h3>
          <div className="topic-list">
            {ecosystemTechStack.map(item => (
              <span key={item.name} className="gh-topic" title={getTechKind(item.name)}>
                <Icon icon={item.icon} className="topic-icon" />
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="gh-card">
        <div className="card-header">
          <Icon icon="ph:clock" className="card-h-icon" />
          <span className="card-h-title">时光进度</span>
        </div>
        <div className="card-body">
          <TimelineCard className="flat-timeline" />
        </div>
      </section>
    </>
  )
}
