import { NextRequest } from 'next/server'
import { successResponse, errorResponse, badRequestResponse, notFoundResponse } from '@/lib/api-utils'
import { jsonDb } from '@/lib/json-database'

interface Article {
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
  contentType: 'html' | 'markdown'
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const id = searchParams.get('id')
  const admin = searchParams.get('admin')
  
  jsonDb.reload()
  
  if (slug) {
    const article = jsonDb.findOne('articles', { slug })
    if (article) {
      return successResponse(article)
    } else {
      return notFoundResponse('文章不存在')
    }
  }
  
  if (id) {
    const article = jsonDb.findOne('articles', { id: parseInt(id) })
    if (article) {
      return successResponse(article)
    } else {
      return notFoundResponse('文章不存在')
    }
  }
  
  let articles = jsonDb.getAll('articles')
  
  if (admin !== 'true') {
    articles = articles.filter((article: Article) => article.status === 'published')
  }
  
  articles = articles.sort((a: Article, b: Article) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  return successResponse(articles)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.title || !data.summary) {
      return badRequestResponse('标题和摘要不能为空')
    }
    
    jsonDb.reloadTable('articles')
    
    const article = {
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      summary: data.summary,
      content: data.content || '',
      date: data.date || new Date().toISOString().split('T')[0],
      author: data.author || '',
      category: data.category || '',
      tags: data.tags || [],
      image: data.image || '',
      mainImage: data.mainImage || data.image || '',
      viewCount: 0,
      status: data.status || 'published',
      contentType: data.contentType || 'html',
      seo: data.seo || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const savedArticle = jsonDb.insert('articles', article)
    return successResponse(savedArticle, '文章创建成功', 201)
  } catch (error) {
    console.error('Error creating article:', error)
    return errorResponse('创建文章失败')
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.id) {
      return badRequestResponse('文章ID不能为空')
    }
    
    jsonDb.reloadTable('articles')
    
    const existing = jsonDb.findOne('articles', { id: parseInt(data.id) })
    if (!existing) {
      return notFoundResponse('文章不存在')
    }
    
    const updatedArticle = {
      ...existing,
      title: data.title || existing.title,
      slug: data.slug || existing.slug,
      summary: data.summary || existing.summary,
      content: data.content !== undefined ? data.content : existing.content,
      date: data.date || existing.date,
      author: data.author || existing.author,
      category: data.category || existing.category,
      tags: data.tags || existing.tags,
      image: data.image || existing.image,
      mainImage: data.mainImage || data.image || existing.mainImage || existing.image,
      status: data.status || existing.status,
      contentType: data.contentType || existing.contentType || 'html',
      seo: data.seo !== undefined ? data.seo : existing.seo,
      updated_at: new Date().toISOString()
    }
    
    const result = jsonDb.update('articles', parseInt(data.id), updatedArticle)
    return successResponse(result, '文章更新成功')
  } catch (error) {
    console.error('Error updating article:', error)
    return errorResponse('更新文章失败')
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return badRequestResponse('文章ID不能为空')
  }
  
  jsonDb.reloadTable('articles')
  
  const success = jsonDb.delete('articles', { id: parseInt(id) })
  if (success) {
    return successResponse(null, '文章删除成功')
  } else {
    return errorResponse('删除文章失败')
  }
}
