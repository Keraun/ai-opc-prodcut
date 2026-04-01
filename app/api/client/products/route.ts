import { NextRequest } from 'next/server'
import { successResponse, badRequestResponse, notFoundResponse } from '@/lib/api-utils'
import { jsonDb } from '@/lib/json-database'

interface Product {
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const category = searchParams.get('category')
  
  jsonDb.reload()
  
  if (id) {
    const product = jsonDb.findOne('products', { id: parseInt(id) })
    if (product && product.status === 'active') {
      return successResponse(product)
    } else {
      return notFoundResponse('产品不存在或未上架')
    }
  }
  
  let products = jsonDb.getAll('products')
  
  products = products.filter((product: Product) => product.status === 'active')
  
  if (category) {
    products = products.filter((product: Product) => product.category === category)
  }
  
  products = products.sort((a: Product, b: Product) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  return successResponse(products)
}
