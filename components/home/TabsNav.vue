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
  background: none;
  border: 0;
  font: inherit;
}
</style>
