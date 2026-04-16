import { Icon } from '@iconify/react'

import type { HomeTab, HomeTabKey } from '@/config/homepage.types'

type TabsNavProps = {
  tabs: HomeTab[]
  activeTab: HomeTabKey
  onChange: (value: HomeTabKey) => void
}

export default function HomeTabsNav({ tabs, activeTab, onChange }: TabsNavProps) {
  return (
    <nav className="gh-nav" role="tablist" aria-label="主页内容导航">
      {tabs.map(tab => (
        <button
          key={tab.key}
          id={`tab-${tab.key}`}
          type="button"
          className={['nav-item', 'nav-button', activeTab === tab.key ? 'active' : ''].join(' ').trim()}
          role="tab"
          aria-controls={`panel-${tab.key}`}
          aria-selected={activeTab === tab.key}
          aria-label={tab.badge ? `${tab.label}，${tab.badge} 条内容` : tab.label}
          tabIndex={activeTab === tab.key ? 0 : -1}
          onClick={() => onChange(tab.key)}
        >
          <Icon icon={tab.icon} className="nav-ic" />
          {tab.label}
          {tab.badge ? <span className="badge">{tab.badge}</span> : null}
        </button>
      ))}
    </nav>
  )
}
