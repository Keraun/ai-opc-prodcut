export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface PageConfig {
  pageId: string
  layout: string
  modules: any[]
  moduleInstanceIds?: string[]
  config: any
}

export interface Product {
  id: number
  title: string
  description: string
  content?: string
  price: number
  originalPrice?: number
  image?: string
  tags?: string[]
  category?: string
  categoryName?: string
  link?: string
  buyLink?: string
  features?: string[]
  salesCount?: number
  rating?: number
  status: string
  created_at: string
  updated_at: string
}

export interface Article {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  date: string
  author?: string
  category?: string
  tags?: string[]
  image?: string
  mainImage?: string
  viewCount?: number
  status: string
  created_at: string
  updated_at: string
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

export interface SiteConfig {
  [key: string]: any
}
