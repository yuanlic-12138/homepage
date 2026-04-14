<template>
  <section class="gh-card">
    <div class="card-header">
      <Icon icon="ph:list-checks" class="card-h-icon" />
      <span class="card-h-title">专注</span>
    </div>

    <div class="card-body focus-summary">
      <div class="milestone-progress-wrap">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: `${completionRate}%` }"></div>
        </div>
        <div class="progress-stats">
          <span class="stat-item">
            <span class="stat-dot done"></span>
            {{ completionRate }}% complete
          </span>
          <span class="stat-item">{{ openCount }} open</span>
          <span class="stat-item">{{ completedCount }} closed</span>
        </div>
      </div>
    </div>

    <div class="gh-issue-list focus-issues">
      <div v-for="job in todoList" :key="job.text" class="gh-issue-item">
        <div class="issue-icon-wrap">
          <Icon
            :icon="job.checked ? 'ph:check-circle-fill' : 'ph:circle'"
            class="focus-status-icon"
            :class="{ 'is-completed': job.checked }"
          />
        </div>
        <div class="issue-content">
          <h3 class="issue-title focus-task-title" :class="{ 'is-completed': job.checked }">
            {{ job.text }}
          </h3>
          <div class="issue-meta focus-issue-meta">
            <span v-if="job.start" class="issue-meta-item">
              <Icon icon="ph:flag" />
              起点: {{ job.start }}
            </span>
            <span
              v-if="job.due"
              class="issue-meta-item"
              :class="{ 'is-struck': job.checked && job.actual }"
            >
              <Icon icon="ph:clock" />
              期限: {{ job.due }}
            </span>
            <span v-if="job.checked" class="issue-meta-item is-completed">
              <Icon icon="ph:check-square-offset" />
              完结: {{ job.actual || '未知时间' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { todoList } from '~/config/site.config'

const completedCount = computed(() => todoList.filter(item => item.checked).length)
const openCount = computed(() => todoList.length - completedCount.value)
const completionRate = computed(() => {
  if (!todoList.length) {
    return 0
  }

  return Math.round((completedCount.value / todoList.length) * 100)
})
</script>

<style scoped>
.focus-summary {
  padding: 24px;
  border-bottom: 1px solid var(--gh-border-muted);
}

.focus-issues {
  border: none;
  border-radius: 0;
}

.focus-status-icon {
  font-size: 18px;
  color: var(--gh-success);
}

.focus-status-icon.is-completed {
  color: #8250df;
}

.focus-task-title {
  font-size: 14px;
  font-weight: 500;
}

.focus-task-title.is-completed {
  color: var(--gh-fg-muted);
  text-decoration: line-through;
  font-weight: 400;
}

.focus-issue-meta {
  margin-top: 6px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--gh-fg-muted);
}

.issue-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.issue-meta-item.is-completed {
  color: #8250df;
}

.issue-meta-item.is-struck {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
