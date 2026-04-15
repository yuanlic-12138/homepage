import { defineNuxtConfig } from 'nuxt/config'

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
const siteName = '序栈集'
const siteUrl = env.NUXT_PUBLIC_SITE_URL || 'https://cot.wiki'
const siteDescription = 'Cotovo 的数字空间，记录技术栈、文章、说说、追番与实时热榜。'
const siteKeywords = 'Cotovo,序栈集,Perimsx,个人主页,Nuxt,Vue,AI,追番,热榜'
const defaultOgImage = '/og-image.jpg'

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: env.NODE_ENV === 'development' },
  css: ['~/assets/css/main.css'],
  experimental: {
    payloadExtraction: env.NODE_ENV === 'production'
  },
  runtimeConfig: {
    bangumiApiBase: env.NUXT_BANGUMI_API_BASE || 'https://api.bgm.tv',
    rssUrl: env.NUXT_RSS_URL || 'https://blog.coet.ink/rss.xml',
    public: {
      author: 'Perimsx',
      blogHomeUrl: env.NUXT_PUBLIC_BLOG_HOME_URL || 'https://blog.coet.ink',
      defaultOgImage,
      siteDescription,
      siteKeywords,
      siteName,
      siteUrl
    }
  },
  nitro: {
    compressPublicAssets: true
  },
  vite: {
    build: {
      minify: 'esbuild'
    }
  },
  app: {
    head: {
      titleTemplate: `%s | ${siteName}`,
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'application-name', content: siteName },
        { name: 'author', content: 'Perimsx' },
        { name: 'description', content: siteDescription },
        { name: 'keywords', content: siteKeywords },
        { name: 'robots', content: 'index, follow, max-image-preview:large' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#ffffff' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#0d1117' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'preload', as: 'image', href: defaultOgImage },
        { rel: 'preconnect', href: 'https://api.bgm.tv', crossorigin: '' },
        { rel: 'dns-prefetch', href: '//api.bgm.tv' },
        { rel: 'preconnect', href: 'https://blog.coet.ink' },
        { rel: 'dns-prefetch', href: '//blog.coet.ink' },
        { rel: 'preconnect', href: 'https://hot-api.liiiu.cn' },
        { rel: 'dns-prefetch', href: '//hot-api.liiiu.cn' }
      ]
    }
  }
})
