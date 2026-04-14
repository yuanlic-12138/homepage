const dateFormatters = {
  date: new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }),
  dateTime: new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }),
  number: new Intl.NumberFormat('zh-CN')
}

export function formatDateZh(value: string | number | Date, includeTime = false) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const formatter = includeTime ? dateFormatters.dateTime : dateFormatters.date
  return formatter.format(date).replace(/\//g, '-')
}

export function formatCompactCount(value: number) {
  if (!value) {
    return '0'
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }

  return dateFormatters.number.format(value)
}

export function formatNumberWithSeparator(value: string | number) {
  const normalized = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''))

  if (Number.isNaN(normalized)) {
    return String(value)
  }

  return dateFormatters.number.format(normalized)
}

export function formatRelativeHours(value?: string) {
  if (!value) {
    return ''
  }

  const targetDate = new Date(value)
  if (Number.isNaN(targetDate.getTime())) {
    return ''
  }

  const diffMs = Date.now() - targetDate.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) {
    return '刚刚'
  }

  return `${diffHours} 小时`
}
