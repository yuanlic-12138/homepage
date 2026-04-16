'use client'

import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

type ThemeToggleProps = {
  className?: string
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const nextTheme = savedTheme === 'dark' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }, [])

  const themeToggleLabel = theme === 'light' ? '切换到深色主题' : '切换到浅色主题'

  function changeTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem('theme', nextTheme)
  }

  return (
    <button
      type="button"
      className={['reThemeBtn', 'stagger-1', className].filter(Boolean).join(' ')}
      aria-label={themeToggleLabel}
      aria-pressed={theme === 'dark'}
      title={themeToggleLabel}
      onClick={changeTheme}
    >
      <Icon icon={theme === 'light' ? 'ph:sun-dim-fill' : 'ph:moon-stars-fill'} className="theme-icon" />
    </button>
  )
}
