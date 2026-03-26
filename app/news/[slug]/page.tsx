import { ModuleRenderer } from '@/modules/renderer'
import { loadPageData } from '@/lib/initial-data'
import fs from 'fs/promises'
import path from 'path'

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

async function ensureArticlesDir() {
  try {
    await fs.access(ARTICLES_DIR)
  } catch {
    await fs.mkdir(ARTICLES_DIR, { recursive: true })
  }
}

async function getArticles(): Promise<Article[]> {
  await ensureArticlesDir()
  
  try {
    const files = await fs.readdir(ARTICLES_DIR)
    const articles: Article[] = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(ARTICLES_DIR, file)
        const content = await fs.readFile(filePath, 'utf8')
        const article = JSON.parse(content)
        articles.push(article)
      }
    }
    
    return articles
      .filter(article => article.status === 'published')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error reading articles:', error)
    return []
  }
}

async function getArticle(slug: string): Promise<Article | null> {
  const articles = await getArticles()
  return articles.find(article => article.slug === slug) || null
}

async function getRelatedArticles(articleId: string, count: number): Promise<Article[]> {
  const articles = await getArticles()
  return articles
    .filter(article => article.id !== articleId)
    .slice(0, count)
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  
  const article = await getArticle(slug)
  const relatedArticles = article ? await getRelatedArticles(article.id, 3) : []

  const pageData = loadPageData('news-detail', 'newsDetailOrder', {
    showAuthor: true,
    showDate: true,
    showRelated: true,
    relatedCount: 3,
    showShare: true,
    showComments: false,
    article,
    relatedArticles
  })

  const modules = pageData.data.modules || []

  return <ModuleRenderer modules={modules} />
}
