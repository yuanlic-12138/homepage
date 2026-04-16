import React, { useEffect, useState } from 'react'

import { config } from '@/config/site.config'

type HomePageFooterProps = {
  currentYear: number
}

export default function HomePageFooter({ currentYear }: HomePageFooterProps) {
  const [uptime, setUptime] = useState<React.ReactNode>('...')

  useEffect(() => {
    const startTime = new Date('2025-11-10T00:07:03').getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = now - startTime

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setUptime(
        <>
          <span className="uptime-num">{days}</span> 天{' '}
          <span className="uptime-num">{hours}</span> 时{' '}
          <span className="uptime-num">{minutes}</span> 分{' '}
          <span className="uptime-num">{seconds}</span> 秒
        </>
      )
    }

    const timer = setInterval(updateTimer, 1000)
    updateTimer()

    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="gh-footer">
      <div className="footer-content">
        <div className="footer-top">
          <span className="footer-copyright">© {currentYear} {config.name}</span>
          <span className="footer-divider">|</span>
          <span className="footer-uptime">本站已运行 {uptime}</span>
        </div>
        <div className="footer-bottom">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="footer-link">
            鄂ICP备2025157857号
          </a>
          <span className="footer-dot">·</span>
          <a
            href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42018502008592"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            鄂公网安备 42018502008592号
          </a>
        </div>
      </div>
    </footer>
  )
}
