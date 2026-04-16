import { Icon } from '@iconify/react'
import ThemeToggle from '@/components/ThemeToggle'
import { config, linkBtns } from '@/config/site.config'

export default function HomeProfileSidebar() {
  return (
    <aside className="gh-vcard">
      {/* 头部核心信息区 */}
      <div className="vcard-header-mobile">
        <div className="vcard-avatar-wrap">
          <img
            src={config.avatarUrl}
            alt={`${config.name} 的头像照片`}
            className="vcard-avatar"
            width="260"
            height="260"
            decoding="async"
          />
          <div className="user-status-badge" title={config.status.message}>
            <span className="status-emoji">{config.status.emoji}</span>
          </div>
        </div>

        <div className="vcard-names">
          <h1 className="vcard-fullname">{config.name}</h1>
          <h2 className="vcard-username">cot.wiki</h2>
        </div>

        <div className="vcard-theme-wrap">
          <ThemeToggle />
        </div>
      </div>

      {/* 个人简介排版 */}
      <div className="vcard-info-content">
        <p className="vcard-bio">项目联系Cotovo@163.com</p>

        <ul className="vcard-details">
          <li>
            <Icon icon="ph:map-pin" className="d-icon" /> {config.infoTags.province}
          </li>
          <li>
            <Icon icon="ph:graduation-cap" className="d-icon" /> {config.infoTags.school}
          </li>
          <li>
            <Icon icon="ph:star" className="d-icon" /> {config.zodiac}
          </li>
          <li>
            <Icon icon="ph:calendar-blank" className="d-icon" /> {config.age}后
          </li>
        </ul>
      </div>

      {/* 社交链接布局 */}
      <div className="vcard-socials-wrapper">
        <div className="profile-divider" />
        <h3 className="social-title">社交链接</h3>
        <div className="social-list">
          {linkBtns.map((link, index) => (
            <a
              key={`${link.text}-${index}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer me"
              className="gh-link social-link"
            >
              <Icon icon={link.icon} className="social-icon" style={{ color: link.color }} />
              <span>{link.text}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
