<template>
  <footer class="gh-footer">
    <div class="footer-main">
      © {{ currentYear }} {{ config.name }} · 基于 Nuxt 构建
    </div>
    <div class="footer-beian">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" class="footer-link">鄂ICP备2025157857号</a>
      <span class="footer-separator">·</span>
      <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42018502008592" target="_blank" rel="noreferrer" class="footer-link">鄂公网安备 42018502008592号</a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { config } from '~/config/site.config'

const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer-beian {
  margin-top: 6px;
  font-size: 0.9em;
  opacity: 0.8;
}

.footer-link {
  color: inherit;
  text-decoration: none;
}

.footer-separator {
  margin: 0 8px;
}
</style>
