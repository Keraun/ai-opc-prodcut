import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GenericPage } from '@/components/common/GenericPage'
import { readConfig } from '@/lib/config-manager'
import { jsonDb } from '@/lib/json-database'

interface PageInfo {
  pageId: string
  name: string
  slug: string
  route: string
  description?: string
  status: string
}

function getAllPages(): PageInfo[] {
  try {
    // 每次都重新加载数据，确保获取到最新的数据
    jsonDb.reload()
    const pages = jsonDb.getAll('pages')
    return pages
      .filter((page: any) => page.status === 'published')
      .map((page: any) => ({
        pageId: page.page_id,
        name: page.name,
        slug: page.slug,
        route: page.route,
        description: page.description,
        status: page.status
      }))
  } catch (error) {
    console.error('Failed to get pages:', error)
    return []
  }
}

function getPageBySlug(slug: string): PageInfo | undefined {
  const pages = getAllPages()
  return pages.find(page => page.slug === slug)
}

function getSiteConfig() {
  try {
    return readConfig('site') || {}
  } catch (error) {
    console.error('Failed to read site config:', error)
    return {}
  }
}

function pageModuleExists(pageId: string): boolean {
  try {
    // 每次都重新加载数据，确保获取到最新的数据
    jsonDb.reload()
    const page = jsonDb.findOne('pages', { page_id: pageId })
    if (!page) return false
    
    const pageModules = jsonDb.find('page_modules', { page_id: pageId })
    return pageModules && pageModules.length > 0
  } catch {
    return false
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// 移除静态生成，使用服务器端渲染，确保每次请求都获取最新数据

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getPageBySlug(slug)
  const siteConfig = getSiteConfig()
  const baseUrl = siteConfig?.url || 'http://localhost:3000'
  
  return {
    title: `${page?.name || slug} | ${siteConfig?.name || ''}`,
    description: page?.description || siteConfig?.description || '',
    openGraph: {
      title: `${page?.name || slug} | ${siteConfig?.name || ''}`,
      description: page?.description || siteConfig?.description || '',
      url: `${baseUrl}/${slug}`,
    },
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const page = getPageBySlug(slug)
  
  if (!page) {
    return <GenericPage pageId="404" />
  }
  
  if (!pageModuleExists(page.pageId)) {
    return <GenericPage pageId="404" />
  }
  
  try {
    return <GenericPage pageId={page.pageId} />
  } catch (error) {
    console.error(`Error loading page ${slug}:`, error)
    return <GenericPage pageId="404" />
  }
}
