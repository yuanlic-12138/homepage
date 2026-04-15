<template>
  <button
    type="button"
    class="reThemeBtn stagger-1"
    :aria-label="themeToggleLabel"
    :aria-pressed="theme === 'dark'"
    :title="themeToggleLabel"
    @click="changeTheme"
  >
    <Icon :icon="theme === 'light' ? 'ph:sun-dim-fill' : 'ph:moon-stars-fill'" class="theme-icon" />
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

type ThemeMode = 'light' | 'dark'

const theme = ref<ThemeMode>('light')
const themeToggleLabel = computed(() => theme.value === 'light' ? '切换到深色主题' : '切换到浅色主题')

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  theme.value = savedTheme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme.value)
})

const changeTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}
</script>

<style scoped>
.reThemeBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--gh-border);
  border-radius: 999px;
  background: var(--gh-bg);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--gh-fg) 12%, transparent);
  cursor: pointer;
}

.reThemeBtn:focus-visible {
  outline: 2px solid var(--gh-accent);
  outline-offset: 3px;
}

.theme-icon {
  font-size: 1.4rem;
  color: var(--gh-fg);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.reThemeBtn:hover .theme-icon {
  transform: rotate(30deg) scale(1.1);
}
</style>
