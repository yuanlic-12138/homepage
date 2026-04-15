<template>
  <div
    class="video-embed"
    :style="{
      aspectRatio: resolvedRatio,
      maxWidth: width,
      maxHeight: height
    }"
  >
    <video
      v-if="type === 'raw'"
      class="video-element"
      :poster="poster"
      :src="resolvedSrc"
      controls
      preload="metadata"
    />

    <iframe
      v-else
      class="video-element"
      :src="resolvedSrc"
      :title="embedTitle"
      loading="lazy"
      scrolling="no"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TalkVideoType } from '~/config/talks.config'

const props = withDefaults(defineProps<{
  id: string
  type?: TalkVideoType
  autoplay?: boolean
  ratio?: string | number
  poster?: string
  width?: string
  height?: string
}>(), {
  type: 'raw'
})

const resolvedRatio = computed(() => {
  if (props.ratio) {
    return props.ratio
  }

  switch (props.type) {
    case 'douyin':
      return '27 / 56'
    case 'douyin-wide':
      return '1198 / 731'
    case 'raw':
      return undefined
    default:
      return '16 / 9'
  }
})

const resolvedSrc = computed(() => {
  switch (props.type) {
    case 'bilibili':
      return `https://player.bilibili.com/player.html?bvid=${props.id}&autoplay=${props.autoplay ? 1 : 0}`
    case 'bilibili-nano':
      return `https://www.bilibili.com/blackboard/newplayer.html?bvid=${props.id}&autoplay=${props.autoplay ? 1 : 0}`
    case 'youtube':
      return `https://www.youtube.com/embed/${props.id}?rel=0&disablekb=1&playsinline=1&autoplay=${props.autoplay ? 1 : 0}`
    case 'douyin':
    case 'douyin-wide':
      return `https://open.douyin.com/player/video?vid=${props.id}`
    case 'tiktok':
      return `https://www.tiktok.com/embed/v3/${props.id}`
    default:
      return props.id
  }
})

const embedTitle = computed(() => {
  switch (props.type) {
    case 'bilibili':
    case 'bilibili-nano':
      return 'Bilibili 视频播放器'
    case 'youtube':
      return 'YouTube 视频播放器'
    case 'douyin':
    case 'douyin-wide':
      return '抖音视频播放器'
    case 'tiktok':
      return 'TikTok 视频播放器'
    default:
      return '视频播放器'
  }
})
</script>

<style scoped>
.video-embed {
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--gh-border);
  background: var(--gh-bg-subtle);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--gh-fg) 8%, transparent);
}

.video-element {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
