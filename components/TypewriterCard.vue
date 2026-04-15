<template>
  <div class="typew card stagger-5">
    <span>"</span>
    <span class="typewriter-text">{{ currentText }}<span class="cursor">|</span></span>
    <span>"</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { typewriterTexts } from '~/config/site.config'

const currentText = ref('')
const twIndex = ref(0)
const charIndex = ref(0)
const isDeleting = ref(false)
let typeTimer: ReturnType<typeof setTimeout> | undefined
let startTimer: ReturnType<typeof setTimeout> | undefined

const typeWriterEffect = () => {
  const fullText = typewriterTexts[twIndex.value] || ''

  if (!fullText) {
    currentText.value = ''
    return
  }

  if (isDeleting.value) {
    charIndex.value = Math.max(charIndex.value - 1, 0)
    currentText.value = fullText.substring(0, charIndex.value)
  } else {
    charIndex.value += 1
    currentText.value = fullText.substring(0, charIndex.value)
  }

  let typingSpeed = isDeleting.value ? 50 : 150

  if (!isDeleting.value && charIndex.value === fullText.length) {
    typingSpeed = 2000
    isDeleting.value = true
  } else if (isDeleting.value && charIndex.value === 0) {
    isDeleting.value = false
    twIndex.value = (twIndex.value + 1) % typewriterTexts.length
    typingSpeed = 500
  }

  typeTimer = setTimeout(typeWriterEffect, typingSpeed)
}

onMounted(() => {
  if (!typewriterTexts.length) {
    return
  }

  startTimer = setTimeout(() => {
    typeWriterEffect()
  }, 1000)
})

onUnmounted(() => {
  if (typeTimer) {
    clearTimeout(typeTimer)
  }

  if (startTimer) {
    clearTimeout(startTimer)
  }
})
</script>
