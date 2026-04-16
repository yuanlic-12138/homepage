import { Icon } from '@iconify/react'

import { todoList } from '@/config/site.config'

export default function HomeFocusPanel() {
  const completedCount = todoList.filter(item => item.checked).length
  const openCount = todoList.length - completedCount
  const completionRate = todoList.length ? Math.round((completedCount / todoList.length) * 100) : 0

  return (
    <section className="gh-card">
      <div className="card-header">
        <Icon icon="ph:list-checks" className="card-h-icon" />
        <span className="card-h-title">专注</span>
      </div>

      <div className="card-body focus-summary">
        <div className="milestone-progress-wrap">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
          </div>
          <div className="progress-stats">
            <span className="stat-item">
              <span className="stat-dot done" />
              {completionRate}% complete
            </span>
            <span className="stat-item">{openCount} open</span>
            <span className="stat-item">{completedCount} closed</span>
          </div>
        </div>
      </div>

      <div className="gh-issue-list focus-issues">
        {todoList.map(job => (
          <div key={job.text} className="gh-issue-item">
            <div className="issue-icon-wrap">
              <Icon
                icon={job.checked ? 'ph:check-circle-fill' : 'ph:circle'}
                className={['focus-status-icon', job.checked ? 'is-completed' : ''].join(' ').trim()}
              />
            </div>
            <div className="issue-content">
              <h3 className={['issue-title', 'focus-task-title', job.checked ? 'is-completed' : ''].join(' ').trim()}>
                {job.text}
              </h3>
              <div className="issue-meta focus-issue-meta">
                {job.start ? (
                  <span className="issue-meta-item">
                    <Icon icon="ph:flag" />
                    起点: {job.start}
                  </span>
                ) : null}
                {job.due ? (
                  <span
                    className={[
                      'issue-meta-item',
                      job.checked && job.actual ? 'is-struck' : ''
                    ].join(' ').trim()}
                  >
                    <Icon icon="ph:clock" />
                    期限: {job.due}
                  </span>
                ) : null}
                {job.checked ? (
                  <span className="issue-meta-item is-completed">
                    <Icon icon="ph:check-square-offset" />
                    完结: {job.actual || '未知时间'}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
