import type { AnimeListItem, LinkButton, SiteProfileConfig, TechStackItem, TodoItem } from './homepage.types'

export const config = {
  name: "runic",
  age: "00",
  zodiac: "",
  avatarUrl: "/og-image.jpg",
  status: { emoji: "", message: "" },
  infoTags: { sex: "", province: "", school: "" },
  professions: []
} satisfies SiteProfileConfig

export const todoList: TodoItem[] = []

export const techStack: TechStackItem[] = []

export const linkBtns: LinkButton[] = []

export const typewriterTexts: string[] = []

export const animeList: AnimeListItem[] = []
