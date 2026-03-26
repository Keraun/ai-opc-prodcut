export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  image?: string
  tags?: string[]
  category?: string
  link?: string
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
