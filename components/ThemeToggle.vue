<template>
  <div class="reThemeBtn stagger-1" @click="changeTheme" title="Toggle Theme">
    <Icon :icon="theme === 'light' ? 'ph:sun-dim-fill' : 'ph:moon-stars-fill'" class="theme-icon" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

type ThemeMode = 'light' | 'dark'

const theme = ref<ThemeMode>('light')

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
.theme-icon {
  font-size: 1.4rem;
  color: var(--text-color);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.reThemeBtn:hover .theme-icon {
  transform: rotate(30deg) scale(1.1);
}
</style>
