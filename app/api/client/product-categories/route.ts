import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api-utils'
import { jsonDb } from '@/lib/json-database'

export async function GET(request: NextRequest) {
  jsonDb.reload()
  
  const products = jsonDb.getAll('products')
  
  const categories = Array.from(
    new Set(
      products
        .filter((p: any) => p.status === 'active' && p.category)
        .map((p: any) => p.category)
    )
  )
  
  return successResponse(categories)
}
