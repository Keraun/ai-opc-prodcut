import { NextRequest } from 'next/server'
import { successResponse, errorResponse, badRequestResponse, notFoundResponse } from '@/lib/api-utils'
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
  const admin = searchParams.get('admin')
  
  jsonDb.reload()
  
  if (id) {
    const product = jsonDb.findOne('products', { id: parseInt(id) })
    if (product) {
      return successResponse(product)
    } else {
      return notFoundResponse('产品不存在')
    }
  }
  
  let products = jsonDb.getAll('products')
  
  if (admin !== 'true') {
    products = products.filter((product: Product) => product.status === 'active')
  }
  
  if (category) {
    products = products.filter((product: Product) => product.category === category)
  }
  
  products = products.sort((a: Product, b: Product) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  return successResponse(products)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.title || !data.description) {
      return badRequestResponse('标题和描述不能为空')
    }
    
    jsonDb.reloadTable('products')
    
    const product = {
      title: data.title,
      description: data.description,
      content: data.content || '',
      price: data.price || 0,
      originalPrice: data.originalPrice || null,
      image: data.image || '',
      tags: data.tags || [],
      category: data.category || '',
      categoryName: data.categoryName || '',
      link: data.link || '',
      buyLink: data.buyLink || '',
      features: data.features || [],
      salesCount: data.salesCount || 0,
      rating: data.rating || 5.0,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const savedProduct = jsonDb.insert('products', product)
    return successResponse(savedProduct, '产品创建成功', 201)
  } catch (error) {
    console.error('Error creating product:', error)
    return errorResponse('创建产品失败')
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.id) {
      return badRequestResponse('产品ID不能为空')
    }
    
    jsonDb.reloadTable('products')
    
    const existing = jsonDb.findOne('products', { id: parseInt(data.id) })
    if (!existing) {
      return notFoundResponse('产品不存在')
    }
    
    const updatedProduct = {
      ...existing,
      title: data.title || existing.title,
      description: data.description || existing.description,
      content: data.content !== undefined ? data.content : existing.content,
      price: data.price !== undefined ? data.price : existing.price,
      originalPrice: data.originalPrice !== undefined ? data.originalPrice : existing.originalPrice,
      image: data.image || existing.image,
      tags: data.tags || existing.tags,
      category: data.category || existing.category,
      categoryName: data.categoryName || existing.categoryName,
      link: data.link || existing.link,
      buyLink: data.buyLink !== undefined ? data.buyLink : existing.buyLink,
      features: data.features || existing.features,
      status: data.status || existing.status,
      updated_at: new Date().toISOString()
    }
    
    const result = jsonDb.update('products', parseInt(data.id), updatedProduct)
    return successResponse(result, '产品更新成功')
  } catch (error) {
    console.error('Error updating product:', error)
    return errorResponse('更新产品失败')
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return badRequestResponse('产品ID不能为空')
  }
  
  jsonDb.reloadTable('products')
  
  const success = jsonDb.delete('products', { id: parseInt(id) })
  if (success) {
    return successResponse(null, '产品删除成功')
  } else {
    return errorResponse('删除产品失败')
  }
}
