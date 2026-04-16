'use client'

import { useState } from 'react'

import AnimeTracker from '@/components/AnimeTracker'
import ArticleFeed from '@/components/ArticleFeed'
import HotDashboard from '@/components/HotDashboard'
import TalkMoments from '@/components/TalkMoments'
import HomeFocusPanel from '@/components/home/FocusPanel'
import HomeOverviewPanel from '@/components/home/OverviewPanel'
import HomePageFooter from '@/components/home/PageFooter'
import HomeProfileSidebar from '@/components/home/ProfileSidebar'
import HomeTabsNav from '@/components/home/TabsNav'
import { createHomeTabs } from '@/config/homepage.ui'
import type { HomeTabKey } from '@/config/homepage.types'
import { animeList, todoList } from '@/config/site.config'
import { talkList } from '@/config/talks.config'
import type { AnimeFeedResponse } from '@/lib/anime-feed'
import type { ArticleFeedResponse } from '@/lib/article-feed'

type HomePageProps = {
  initialArticleFeed: ArticleFeedResponse
  initialAnimeFeed: AnimeFeedResponse
  initialNowIso: string
  currentYear: number
}

export default function HomePage({ initialArticleFeed, initialAnimeFeed, initialNowIso, currentYear }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<HomeTabKey>('overview')
  const tabs = createHomeTabs({
    talkCount: talkList.length,
    animeCount: animeList.length,
    focusCount: todoList.length
  })

  return (
    <div className="gh-wrapper">
      <main className="gh-main">
        <HomeProfileSidebar />

        <div className="gh-content">
          <HomeTabsNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="gh-tab-panels">
            <section
              className={`gh-tab-panel ${activeTab === 'overview' ? 'is-active' : 'is-inactive'}`}
              data-panel-key="overview"
              id="panel-overview"
              role="tabpanel"
              aria-hidden={activeTab !== 'overview'}
              aria-labelledby="tab-overview"
              tabIndex={activeTab === 'overview' ? 0 : -1}
            >
              <HomeOverviewPanel initialNowIso={initialNowIso} />
            </section>

            <section
              className={`gh-tab-panel ${activeTab === 'article' ? 'is-active' : 'is-inactive'}`}
              data-panel-key="article"
              id="panel-article"
              role="tabpanel"
              aria-hidden={activeTab !== 'article'}
              aria-labelledby="tab-article"
              tabIndex={activeTab === 'article' ? 0 : -1}
            >
              <ArticleFeed initialData={initialArticleFeed} />
            </section>

            <section
              className={`gh-tab-panel ${activeTab === 'focus' ? 'is-active' : 'is-inactive'}`}
              data-panel-key="focus"
              id="panel-focus"
              role="tabpanel"
              aria-hidden={activeTab !== 'focus'}
              aria-labelledby="tab-focus"
              tabIndex={activeTab === 'focus' ? 0 : -1}
            >
              <HomeFocusPanel />
            </section>

            <section
              className={`gh-tab-panel ${activeTab === 'talk' ? 'is-active' : 'is-inactive'}`}
              data-panel-key="talk"
              id="panel-talk"
              role="tabpanel"
              aria-hidden={activeTab !== 'talk'}
              aria-labelledby="tab-talk"
              tabIndex={activeTab === 'talk' ? 0 : -1}
            >
              <TalkMoments />
            </section>

            <section
              className={`gh-tab-panel ${activeTab === 'anime' ? 'is-active' : 'is-inactive'}`}
              data-panel-key="anime"
              id="panel-anime"
              role="tabpanel"
              aria-hidden={activeTab !== 'anime'}
              aria-labelledby="tab-anime"
              tabIndex={activeTab === 'anime' ? 0 : -1}
            >
              <AnimeTracker initialData={initialAnimeFeed} />
            </section>

            <section
              className={`gh-tab-panel ${activeTab === 'hot' ? 'is-active' : 'is-inactive'}`}
              data-panel-key="hot"
              id="panel-hot"
              role="tabpanel"
              aria-hidden={activeTab !== 'hot'}
              aria-labelledby="tab-hot"
              tabIndex={activeTab === 'hot' ? 0 : -1}
            >
              <HotDashboard />
            </section>
          </div>

          <HomePageFooter currentYear={currentYear} />
        </div>
      </main>
    </div>
  )
}
