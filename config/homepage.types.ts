export type SiteInfoTags = {
  sex: string
  province: string
  school: string
}

export type SiteProfileConfig = {
  name: string
  age: string
  zodiac: string
  avatarUrl: string
  emjoi: string
  infoTags: SiteInfoTags
  professions: string[]
}

export type TodoItem = {
  text: string
  checked: boolean
  start?: string
  due?: string
  actual?: string
}

export type TechStackItem = {
  name: string
  icon: string
}

export type LinkButton = {
  text: string
  icon: string
  color: string
  url: string
}

export type AnimeListItem = {
  name: string
  bangumiId?: number
  total: number
  current: number
  status?: string
}

export type HomeTabKey = 'overview' | 'article' | 'talk' | 'anime' | 'hot' | 'focus'

export type HomeTab = {
  key: HomeTabKey
  label: string
  icon: string
  badge?: number
}

export type TechKind = 'Language' | 'Framework' | 'Style' | 'System' | 'Editor' | 'AI Tool' | 'Utility' | 'Tool'

export type TechBarSegment = {
  name: string
  width: number
  color: string
}
