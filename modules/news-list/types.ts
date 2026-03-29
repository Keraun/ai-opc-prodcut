export interface Article {
  id: number
  title: string
  summary: string
  content?: string
  date: string
  slug: string
  image?: string
  author?: string
  category?: string
  tags?: string[]
  viewCount?: number
  status: string
  created_at: string
  updated_at: string
}

export interface NewsListData {
  title: string
  subtitle: string
  showDate: boolean
  showSummary: boolean
  itemsPerPage: number
}
