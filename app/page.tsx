import HomePage from '@/components/HomePage'
import { defaultAnimeFeed, getAnimeFeed } from '@/lib/anime-feed'
import { defaultArticleFeed, getArticleFeed } from '@/lib/article-feed'

export default async function Page() {
  const [articleFeed, animeFeed] = await Promise.all([
    getArticleFeed().catch(() => defaultArticleFeed),
    getAnimeFeed().catch(() => defaultAnimeFeed)
  ])
  const initialNowIso = new Date().toISOString()
  const currentYear = new Date(initialNowIso).getFullYear()

  return (
    <HomePage
      initialArticleFeed={articleFeed}
      initialAnimeFeed={animeFeed}
      initialNowIso={initialNowIso}
      currentYear={currentYear}
    />
  )
}
