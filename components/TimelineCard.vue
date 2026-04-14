<template>
  <div class="card timeline-card stagger-3">
    <div class="time-progress">
      <h3>时光</h3>
      <div class="progress-item">
        <p>今天已过 {{ hoursPassed }} / 24 小时</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: hoursProgress + '%' }"></div>
        </div>
      </div>

      <div class="progress-item">
        <p>本周已过 {{ daysInWeekPassed }} / 7 天</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: weekProgress + '%' }"></div>
        </div>
      </div>

      <div class="progress-item">
        <p>本月已过 {{ daysInMonthPassed }} / {{ daysInCurrentMonth }} 天</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: monthProgress + '%' }"></div>
        </div>
      </div>

      <div class="progress-item">
        <p>今年已过 {{ daysInYearPassed }} / {{ daysInCurrentYear }} 天</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: yearProgress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const now = ref(new Date())
let timeTimer: ReturnType<typeof setInterval> | undefined

const hoursPassed = computed(() => now.value.getHours())
const hoursProgress = computed(() => ((hoursPassed.value / 24) * 100).toFixed(2))

const daysInWeekPassed = computed(() => {
  const day = now.value.getDay()
  return day === 0 ? 7 : day
})
const weekProgress = computed(() => ((daysInWeekPassed.value / 7) * 100).toFixed(2))

const daysInMonthPassed = computed(() => now.value.getDate())
const daysInCurrentMonth = computed(() => new Date(now.value.getFullYear(), now.value.getMonth() + 1, 0).getDate())
const monthProgress = computed(() => (daysInMonthPassed.value / daysInCurrentMonth.value) * 100)

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

const daysInYearPassed = computed(() => {
  const startOfYear = new Date(now.value.getFullYear(), 0, 1)
  const diff = now.value.getTime() - startOfYear.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})
const daysInCurrentYear = computed(() => (isLeapYear(now.value.getFullYear()) ? 366 : 365))
const yearProgress = computed(() => ((daysInYearPassed.value / daysInCurrentYear.value) * 100).toFixed(2))

onMounted(() => {
  timeTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timeTimer) {
    clearInterval(timeTimer)
  }
})
</script>
