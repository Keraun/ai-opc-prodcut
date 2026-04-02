import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { readConfig } from '@/lib/config-manager'
import { jsonDb } from '@/lib/json-database'
import { GenericPage } from '@/components/common/GenericPage'
import { CrawlerArticle } from '@/components/crawler/CrawlerArticle'
import { isCrawler } from '@/lib/device-utils'

// 明确设置为动态渲染，确保每次请求都获取最新数据
export const dynamic = 'force-dynamic'

interface PageInfo {
  pageId: string
  name: string
  description?: string
  status: string
}

interface Article {
  id: number
  title: string
  summary: string
  content: string
  date: string
  slug: string
  image: string
  mainImage?: string
  author: string
  category: string
  tags: string[]
  viewCount: number
  status: string
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

function getPageByRoute(route: string): PageInfo | undefined {
  try {
    const pages = jsonDb.getAll('pages')
    const page = pages.find((p: any) => p.route === route && p.status === 'published')
    if (!page) return undefined
    
    return {
      pageId: page.page_id,
      name: page.name,
      description: page.description,
      status: page.status
    }
  } catch (error) {
    console.error('Failed to get page by route:', error)
    return undefined
  }
}

function getSiteConfig() {
  try {
    return readConfig('site') || {}
  } catch (error) {
    console.error('Failed to read site config:', error)
    return {}
  }
}

function getArticle(id: string): Article | undefined {
  try {
    const articles = jsonDb.getAll('articles')
    const article = articles.find((a: any) => a.id === parseInt(id) && a.status === 'published')
    if (!article) return undefined
    return article
  } catch (error) {
    console.error('Failed to get article:', error)
    return undefined
  }
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const page = getPageByRoute('/news/[id]')
  const siteConfig = getSiteConfig()
  const article = getArticle(id)
  const baseUrl = siteConfig?.url || 'http://localhost:3000'
  
  const title = article?.seo?.title 
    ? `${article.seo.title} | ${siteConfig?.name || ''}`
    : article 
      ? `${article.title} - ${article.category} | ${siteConfig?.name || ''}`
      : `${page?.name || '资讯详情'} | ${siteConfig?.name || ''}`
  
  const description = article?.seo?.description 
    ? article.seo.description
    : article 
      ? article.summary
      : page?.description || siteConfig?.description || ''
  
  const keywords = article?.seo?.keywords && article.seo.keywords.length > 0
    ? article.seo.keywords.join(', ')
    : article 
      ? [...article.tags, article.category, article.title].join(', ')
      : siteConfig?.seo?.keywords?.join(', ') || ''
  
  const ogImage = article 
    ? (article.mainImage || article.image)
    : siteConfig?.ogImage || ''
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/news/${id}`,
      type: 'article',
      publishedTime: article?.date,
      authors: article?.author ? [article.author] : undefined,
      images: ogImage ? [{ url: `${baseUrl}${ogImage}`, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [`${baseUrl}${ogImage}`] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function NewsDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const searchParamsData = await searchParams
  const page = getPageByRoute('/news/[id]')
  
  if (!page) {
    return <GenericPage pageId="404" />
  }
  
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const isCrawlerRequest = isCrawler(userAgent)
    
    const article = getArticle(id)
    
    const isDebugCrawler = searchParamsData.isCrawle === 'true' || searchParamsData.isCrawle === '1'
    
    if ((isCrawlerRequest || isDebugCrawler) && article) {
      return <CrawlerArticle article={article} />
    }
    
    const extraConfig = article ? {
      ssrArticle: article
    } : {}
    
    return <GenericPage pageId={page.pageId} extraConfig={extraConfig} />
  } catch (error) {
    console.error(`Error loading news detail page:`, error)
    return <GenericPage pageId="404" />
  }
}
