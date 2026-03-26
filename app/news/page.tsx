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

export default async function NewsPage() {
  const initialData = await loadInitialData()
  const articles = await getArticles()

  // Create news list module data
  const newsListModule = {
    moduleName: '新闻列表',
    moduleId: 'news-list',
    moduleInstanceId: `news-list-${Date.now()}`,
    data: {
      title: '资讯中心',
      subtitle: '最新行业动态、深度分析与实战案例',
      showDate: true,
      showSummary: true,
      itemsPerPage: 10,
      articles // 传递服务端获取的文章数据
    }
  }

  return (
    <div>
      <ModuleRenderer modules={[newsListModule]} />
    </div>
  )
}