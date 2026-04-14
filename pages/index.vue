<template>
  <div class="gh-wrapper">
    <ThemeToggle class="fixed-toggle" />
    
    <main class="gh-main">
      <HomeProfileSidebar />

      <!-- === RIGHT CONTENT === -->
      <div class="gh-content">
        <HomeTabsNav :tabs="tabs" :active-tab="activeTab" @update:active-tab="activeTab = $event" />

        <!-- ========== TAB: Overview ========== -->
        <div v-show="activeTab === 'overview'">
          <HomeOverviewPanel />
        </div>

        <!-- ========== TAB: Article ========== -->
        <div v-show="activeTab === 'article'">
          <ArticleFeed />
        </div>

        <!-- ========== TAB: Focus ========== -->
        <div v-show="activeTab === 'focus'">
          <HomeFocusPanel />
        </div>

        <!-- ========== TAB: Talk ========== -->
        <div v-show="activeTab === 'talk'">
          <TalkMoments />
        </div>

        <!-- ========== TAB: Anime ========== -->
        <div v-show="activeTab === 'anime'">
          <AnimeTracker />
        </div>

        <!-- ========== TAB: Hot ========== -->
        <div v-show="activeTab === 'hot'">
          <HotDashboard />
        </div>

        <HomePageFooter />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead } from '#imports'
import { createHomeTabs } from '~/config/homepage.ui'
import type { HomeTabKey } from '~/config/homepage.types'
import { animeList, todoList } from '~/config/site.config'
import { talkList } from '~/config/talks.config'

useHead({ title: '序栈集', htmlAttrs: { lang: 'zh-CN' } })

const activeTab = ref<HomeTabKey>('overview')
const tabs = computed(() => createHomeTabs({
  talkCount: talkList.length,
  animeCount: animeList.length,
  focusCount: todoList.length
}))
</script>
