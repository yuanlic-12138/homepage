'use client'

import { useEffect, useState } from 'react'

type TimelineCardProps = {
  className?: string
  initialNowIso: string
}

export default function TimelineCard({ className, initialNowIso }: TimelineCardProps) {
  const [now, setNow] = useState(() => new Date(initialNowIso))

  useEffect(() => {
    let timeTimer: ReturnType<typeof setTimeout> | undefined

    setNow(new Date())

    const scheduleTick = () => {
      const current = new Date()
      const msUntilNextMinute = 60000 - (current.getSeconds() * 1000 + current.getMilliseconds())

      timeTimer = setTimeout(() => {
        setNow(new Date())
        scheduleTick()
      }, msUntilNextMinute)
    }

    scheduleTick()

    return () => {
      if (timeTimer) {
        clearTimeout(timeTimer)
      }
    }
  }, [])

  const hoursPassed = now.getHours()
  const hoursProgress = ((hoursPassed / 24) * 100).toFixed(2)

  const currentDay = now.getDay()
  const daysInWeekPassed = currentDay === 0 ? 7 : currentDay
  const weekProgress = ((daysInWeekPassed / 7) * 100).toFixed(2)

  const daysInMonthPassed = now.getDate()
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthProgress = ((daysInMonthPassed / daysInCurrentMonth) * 100).toFixed(2)

  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const daysInYearPassed = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
  const daysInCurrentYear = isLeapYear(now.getFullYear()) ? 366 : 365
  const yearProgress = ((daysInYearPassed / daysInCurrentYear) * 100).toFixed(2)

  return (
    <div className={['card', 'timeline-card', 'stagger-3', className].filter(Boolean).join(' ')}>
      <div className="time-progress">
        <h3>时光</h3>

        <div className="progress-item">
          <p>今天已过 {hoursPassed} / 24 小时</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${hoursProgress}%` }} />
          </div>
        </div>

        <div className="progress-item">
          <p>本周已过 {daysInWeekPassed} / 7 天</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${weekProgress}%` }} />
          </div>
        </div>

        <div className="progress-item">
          <p>本月已过 {daysInMonthPassed} / {daysInCurrentMonth} 天</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${monthProgress}%` }} />
          </div>
        </div>

        <div className="progress-item">
          <p>今年已过 {daysInYearPassed} / {daysInCurrentYear} 天</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${yearProgress}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}
