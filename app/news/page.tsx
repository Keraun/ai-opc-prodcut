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

export default async function NewsPage() {
  const articles = await getArticles()
  const pageData = loadPageData('news', 'newsOrder', {
    title: '资讯中心',
    subtitle: '最新行业动态、深度分析与实战案例',
    showDate: true,
    showSummary: true,
    itemsPerPage: 10,
    articles
  })

  const modules = pageData.data.modules || []

  return <ModuleRenderer modules={modules} />
}
