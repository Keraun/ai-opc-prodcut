import { NextRequest } from 'next/server'
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api-utils'
import { readConfig, writeConfig } from '@/lib/config-manager'

export async function GET(request: NextRequest) {
  try {
    const categories = readConfig('product-categories')
    return successResponse(categories)
  } catch (error) {
    console.error('Error reading product categories:', error)
    return errorResponse('获取产品分类失败')
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!Array.isArray(data)) {
      return badRequestResponse('分类数据格式错误')
    }
    
    for (const category of data) {
      if (!category.value || !category.label) {
        return badRequestResponse('分类必须包含 value 和 label')
      }
    }
    
    writeConfig('product-categories', data)
    return successResponse(data, '产品分类更新成功')
  } catch (error) {
    console.error('Error updating product categories:', error)
    return errorResponse('更新产品分类失败')
  }
}
