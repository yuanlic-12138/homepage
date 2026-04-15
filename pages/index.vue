<template>
  <div class="gh-wrapper">
    <ThemeToggle class="fixed-toggle" />

    <main class="gh-main">
      <HomeProfileSidebar />

      <div class="gh-content">
        <HomeTabsNav :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

        <section
          v-show="activeTab === 'overview'"
          id="panel-overview"
          role="tabpanel"
          aria-labelledby="tab-overview"
          :tabindex="activeTab === 'overview' ? 0 : -1"
        >
          <HomeOverviewPanel />
        </section>

        <section
          v-show="activeTab === 'article'"
          id="panel-article"
          role="tabpanel"
          aria-labelledby="tab-article"
          :tabindex="activeTab === 'article' ? 0 : -1"
        >
          <ArticleFeed />
        </section>

        <section
          v-show="activeTab === 'focus'"
          id="panel-focus"
          role="tabpanel"
          aria-labelledby="tab-focus"
          :tabindex="activeTab === 'focus' ? 0 : -1"
        >
          <HomeFocusPanel />
        </section>

        <section
          v-show="activeTab === 'talk'"
          id="panel-talk"
          role="tabpanel"
          aria-labelledby="tab-talk"
          :tabindex="activeTab === 'talk' ? 0 : -1"
        >
          <TalkMoments />
        </section>

        <section
          v-show="activeTab === 'anime'"
          id="panel-anime"
          role="tabpanel"
          aria-labelledby="tab-anime"
          :tabindex="activeTab === 'anime' ? 0 : -1"
        >
          <AnimeTracker />
        </section>

        <section
          v-show="activeTab === 'hot'"
          id="panel-hot"
          role="tabpanel"
          aria-labelledby="tab-hot"
          :tabindex="activeTab === 'hot' ? 0 : -1"
        >
          <HotDashboard />
        </section>

        <HomePageFooter />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead, useRuntimeConfig, useSeoMeta } from '#imports'
import { createHomeTabs } from '~/config/homepage.ui'
import type { HomeTabKey } from '~/config/homepage.types'
import { animeList, todoList } from '~/config/site.config'
import { talkList } from '~/config/talks.config'

const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl
const ogImage = new URL(runtimeConfig.public.defaultOgImage, siteUrl).toString()

useSeoMeta({
  title: '序栈集',
  description: runtimeConfig.public.siteDescription,
  keywords: runtimeConfig.public.siteKeywords,
  author: runtimeConfig.public.author,
  ogTitle: '序栈集',
  ogDescription: runtimeConfig.public.siteDescription,
  ogImage,
  ogUrl: siteUrl,
  ogType: 'website',
  ogSiteName: runtimeConfig.public.siteName,
  ogLocale: 'zh_CN',
  twitterCard: 'summary_large_image',
  twitterTitle: '序栈集',
  twitterDescription: runtimeConfig.public.siteDescription,
  twitterImage: ogImage
})

useHead({
  link: [
    { rel: 'canonical', href: siteUrl }
  ]
})

const activeTab = ref<HomeTabKey>('overview')
const tabs = computed(() => createHomeTabs({
  talkCount: talkList.length,
  animeCount: animeList.length,
  focusCount: todoList.length
}))
</script>
