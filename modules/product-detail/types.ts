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

export interface ProductDetailData {
  showPrice: boolean
  showFeatures: boolean
  showRating: boolean
  showSalesCount: boolean
  showRelated: boolean
  relatedCount: number
}
