import type { Metadata, Viewport } from 'next'

import '@/assets/css/main.css'
import '@/assets/css/react-data.css'
import '@/assets/css/react-ui.css'
import { ogImageUrl, publicSiteConfig, siteName } from '@/lib/site'

const themeBootstrapScript = `
  try {
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (error) {}
`

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteConfig.siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  applicationName: siteName,
  description: publicSiteConfig.siteDescription,
  keywords: publicSiteConfig.siteKeywords.split(','),
  authors: [{ name: publicSiteConfig.author }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico'
  },
  robots: {
    index: true,
    follow: true
  },
  formatDetection: {
    telephone: false
  },
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: publicSiteConfig.siteUrl,
    siteName: publicSiteConfig.siteName,
    title: siteName,
    description: publicSiteConfig.siteDescription,
    images: [ogImageUrl]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: publicSiteConfig.siteDescription,
    images: [ogImageUrl]
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' }
  ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <link rel="preload" as="image" href={publicSiteConfig.defaultOgImage} />
        <link rel="preconnect" href="https://api.bgm.tv" crossOrigin="" />
        <link rel="dns-prefetch" href="//api.bgm.tv" />
        <link rel="preconnect" href="https://blog.coet.ink" />
        <link rel="dns-prefetch" href="//blog.coet.ink" />
        <link rel="preconnect" href="https://hot-api.liiiu.cn" />
        <link rel="dns-prefetch" href="//hot-api.liiiu.cn" />
      </head>
      <body>{children}</body>
    </html>
  )
}
