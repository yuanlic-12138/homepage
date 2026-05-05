export const siteName = 'runic'
export const siteDescription = 'runic 的个人主页'
export const siteKeywords = 'runic,个人主页'
export const defaultOgImage = '/og-image.jpg'

export const publicSiteConfig = {
  author: 'Perimsx',
  blogHomeUrl: process.env.NEXT_PUBLIC_BLOG_HOME_URL || process.env.NUXT_PUBLIC_BLOG_HOME_URL || 'https://blog.cot.wiki',
  defaultOgImage,
  siteDescription,
  siteKeywords,
  siteName,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NUXT_PUBLIC_SITE_URL || 'https://cot.wiki'
}

export const ogImageUrl = new URL(publicSiteConfig.defaultOgImage, publicSiteConfig.siteUrl).toString()

export function getBangumiApiBase() {
  return process.env.BANGUMI_API_BASE || process.env.NUXT_BANGUMI_API_BASE || 'https://api.bgm.tv'
}

export function getRssUrl() {
  return process.env.RSS_URL || process.env.NUXT_RSS_URL || 'https://blog.cot.wiki/rss.xml'
}
