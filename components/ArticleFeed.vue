<template>
  <section class="gh-card article-feed-card">
    <div class="card-header article-feed-header">
      <div class="article-feed-title-wrap">
        <Icon icon="ph:article-medium" class="card-h-icon" />
        <span class="card-h-title">文章</span>
      </div>

      <button class="article-refresh-btn" @click="refresh()" title="刷新文章">
        <Icon icon="ph:arrows-clockwise" />
      </button>
    </div>

    <div class="card-body article-feed-body">
      <div class="article-feed-top">
        <p class="article-feed-intro">
          来自
          <a :href="feedData.sourceLink || blogHomeUrl" target="_blank" rel="noreferrer">
            {{ feedData.sourceTitle || '博客 RSS' }}
          </a>
          的最新文章
        </p>

        <p v-if="feedData.updatedAt" class="article-feed-updated">
          源更新时间：{{ formatFeedDate(feedData.updatedAt) }}
        </p>
      </div>

      <div v-if="pending" class="article-state">
        <Icon icon="ph:spinner-gap" class="spinner" />
        正在同步文章...
      </div>

      <div v-else-if="error" class="article-state error">
        <Icon icon="ph:warning-circle" />
        文章加载失败
      </div>

      <div v-else-if="articles.length" class="gh-issue-list">
        <a
          v-for="article in articles"
          :key="article.id"
          :href="article.url"
          target="_blank"
          rel="noreferrer"
          class="gh-issue-item"
        >
          <div class="issue-icon-wrap">
            <Icon icon="ph:record-fill" class="issue-icon" />
          </div>
          <div class="issue-content">
            <h3 class="issue-title">{{ article.title }}</h3>
            <div class="issue-meta">
              <span class="meta-id">#{{ article.id ? article.id.toString().slice(0, 5) : 'Feed' }}</span> opened on {{ formatFeedDate(article.publishedAt) }} by {{ feedData.sourceTitle }}
            </div>
          </div>
        </a>
      </div>

      <div v-else class="article-state">暂时还没有文章内容。</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { formatDateZh } from '~/utils/format'

type ArticleFeedItem = {
  id: string
  title: string
  url: string
  summary: string
  publishedAt: string
}

type ArticleFeedResponse = {
  sourceTitle: string
  sourceLink: string
  updatedAt: string
  items: ArticleFeedItem[]
}

const blogHomeUrl = 'https://blog.coet.ink'

const { data, pending, error, refresh } = await useFetch('/api/article-feed', {
  default: () => ({
    sourceTitle: '',
    sourceLink: '',
    updatedAt: '',
    items: [] as ArticleFeedItem[]
  })
})

const feedData = computed<ArticleFeedResponse>(() => {
  return data.value as ArticleFeedResponse
})

const articles = computed(() => feedData.value.items ?? [])

function formatFeedDate(value: string) {
  return formatDateZh(value)
}
</script>

<style scoped>
.article-feed-header {
  justify-content: space-between;
}

.article-feed-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-refresh-btn {
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--gh-fg-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, background-color 0.2s;
}

.article-refresh-btn:hover {
  color: var(--gh-fg);
  background-color: var(--gh-bg-subtle);
}

.article-feed-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-feed-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
}

.article-feed-intro,
.article-feed-updated {
  margin: 0;
  color: var(--gh-fg-muted);
  font-size: 13px;
}

.article-feed-intro a {
  color: var(--gh-accent);
  text-decoration: none;
}

.article-feed-intro a:hover {
  text-decoration: underline;
}

.article-state {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--gh-fg-muted);
  font-size: 14px;
}

.article-state.error {
  color: #cf222e;
}

.spinner {
  animation: spin 1s linear infinite;
  font-size: 18px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gh-issue-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--gh-border);
  border-radius: 6px;
  overflow: hidden;
}

.gh-issue-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  border-bottom: 1px solid var(--gh-border-muted);
  background: var(--gh-bg);
  transition: background-color 0.15s;
}

.gh-issue-item:last-child {
  border-bottom: none;
}

.gh-issue-item:hover {
  background-color: var(--gh-bg-subtle);
}

.issue-icon-wrap {
  flex-shrink: 0;
  margin-top: 2px;
}

.issue-icon {
  color: var(--gh-success);
  font-size: 16px;
}

.issue-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.issue-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gh-fg);
  line-height: 1.3;
}

.issue-title:hover {
  color: var(--gh-accent);
}

.issue-meta {
  font-size: 12px;
  color: var(--gh-fg-muted);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .article-feed-body {
    gap: 12px;
  }

  .gh-issue-item {
    padding: 12px;
  }
}
</style>
