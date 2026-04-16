'use client'

import { useEffect, useState } from 'react'

import { typewriterTexts } from '@/config/site.config'

type TypewriterCardProps = {
  className?: string
}

export default function TypewriterCard({ className }: TypewriterCardProps) {
  const [currentText, setCurrentText] = useState('')

  useEffect(() => {
    if (!typewriterTexts.length) {
      return
    }

    let twIndex = 0
    let charIndex = 0
    let isDeleting = false
    let typeTimer: ReturnType<typeof setTimeout> | undefined
    let startTimer: ReturnType<typeof setTimeout> | undefined

    const typeWriterEffect = () => {
      const fullText = typewriterTexts[twIndex] || ''

      if (!fullText) {
        setCurrentText('')
        return
      }

      if (isDeleting) {
        charIndex = Math.max(charIndex - 1, 0)
      } else {
        charIndex += 1
      }

      setCurrentText(fullText.substring(0, charIndex))

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

    startTimer = setTimeout(typeWriterEffect, 1000)

    return () => {
      if (typeTimer) {
        clearTimeout(typeTimer)
      }

      if (startTimer) {
        clearTimeout(startTimer)
      }
    }
  }, [])

  return (
    <div className={['typew', 'card', 'stagger-5', className].filter(Boolean).join(' ')}>
      <span>"</span>
      <span className="typewriter-text">
        {currentText}
        <span className="cursor">|</span>
      </span>
      <span>"</span>
    </div>
  )
}
