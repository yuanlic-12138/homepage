export type TalkVideoType =
  | 'raw'
  | 'bilibili'
  | 'bilibili-nano'
  | 'youtube'
  | 'douyin'
  | 'douyin-wide'
  | 'tiktok'

export type TalkVideo = {
  id: string
  type?: TalkVideoType
  autoplay?: boolean
  ratio?: string | number
  poster?: string
  width?: string
  height?: string
}

export type TalkItem = {
  text: string
  date: string
  tags?: string[]
  location?: string
  images?: string[]
  video?: TalkVideo
}

export const talkList: TalkItem[] = [
  {
    text: '把喜欢的功能慢慢叠进这个小站，先把追番、热榜和说说都收进同一套界面里。',
    date: '2026-04-14 22:30',
    tags: ['站点更新', 'Nuxt'],
    location: '湖北'
  },
  {
    text: '最近在重新整理页面结构，希望信息密度和阅读节奏都更舒服一点。能一眼看到重点，也能慢慢逛下去。',
    date: '2026-04-12 19:40',
    tags: ['设计', '开发'],
    location: '武汉'
  },
  {
    text: '“序栈集”这个名字定下来之后，整个主页终于更像一个完整的个人空间了。',
    date: '2026-04-10 23:10',
    tags: ['碎碎念'],
    images: ['/og-image.jpg']
  }
]
