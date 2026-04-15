<template>
  <nav class="gh-nav" role="tablist" aria-label="主页内容导航">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :id="`tab-${tab.key}`"
      type="button"
      class="nav-item nav-button"
      :class="{ active: activeTab === tab.key }"
      role="tab"
      :aria-controls="`panel-${tab.key}`"
      :aria-selected="activeTab === tab.key"
      :aria-label="tab.badge ? `${tab.label}，${tab.badge} 条内容` : tab.label"
      :tabindex="activeTab === tab.key ? 0 : -1"
      @click="emit('update:activeTab', tab.key)"
    >
      <Icon :icon="tab.icon" class="nav-ic" />
      {{ tab.label }}
      <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { HomeTab, HomeTabKey } from '~/config/homepage.types'

defineProps<{
  tabs: HomeTab[]
  activeTab: HomeTabKey
}>()

const emit = defineEmits<{
  (event: 'update:activeTab', value: HomeTabKey): void
}>()
</script>

<style scoped>
.nav-button {
  background: transparent;
  border: none;
  font: inherit;
  border-bottom: 2px solid transparent;
  /* Offset down to overlap the gh-nav 1px border like GitHub natively does */
  margin-bottom: -1px;
}
.nav-button.active {
  border-bottom-color: #fd8c73;
}
.nav-button:hover:not(.active) {
  border-bottom-color: var(--gh-border-muted);
}

.nav-button:focus-visible {
  outline: 2px solid var(--gh-accent);
  outline-offset: -2px;
}
</style>
