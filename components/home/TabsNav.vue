<template>
  <nav class="gh-nav">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="nav-item nav-button"
      :class="{ active: activeTab === tab.key }"
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
</style>
