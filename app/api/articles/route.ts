import { NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { successResponse, errorResponse, badRequestResponse, notFoundResponse } from '@/lib/api-utils'

interface Article {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  contentFormat: 'html' | 'markdown'
  date: string
  author?: string
  tags?: string[]
  image?: string
  status: 'published' | 'draft'
}

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')

// 确保文章目录存在
async function ensureArticlesDir() {
  try {
    await fs.access(ARTICLES_DIR)
  } catch {
    await fs.mkdir(ARTICLES_DIR, { recursive: true })
  }
}

// 生成唯一ID
function generateId() {
  return Date.now().toString()
}

// 生成slug
function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// 读取所有文章
async function getArticles(): Promise<Article[]> {
  await ensureArticlesDir()
  
  try {
    const files = await fs.readdir(ARTICLES_DIR)
    const articles: Article[] = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(ARTICLES_DIR, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const article = JSON.parse(content)
        articles.push(article)
      }
    }
    
    return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error reading articles:', error)
    return []
  }
}

// 读取单个文章
async function getArticle(slug: string): Promise<Article | null> {
  await ensureArticlesDir()
  
  try {
    const files = await fs.readdir(ARTICLES_DIR)
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(ARTICLES_DIR, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const article = JSON.parse(content)
        
        if (article.slug === slug) {
          return article
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error reading article:', error)
    return null
  }
}

// 保存文章
async function saveArticle(article: Article): Promise<Article> {
  await ensureArticlesDir()
  
  const fileName = `${article.id}.json`
  const filePath = path.join(ARTICLES_DIR, fileName)
  
  await fs.writeFile(filePath, JSON.stringify(article, null, 2))
  return article
}

// 删除文章
async function deleteArticle(id: string): Promise<boolean> {
  await ensureArticlesDir()
  
  try {
    const fileName = `${id}.json`
    const filePath = path.join(ARTICLES_DIR, fileName)
    
    await fs.unlink(filePath)
    return true
  } catch (error) {
    console.error('Error deleting article:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  
  if (slug) {
    const article = await getArticle(slug)
    if (article) {
      return successResponse(article)
    } else {
      return notFoundResponse('文章不存在')
    }
  } else {
    const articles = await getArticles()
    return successResponse(articles)
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.title || !data.content) {
      return badRequestResponse('标题和内容不能为空')
    }
    
    const article: Article = {
      id: data.id || generateId(),
      title: data.title,
      slug: data.slug || generateSlug(data.title),
      summary: data.summary,
      content: data.content,
      contentFormat: data.contentFormat || 'markdown',
      date: data.date || new Date().toISOString().split('T')[0],
      author: data.author,
      tags: data.tags,
      image: data.image,
      status: data.status || 'draft'
    }
    
    const savedArticle = await saveArticle(article)
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
    
    if (!data.title || !data.content) {
      return badRequestResponse('标题和内容不能为空')
    }
    
    const article: Article = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      contentFormat: data.contentFormat,
      date: data.date,
      author: data.author,
      tags: data.tags,
      image: data.image,
      status: data.status
    }
    
    const savedArticle = await saveArticle(article)
    return successResponse(savedArticle, '文章更新成功')
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
  
  const success = await deleteArticle(id)
  if (success) {
    return successResponse(null, '文章删除成功')
  } else {
    return errorResponse('删除文章失败')
  }
}
