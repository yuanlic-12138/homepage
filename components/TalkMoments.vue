<template>
  <section class="gh-card moments-card">
    <div class="card-header">
      <Icon icon="ph:chat-circle-text" class="card-h-icon" />
      <span class="card-h-title">说说</span>
    </div>

    <div class="card-body moments-body">
      <p class="moments-intro">记录生活点滴，一些想法。</p>

      <div v-if="sortedTalks.length" class="talk-list gh-timeline">
        <div
          v-for="(talk, index) in sortedTalks"
          :key="`${talk.date}-${index}`"
          class="gh-timeline-item"
        >
          <div class="gh-timeline-avatar">
            <img :src="config.avatarUrl" :alt="config.name" loading="lazy">
          </div>
          
          <article class="gh-comment-bubble">
            <div class="bubble-header">
              <span class="bubble-nick">
                {{ config.name }}
                <Icon class="verified" icon="material-symbols:verified-rounded" title="Verified" />
              </span>
              <span class="bubble-action">发表了动态</span>
              <span class="bubble-date">on {{ formatTalkDate(talk.date) }}</span>
              <span class="talk-serial">#{{ String(sortedTalks.length - index).padStart(2, '0') }}</span>
            </div>

            <div class="bubble-body">
              <div class="talk-content">
                <div v-if="talk.text" class="text" v-html="talk.text"></div>

                <div v-if="talk.images?.length" class="images">
                  <div
                    v-for="(image, imageIndex) in talk.images"
                    :key="`${image}-${imageIndex}`"
                    class="image"
                  >
                    <img :src="image" :alt="`说说配图 ${imageIndex + 1}`" loading="lazy">
                  </div>
                </div>

                <VideoEmbed
                  v-if="talk.video"
                  class="talk-video"
                  v-bind="talk.video"
                />
              </div>

              <div class="talk-bottom" v-if="(talk.tags && talk.tags.length) || talk.location">
                <div class="tags">
                  <span v-for="tag in talk.tags || []" :key="tag" class="tag">
                    <Icon icon="tabler:tag" />
                    <span>{{ tag }}</span>
                  </span>

                  <a
                    v-if="talk.location"
                    class="location"
                    :href="`https://bing.com/maps?q=${encodeURIComponent(talk.location)}`"
                    target="_blank"
                    rel="noreferrer"
                    :title="`搜索 ${talk.location}`"
                  >
                    <Icon icon="tabler:map-pin-filled" />
                    <span>{{ talk.location }}</span>
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div v-else class="moments-empty">暂时还没有说说内容。</div>

      <div class="talk-footer">当前展示 {{ sortedTalks.length }} 条记录</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { config } from '~/config/site.config'
import { talkList } from '~/config/talks.config'
import { formatDateZh } from '~/utils/format'

const sortedTalks = computed(() => {
  return [...talkList].sort((left, right) => {
    return new Date(right.date).getTime() - new Date(left.date).getTime()
  }).slice(0, 30)
})

function formatTalkDate(date: string) {
  return formatDateZh(date, true)
}
</script>

<style scoped>
.moments-card {
  overflow: hidden;
}

.moments-body {
  padding: 18px;
}

.moments-intro {
  margin: 0 0 16px;
  color: var(--gh-fg-muted);
  font-size: 13px;
}

.gh-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.gh-timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}

.gh-timeline-item::before {
  content: "";
  position: absolute;
  top: 44px;
  bottom: -24px;
  left: 19.5px;
  width: 2px;
  background-color: var(--gh-border-muted);
  z-index: 0;
}

.gh-timeline-item:last-child::before {
  display: none;
}

.gh-timeline-avatar {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.gh-timeline-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--gh-border-muted);
  background: var(--gh-bg);
}

.gh-comment-bubble {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--gh-border);
  border-radius: 6px;
  background-color: var(--gh-bg);
}

.bubble-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--gh-bg-subtle);
  border-bottom: 1px solid var(--gh-border);
  border-radius: 6px 6px 0 0;
  font-size: 13px;
  color: var(--gh-fg-muted);
}

.bubble-nick {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(--gh-fg);
  font-size: 14px;
}

.verified {
  color: var(--gh-accent);
  font-size: 15px;
}

.bubble-date {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}

.talk-serial {
  margin-left: auto;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}

.bubble-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.talk-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--gh-fg);
}

.text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--gh-fg);
  white-space: pre-wrap;
}

.text:deep(a[href]) {
  margin: -0.1em -0.15em;
  padding: 0.1em 0.15em;
  border-radius: 0.3em;
  background: linear-gradient(color-mix(in srgb, var(--gh-accent) 14%, transparent), color-mix(in srgb, var(--gh-accent) 14%, transparent)) no-repeat center bottom / 100% 0.12em;
  color: var(--gh-accent);
  text-decoration: none;
  transition: background-size 0.2s ease;
}

.text:deep(a[href]):hover {
  background-size: 100% 100%;
}

.images {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.image {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid var(--gh-border);
  background: var(--gh-bg-subtle);
  aspect-ratio: 1 / 1;
}

.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.28s ease;
}

.image:hover img {
  transform: scale(1.05);
}

.talk-video {
  margin-top: 2px;
}

.talk-bottom {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag,
.location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--gh-bg);
  border: 1px solid var(--gh-border);
  color: var(--gh-fg-muted);
  font-size: 12px;
  text-decoration: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.location {
  color: var(--gh-accent);
}

.location:hover,
.tag:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.talk-serial {
  color: var(--gh-fg-muted);
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  white-space: nowrap;
}

.moments-empty {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gh-fg-muted);
  font-size: 14px;
}

.talk-footer {
  margin-top: 18px;
  text-align: center;
  color: var(--gh-fg-muted);
  font-size: 12px;
}

@media (max-width: 768px) {
  .moments-body {
    padding: 12px;
  }

  .gh-timeline-item {
    gap: 12px;
  }

  .gh-timeline-item::before {
    left: 17.5px;
    top: 36px;
  }

  .gh-timeline-avatar img {
    width: 36px;
    height: 36px;
  }

  .bubble-header {
    padding: 8px 12px;
  }

  .bubble-body {
    padding: 12px;
  }

  .images {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .talk-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
