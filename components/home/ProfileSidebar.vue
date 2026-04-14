<template>
  <aside class="gh-vcard">
    <div class="vcard-avatar-wrap">
      <img :src="config.avatarUrl" alt="Avatar" class="vcard-avatar" />
    </div>

    <div class="vcard-names">
      <h1 class="vcard-fullname">{{ config.name }}</h1>
      <h2 class="vcard-username">cot.wiki</h2>
    </div>

    <p class="vcard-bio">项目联系Cotovo@163.com</p>

    <ul class="vcard-details">
      <li><Icon icon="ph:map-pin" class="d-icon" /> {{ config.infoTags.province }}</li>
      <li><Icon icon="ph:graduation-cap" class="d-icon" /> {{ config.infoTags.school }}</li>
      <li><Icon icon="ph:star" class="d-icon" /> {{ config.zodiac }}</li>
      <li><Icon icon="ph:calendar-blank" class="d-icon" /> {{ config.age }}后</li>
    </ul>

    <div class="profile-divider"></div>
    <h3 class="social-title">社交链接</h3>
    <div class="social-list">
      <a
        v-for="(link, index) in linkBtns"
        :key="index"
        :href="link.url"
        target="_blank"
        class="gh-link social-link"
      >
        <Icon :icon="link.icon" class="social-icon" :style="{ color: link.color }" />
        <span>{{ link.text }}</span>
      </a>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { config, linkBtns } from '~/config/site.config'
</script>

<style scoped>
.profile-divider {
  height: 1px;
  background: var(--gh-border-muted);
  margin: 16px 0;
}

.social-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--gh-fg);
}

.social-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.social-icon {
  font-size: 18px;
}
</style>
