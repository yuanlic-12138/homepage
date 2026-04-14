<template>
  <section class="gh-card">
    <div class="card-header" style="justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <Icon icon="ph:television" class="card-h-icon" />
        <span class="card-h-title">追番记录</span>
      </div>
      <button class="anime-refresh-btn" @click="refresh()" title="刷新">
        <Icon icon="ph:arrows-clockwise" />
      </button>
    </div>

    <div class="card-body anime-body">
      <div v-if="pending" class="anime-status">
        <Icon icon="ph:spinner-gap" class="spinner" /> 正在同步档案...
      </div>

      <div v-else-if="error" class="anime-status error">
        <Icon icon="ph:warning-circle" /> 档案加载失败
      </div>

      <div v-else class="anime-list">
        <article v-for="anime in animeItems" :key="`${anime.name}-${anime.id || 'local'}`" class="repo-row">
          <div class="repo-main">
            <h3 class="repo-title">
              <a
                v-if="anime.url"
                :href="anime.url"
                target="_blank"
                rel="noreferrer"
                class="repo-link"
              >
                {{ anime.name }}
              </a>
              <span v-else class="repo-link-fallback">{{ anime.name }}</span>
            </h3>
            <p class="repo-desc">{{ anime.summary }}</p>
            <div class="repo-meta">
              <span class="meta-item">
                <span :class="['repo-language-color', anime.status === '完结' ? 'is-completed' : 'is-updating']"></span>
                <span class="meta-text">{{ anime.status || '番剧' }}</span>
              </span>
              <span class="meta-item">
                <Icon icon="ph:star" class="meta-icon" />
                <span class="meta-text">{{ formatCount(anime.heat) }}</span>
              </span>
              <span class="meta-item">
                <Icon icon="ph:film-strip" class="meta-icon" />
                <span class="meta-text">{{ anime.totalEpisodes || '未知' }} 集</span>
              </span>
            </div>
          </div>
          
          <div class="repo-side">
            <a v-if="anime.url" :href="anime.url" target="_blank" rel="noreferrer" class="repo-cover-link">
              <img :src="anime.cover" :alt="anime.name" class="repo-cover" loading="lazy" />
            </a>
            <div v-else class="repo-cover-link">
              <img :src="anime.cover" :alt="anime.name" class="repo-cover" loading="lazy" />
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

type AnimeCard = {
  id: number | null
  name: string
  cover: string
  summary: string
  heat: number
  totalEpisodes: number
  status?: string
  url: string
  source: 'bangumi' | 'local'
}

const { data, pending, error, refresh } = await useFetch('/api/anime-feed', {
  default: () => ({
    items: [] as AnimeCard[]
  })
})

const animeItems = computed(() => data.value?.items ?? [])

function formatCount(value: number) {
  if (!value) {
    return '0'
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }

  return new Intl.NumberFormat('zh-CN').format(value)
}
</script>

<style scoped>
.anime-refresh-btn {
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

.anime-refresh-btn:hover {
  color: var(--gh-fg);
  background-color: var(--gh-canvas-subtle);
}

.anime-body {
  padding: 0; /* Reset default padding to create a flat list layout */
  display: flex;
  flex-direction: column;
}

.anime-status {
  padding: 40px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--gh-fg-muted);
  font-size: 14px;
  min-height: 120px;
}

.anime-status.error {
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

.anime-list {
  display: flex;
  flex-direction: column;
}

.repo-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--gh-border-muted);
}

.repo-row:last-child {
  border-bottom: none;
}

.repo-main {
  flex: 1;
  min-width: 0; /* Allow text ellipsis to work */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.repo-title {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 600;
  word-break: break-word;
}

.repo-link {
  color: var(--gh-accent-fg);
  text-decoration: none;
}

.repo-link:hover {
  text-decoration: underline;
}

.repo-link-fallback {
  color: var(--gh-fg);
}

.repo-desc {
  margin: 0 0 10px 0;
  color: var(--gh-fg-muted);
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.repo-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--gh-fg-muted);
}

.repo-language-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--gh-border-muted);
  flex-shrink: 0;
}

.repo-language-color.is-completed {
  background-color: #8250df;
}

.repo-language-color.is-updating {
  background-color: #2da44e;
}

.meta-icon {
  font-size: 14px;
}

.repo-side {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.repo-cover-link {
  display: block;
  width: 60px;
  height: 80px;
  border-radius: 6px;
  border: 1px solid var(--gh-border-muted);
  overflow: hidden;
  background: var(--gh-canvas-subtle);
}

.repo-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.repo-cover-link:hover .repo-cover {
  transform: scale(1.05);
}

@media (max-width: 720px) {
  .repo-row {
    padding: 12px;
  }
  
  .repo-title {
    font-size: 16px;
  }

  .repo-cover-link {
    width: 48px;
    height: 64px;
  }
}
</style>
