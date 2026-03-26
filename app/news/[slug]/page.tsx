import { ModuleRenderer } from '@/modules/renderer'
import { loadInitialData } from '@/lib/initial-data'
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

// 确保文章目录存在
async function ensureArticlesDir() {
  try {
    await fs.access(ARTICLES_DIR)
  } catch {
    await fs.mkdir(ARTICLES_DIR, { recursive: true })
  }
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
    
    return articles
      .filter(article => article.status === 'published')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error reading articles:', error)
    return []
  }
}

// 读取单个文章
async function getArticle(slug: string): Promise<Article | null> {
  const articles = await getArticles()
  return articles.find(article => article.slug === slug) || null
}

// 获取相关文章
async function getRelatedArticles(articleId: string, count: number): Promise<Article[]> {
  const articles = await getArticles()
  return articles
    .filter(article => article.id !== articleId)
    .slice(0, count)
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const initialData = await loadInitialData()
  const { slug } = params
  
  const article = await getArticle(slug)
  const relatedArticles = article ? await getRelatedArticles(article.id, 3) : []

  // Create news detail module data
  const newsDetailModule = {
    moduleName: '新闻详情',
    moduleId: 'news-detail',
    moduleInstanceId: `news-detail-${Date.now()}`,
    data: {
      showAuthor: true,
      showDate: true,
      showRelated: true,
      relatedCount: 3,
      showShare: true,
      showComments: false,
      article, // 传递服务端获取的文章数据
      relatedArticles // 传递服务端获取的相关文章数据
    }
  }

  return (
    <div>
      <ModuleRenderer modules={[newsDetailModule]} />
    </div>
  )
}