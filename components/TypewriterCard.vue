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
let twIndex = 0
let charIndex = 0
let isDeleting = false
let typeTimer: ReturnType<typeof setTimeout> | undefined

const typeWriterEffect = () => {
  const fullText = typewriterTexts[twIndex] || ''
  if (isDeleting) {
    currentText.value = fullText.substring(0, charIndex - 1)
    charIndex--
  } else {
    currentText.value = fullText.substring(0, charIndex + 1)
    charIndex++
  }

  let typingSpeed = isDeleting ? 50 : 150

  if (!isDeleting && charIndex === fullText.length) {
    typingSpeed = 2000
    isDeleting = true
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false
    twIndex = (twIndex + 1) % typewriterTexts.length
    typingSpeed = 500
  }

  typeTimer = setTimeout(typeWriterEffect, typingSpeed)
}

onMounted(() => {
  setTimeout(() => {
    typeWriterEffect()
  }, 1000)
})

onUnmounted(() => {
  if (typeTimer) {
    clearTimeout(typeTimer)
  }
})
</script>
