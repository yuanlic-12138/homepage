export type HotPlatform = {
  id: string
  name: string
  icon: string
  color: string
}

export const hotPlatforms: HotPlatform[] = [
  { id: 'bilibili', name: '哔哩哔哩', icon: 'ri:bilibili-fill', color: '#00aeec' },
  { id: 'weibo', name: '微博', icon: 'ri:weibo-fill', color: '#e6162d' },
  { id: 'douyin', name: '抖音', icon: 'ri:tiktok-fill', color: '#1c1c1e' },
  { id: 'zhihu', name: '知乎', icon: 'ri:zhihu-fill', color: '#0066ff' },
  { id: '36kr', name: '36氪', icon: 'ph:newspaper-bold', color: '#015df3' },
  { id: 'baidu', name: '百度', icon: 'ri:baidu-fill', color: '#2932e1' }
]
