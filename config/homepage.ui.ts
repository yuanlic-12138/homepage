import type { HomeTab, TechBarSegment, TechKind } from './homepage.types'

export const primaryTechKinds: TechKind[] = ['Language', 'Framework', 'Style']

const techKindMap: Record<string, Exclude<TechKind, 'Tool'>> = {
  TypeScript: 'Language',
  JavaScript: 'Language',
  Go: 'Language',
  'C / C++': 'Language',
  Python: 'Language',
  Linux: 'System',
  Windows: 'System',
  Vue: 'Framework',
  CSS: 'Style',
  React: 'Framework',
  VSCode: 'Editor',
  Cursor: 'Editor',
  ChatGPT: 'AI Tool',
  Claude: 'AI Tool',
  Gemini: 'AI Tool',
  Antigravity: 'Utility'
}

const techColorMap: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Go: '#00ADD8',
  'C / C++': '#f34b7d',
  Python: '#3572A5',
  Vue: '#41b883',
  CSS: '#563d7c',
  React: '#61dafb',
  VSCode: '#007acc',
  Antigravity: '#0969da'
}

export const techBarSegments: TechBarSegment[] = [
  { name: 'TypeScript', width: 35, color: '#3178c6' },
  { name: 'Vue', width: 25, color: '#41b883' },
  { name: 'Python', width: 15, color: '#3572A5' },
  { name: 'JavaScript', width: 10, color: '#f1e05a' },
  { name: 'Go', width: 8, color: '#00ADD8' },
  { name: 'C/C++', width: 7, color: '#f34b7d' }
]

export function createHomeTabs(counts: {
  talkCount: number
  animeCount: number
  focusCount: number
}): HomeTab[] {
  return [
    { key: 'overview', label: '概览', icon: 'ph:book-open' },
    { key: 'article', label: '文章', icon: 'ph:article-medium' },
    { key: 'talk', label: '说说', icon: 'ph:chat-circle-text', badge: counts.talkCount },
    { key: 'anime', label: '追番', icon: 'ph:television', badge: counts.animeCount },
    { key: 'hot', label: '热榜', icon: 'ph:fire' },
    { key: 'focus', label: '专注', icon: 'ph:list-checks', badge: counts.focusCount }
  ]
}

export function getTechKind(name: string): TechKind {
  return techKindMap[name] || 'Tool'
}

export function getTechColor(name: string): string {
  return techColorMap[name] || '#8b949e'
}
