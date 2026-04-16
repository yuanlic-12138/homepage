import HomePage from '@/components/HomePage'
import { defaultAnimeFeed, getAnimeFeed } from '@/lib/anime-feed'
import { defaultArticleFeed, getArticleFeed } from '@/lib/article-feed'

export default async function Page() {
  const [articleFeed, animeFeed] = await Promise.all([
    getArticleFeed().catch(() => defaultArticleFeed),
    getAnimeFeed().catch(() => defaultAnimeFeed)
  ])

  return <HomePage initialArticleFeed={articleFeed} initialAnimeFeed={animeFeed} />
}
