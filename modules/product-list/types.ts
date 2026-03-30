export interface Product {
  id: number
  title: string
  description: string
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

export interface ProductListData {
  title: string
  subtitle: string
  showPrice: boolean
  showTags: boolean
  categories?: Array<{
    key: string
    title: string
  }>
}
