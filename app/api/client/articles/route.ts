import { NextRequest } from 'next/server'
import { successResponse, badRequestResponse, notFoundResponse } from '@/lib/api-utils'
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
  
  jsonDb.reload()
  
  if (slug) {
    const article = jsonDb.findOne('articles', { slug })
    if (article && article.status === 'published') {
      return successResponse(article)
    } else {
      return notFoundResponse('文章不存在或未发布')
    }
  }
  
  if (id) {
    const article = jsonDb.findOne('articles', { id: parseInt(id) })
    if (article && article.status === 'published') {
      return successResponse(article)
    } else {
      return notFoundResponse('文章不存在或未发布')
    }
  }
  
  let articles = jsonDb.getAll('articles')
  
  articles = articles.filter((article: Article) => article.status === 'published')
  
  articles = articles.sort((a: Article, b: Article) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  return successResponse(articles)
}
