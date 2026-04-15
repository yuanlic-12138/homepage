<template>
  <section class="gh-card readme-card">
    <div class="card-header">
      <Icon icon="ph:file-text" class="card-h-icon" />
      <span class="card-h-title">个人简介</span>
    </div>
    <div class="card-body markdown">
      <h2>你好 <span class="intro-wave">👋</span></h2>
      <blockquote>
        <TypewriterCard class="flat-tw" />
      </blockquote>
      <p>欢迎来到 <b>{{ config.name }}</b> 的数字空间。</p>
      <p>{{ config.professions.join('、') }}。正在探索代码与 AI 的交汇点。</p>
    </div>
  </section>

  <section class="gh-card">
    <div class="card-header">
      <Icon icon="ph:terminal-window" class="card-h-icon" />
      <span class="card-h-title">技术栈体系 (Tech Stack)</span>
    </div>
    <div class="card-body">
      <h3 class="section-heading">Languages & Frameworks</h3>
      <div class="gh-lang-bar">
        <span
          v-for="segment in techBarSegments"
          :key="segment.name"
          :title="`${segment.name} ${segment.width}%`"
          :style="{ width: `${segment.width}%`, backgroundColor: segment.color }"
        ></span>
      </div>

      <ul class="gh-lang-list section-block">
        <li v-for="item in primaryTechStack" :key="item.name">
          <span class="lang-dot" :style="{ backgroundColor: getTechColor(item.name) }"></span>
          <span class="lang-name">{{ item.name }}</span>
        </li>
      </ul>

      <h3 class="section-heading">Topics & Ecosystem</h3>
      <div class="topic-list">
        <span
          v-for="item in ecosystemTechStack"
          :key="item.name"
          class="gh-topic"
          :title="getTechKind(item.name)"
        >
          <Icon :icon="item.icon" class="topic-icon" />
          {{ item.name }}
        </span>
      </div>
    </div>
  </section>

  <section class="gh-card">
    <div class="card-header">
      <Icon icon="ph:clock" class="card-h-icon" />
      <span class="card-h-title">时光进度</span>
    </div>
    <div class="card-body">
      <TimelineCard class="flat-timeline" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { config, techStack } from '~/config/site.config'
import { getTechColor, getTechKind, primaryTechKinds, techBarSegments } from '~/config/homepage.ui'

const primaryTechStack = computed(() => {
  return techStack.filter(item => primaryTechKinds.includes(getTechKind(item.name)))
})

const ecosystemTechStack = computed(() => {
  return techStack.filter(item => !primaryTechKinds.includes(getTechKind(item.name)))
})
</script>

<style scoped>
.intro-wave {
  font-size: 1em;
}

.section-heading {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gh-fg);
  text-transform: uppercase;
}

.section-block {
  margin-bottom: 24px;
}

.topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-icon {
  font-size: 14px;
}
</style>
