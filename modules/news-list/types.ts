export interface Article {
  id: string
  title: string
  summary: string
  date: string
  slug: string
  image?: string
}

export interface NewsListData {
  title: string
  subtitle: string
  showDate: boolean
  showSummary: boolean
  itemsPerPage: number
}