import { Icon } from '@iconify/react'
import { useEffect, useRef, useState } from 'react'

type ThemeMode = 'light' | 'dark'

type ThemeToggleProps = {
  className?: string
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    finished: Promise<void>
  }
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>('light')
  const transitionTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const root = document.documentElement
    const savedTheme = localStorage.getItem('theme')
    const nextTheme = savedTheme === 'dark' ? 'dark' : 'light'
    setTheme(nextTheme)

    root.setAttribute('data-theme', nextTheme)

    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current)
      }

      root.classList.remove('theme-transition')
    }
  }, [])

  const themeToggleLabel = theme === 'light' ? '切换到深色主题' : '切换到浅色主题'

  function applyTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    localStorage.setItem('theme', nextTheme)
  }

  function markThemeTransition() {
    const root = document.documentElement

    root.classList.add('theme-transition')

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current)
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove('theme-transition')
      transitionTimeoutRef.current = null
    }, 560)
  }

  function changeTheme(e: React.MouseEvent) {
    const nextTheme = theme === 'light' ? 'dark' : 'light'

    // 获取点击坐标
    const x = e.clientX
    const y = e.clientY
    const root = document.documentElement
    root.style.setProperty('--x', `${x}px`)
    root.style.setProperty('--y', `${y}px`)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      applyTheme(nextTheme)
      return
    }

    markThemeTransition()

    const startViewTransition = (document as ViewTransitionDocument).startViewTransition?.bind(document)

    if (startViewTransition) {
      void startViewTransition(() => {
        applyTheme(nextTheme)
      })

      return
    }

    applyTheme(nextTheme)
  }

  return (
    <button
      type="button"
      className={['theme-btn', className].filter(Boolean).join(' ')}
      data-theme-mode={theme}
      aria-label={themeToggleLabel}
      aria-pressed={theme === 'dark'}
      title={themeToggleLabel}
      onClick={(e) => changeTheme(e)}
    >
      <div className="theme-btn-bg" />
      <span className="theme-icon-stack" aria-hidden="true">
        <Icon icon="ph:sun-dim-fill" className="theme-icon theme-icon-sun" />
        <Icon icon="ph:moon-stars-fill" className="theme-icon theme-icon-moon" />
      </span>
      <div className="theme-btn-glow" />
    </button>
  )
}
