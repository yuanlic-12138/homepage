<template>
  <div class="hot-dashboard">
    <section class="gh-card hot-main-card">
      <div class="hot-card-header">
        <div class="header-top">
          <div class="header-left">
            <Icon :icon="currentPlatform.icon" class="platform-icon" :style="{ color: currentPlatform.color }" />
            <div class="platform-titles">
              <span class="platform-name">{{ currentPlatform.name }}</span>
              <span class="platform-tag">实时热榜</span>
            </div>
          </div>
          <div class="header-right" v-if="hotData?.updateTime">
            共 {{ hotData.total || 0 }} 条 · {{ relativeUpdateText }}前更新
          </div>
        </div>

        <div class="platform-pills">
          <button 
            v-for="p in platforms" 
            :key="p.id"
            class="platform-pill"
            :class="{ active: currentPlatform.id === p.id }"
            @click="currentPlatform = p"
            :style="currentPlatform.id === p.id ? { backgroundColor: p.color + '15', color: p.color, borderColor: p.color + '30' } : {}"
          >
            <Icon :icon="p.icon" class="pill-icon" />
            {{ p.name }}
          </button>
        </div>
      </div>

      <div class="hot-card-body">
        <div v-if="pending" class="status-box">数据加载中...</div>
        <div v-else-if="error" class="status-box error-box">
          <p>加载异常，请稍后重试</p>
          <button class="retry-btn" @click="refresh()">重新加载</button>
        </div>
        <div v-else-if="hotData?.data?.length" class="hot-list">
          <a 
            v-for="(item, index) in hotData.data" 
            :key="item.id || index"
            :href="item.url || item.mobileUrl"
            target="_blank"
            class="hot-item-link"
          >
            <div class="rank-badge" :class="[`rank-${index + 1}`]">{{ index + 1 }}</div>
            <div class="item-content">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-desc" v-if="item.desc && item.desc !== item.title">{{ item.desc }}</div>
              <div class="item-meta">
                <span v-if="item.author" class="meta-item">作者：{{ item.author }}</span>
                <span v-if="item.hot" class="meta-item">热度：{{ formatHot(item.hot) }}</span>
              </div>
            </div>
          </a>
        </div>
        <div v-else class="status-box">暂无实时数据</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { hotPlatforms } from '~/config/hot.config'
import type { HotPlatform } from '~/config/hot.config'
import { formatNumberWithSeparator, formatRelativeHours } from '~/utils/format'

type HotItem = {
  id?: string | number
  title?: string
  desc?: string
  url?: string
  mobileUrl?: string
  author?: string
  hot?: string | number
}

type HotResponse = {
  total?: number
  updateTime?: string
  data?: HotItem[]
}

const platforms = hotPlatforms
const currentPlatform = ref<HotPlatform>(platforms[0])

const reqUrl = computed(() => `https://hot-api.liiiu.cn/${currentPlatform.value.id}`)

const { data: hotData, pending, error, refresh } = useFetch<HotResponse>(reqUrl, {
  query: { cache: 'true' },
  key: computed(() => `hot-${currentPlatform.value.id}`),
  server: false,
  lazy: true,
  default: () => ({
    total: 0,
    updateTime: '',
    data: []
  } as HotResponse)
})

const relativeUpdateText = computed(() => {
  return formatRelativeHours(hotData.value?.updateTime)
})

const formatHot = (value?: string | number) => {
  if (!value && value !== 0) {
    return ''
  }

  return formatNumberWithSeparator(value)
}
</script>

<style scoped>
.hot-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.platform-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
}

.platform-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--gh-fg-muted);
  background: var(--gh-bg-subtle);
  border: 1px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  outline: none;
}

.platform-pill:hover {
  background: var(--gh-border-muted);
  color: var(--gh-fg);
}

.platform-pill.active {
  font-weight: 600;
}

.pill-icon {
  font-size: 15px;
}

.hot-main-card {
  padding: 24px;
}

.hot-card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  border-bottom: 1px solid var(--gh-border-muted);
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-icon {
  font-size: 32px;
}

.platform-titles {
  display: flex;
  flex-direction: column;
}

.platform-name {
  font-size: 16px;
  font-weight: bold;
  color: var(--gh-fg);
}

.platform-tag {
  font-size: 12px;
  color: var(--gh-fg-muted);
}

.header-right {
  font-size: 12px;
  color: var(--gh-fg-muted);
}

.hot-card-body {
  height: 560px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.hot-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 8px;
}

.hot-item-link {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px dashed var(--gh-border-muted);
  text-decoration: none;
  transition: background-color 0.2s;
  color: inherit;
}

.hot-item-link:hover {
  background-color: var(--gh-bg-subtle);
  border-radius: 6px;
  padding: 16px 8px;
  margin: 0 -8px;
}

.hot-item-link:last-child {
  border-bottom: none;
}

.rank-badge {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gh-bg-subtle);
  color: var(--gh-fg-muted);
  font-size: 13px;
  font-weight: bold;
  border-radius: 6px;
  margin-top: 2px;
}

.rank-1 { background-color: #ef4444; color: #fff; }
.rank-2 { background-color: #f97316; color: #fff; }
.rank-3 { background-color: #eab308; color: #fff; }

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--gh-fg);
  line-height: 1.4;
}

.item-desc {
  font-size: 13px;
  color: var(--gh-fg-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--gh-fg-muted);
}

.status-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--gh-fg-muted);
}

.retry-btn {
  margin-top: 12px;
  padding: 6px 16px;
  border: 1px solid var(--gh-border);
  border-radius: 4px;
  background: var(--gh-bg);
  color: var(--gh-fg);
  cursor: pointer;
}

/* ====== RESPONSIVE ====== */
@media (max-width: 768px) {
  .header-top {
    flex-wrap: wrap;
    gap: 8px;
  }
  .platform-pills {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
  }
  .platform-pills::-webkit-scrollbar {
    display: none;
  }
  .platform-pill {
    flex-shrink: 0;
    padding: 5px 12px;
    font-size: 12px;
  }
  .hot-main-card {
    padding: 12px;
  }
  .hot-card-header {
    gap: 14px;
    padding-bottom: 12px;
    margin-bottom: 12px;
  }
  .platform-icon {
    font-size: 24px;
  }
  .platform-name {
    font-size: 14px;
  }
  .hot-card-body {
    height: 65vh;
    min-height: 400px;
  }
  .hot-item-link {
    padding: 12px 0;
    gap: 12px;
  }
  .item-title {
    font-size: 14px;
  }
  .item-desc {
    font-size: 12px;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }
}
</style>
