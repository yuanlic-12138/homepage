<template>
  <div class="gh-wrapper">
    <ThemeToggle class="fixed-toggle" />
    
    <main class="gh-main">

      <!-- === LEFT SIDEBAR === -->
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

        <div style="height: 1px; background: var(--gh-border-muted); margin: 16px 0;"></div>
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: var(--gh-fg);">社交链接</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a v-for="(link, i) in linkBtns" :key="i" :href="link.url" target="_blank" class="gh-link" style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
            <Icon :icon="link.icon" :style="{ color: link.color, fontSize: '18px' }" />
            <span>{{ link.text }}</span>
          </a>
        </div>
      </aside>

      <!-- === RIGHT CONTENT === -->
      <div class="gh-content">

        <!-- 导航 -->
        <nav class="gh-nav">
           <a v-for="tab in tabs" :key="tab.key" 
              class="nav-item" :class="{active: activeTab === tab.key}"
              @click="activeTab = tab.key">
             <Icon :icon="tab.icon" class="nav-ic" /> {{ tab.label }}
             <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
           </a>
        </nav>

        <!-- ========== TAB: Overview ========== -->
        <div v-show="activeTab === 'overview'">
          <section class="gh-card readme-card">
             <div class="card-header">
                <Icon icon="ph:file-text" class="card-h-icon" />
                <span class="card-h-title">个人简介</span>
             </div>
             <div class="card-body markdown">
                <h2>你好 👋</h2>
                <blockquote>
                  <TypewriterCard class="flat-tw" />
                </blockquote>
                <p>欢迎来到 <b>{{ config.name }}</b> 的数字空间。</p>
                <p>{{ config.professions.join('、') }}。正在探索代码与 AI 的交汇点。</p>
             </div>
          </section>

          <!-- Tech Stack (Git Like) -->
          <section class="gh-card">
             <div class="card-header">
                 <Icon icon="ph:code" class="card-h-icon" />
                 <span class="card-h-title">技术面板 (Languages & Tools)</span>
             </div>
             <div class="card-body">
                <div class="gh-lang-bar">
                  <span style="width: 25%; background-color: #41b883;" title="Vue 25%"></span>
                  <span style="width: 20%; background-color: #3572A5;" title="Python 20%"></span>
                  <span style="width: 15%; background-color: #f34b7d;" title="C/C++ 15%"></span>
                  <span style="width: 15%; background-color: #563d7c;" title="CSS 15%"></span>
                  <span style="width: 25%; background-color: #e34c26;" title="Others 25%"></span>
                </div>
                
                <ul class="gh-lang-list">
                  <li v-for="item in techStack" :key="item.name">
                    <span class="lang-dot" :style="{ backgroundColor: getTechColor(item.name) }"></span>
                    <a href="javascript:void(0)" class="lang-name">{{ item.name }}</a>
                  </li>
                </ul>
             </div>
          </section>

          <!-- Entropy -->
          <section class="gh-card">
            <div class="card-header">
              <Icon icon="ph:clock" class="card-h-icon" />
              <span class="card-h-title">时光进度</span>
            </div>
            <div class="card-body">
              <TimelineCard class="flat-timeline" />
            </div>
          </section>
        </div>

        <!-- ========== TAB: Hot ========== -->
        <div v-show="activeTab === 'hot'">
          <HotDashboard />
        </div>

        <!-- ========== TAB: Article ========== -->
        <div v-show="activeTab === 'article'">
          <ArticleFeed />
        </div>

        <!-- ========== TAB: Talk ========== -->
        <div v-show="activeTab === 'talk'">
          <TalkMoments />
        </div>

        <!-- ========== TAB: Focus ========== -->
        <div v-show="activeTab === 'focus'">
          <section class="gh-card">
             <div class="card-header">
                <Icon icon="ph:list-checks" class="card-h-icon" />
                <span class="card-h-title">待办事项</span>
             </div>
             <div class="card-body">
                <ul class="task-list">
                  <li v-for="job in todoList" :key="job.text">
                    <input type="checkbox" :checked="job.checked" disabled class="gh-cb" />
                    <span :class="{'done': job.checked}">{{ job.text }}</span>
                  </li>
                </ul>
             </div>
          </section>
        </div>

        <!-- ========== TAB: Anime ========== -->
        <div v-show="activeTab === 'anime'">
          <AnimeTracker />
        </div>

        <footer class="gh-footer">
          <div class="footer-main">
            © 2026 {{ config.name }} · 基于 Nuxt 构建
          </div>
          <div class="footer-beian" style="margin-top: 6px; font-size: 0.9em; opacity: 0.8;">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" style="color: inherit; text-decoration: none;">鄂ICP备2025157857号</a>
            <span style="margin: 0 8px;">·</span>
            <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42018502008592" target="_blank" rel="noreferrer" style="color: inherit; text-decoration: none;">鄂公网安备 42018502008592号</a>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from "@iconify/vue";
import { useHead } from '#imports';
import { config, todoList, techStack, linkBtns, animeList } from '~/config/site.config';
import { talkList } from '~/config/talks.config';

useHead({ title: '序栈集', htmlAttrs: { lang: 'zh-CN' } });

const activeTab = ref('overview');

const tabs = [
  { key: 'overview', label: '概览', icon: 'ph:book-open' },
  { key: 'article', label: '文章', icon: 'ph:article-medium' },
  { key: 'talk', label: '说说', icon: 'ph:chat-circle-text', badge: talkList.length },
  { key: 'anime', label: '追番', icon: 'ph:television', badge: animeList.length },
  { key: 'hot', label: '热榜', icon: 'ph:fire' },
  { key: 'focus', label: '专注', icon: 'ph:list-checks', badge: todoList.length }
];

const techKindMap = {
  'C / C++': 'Language',
  'Python': 'Language',
  'Linux': 'System',
  'Windows': 'System',
  'Vue': 'Framework',
  'CSS': 'Style',
  'React': 'Framework',
  'VSCode': 'Editor',
  'Cursor': 'Editor',
  'ChatGPT': 'AI Tool',
  'Claude': 'AI Tool',
  'Gemini': 'AI Tool',
  'Antigravity': 'Utility'
};

function getTechKind(name) {
  return techKindMap[name] || 'Tool';
}

function getTechColor(name) {
  const colors = {
    'C / C++': '#f34b7d',
    'Python': '#3572A5',
    'Vue': '#41b883',
    'CSS': '#563d7c',
    'React': '#61dafb',
    'VSCode': '#007acc',
    'Antigravity': '#0969da'
  };
  return colors[name] || '#8b949e';
}

</script>
