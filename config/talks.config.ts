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

export const talkList: TalkItem[] = []
