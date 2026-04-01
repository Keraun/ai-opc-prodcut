import type { Metadata } from 'next'
import { readConfig } from '@/lib/config-manager'
import { jsonDb } from '@/lib/json-database'
import { GenericPage } from '@/components/common/GenericPage'

// 明确设置为动态渲染，确保每次请求都获取最新数据
export const dynamic = 'force-dynamic'

interface PageInfo {
  pageId: string
  name: string
  description?: string
  status: string
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

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const page = getPageByRoute('/test/[id]')
  const siteConfig = getSiteConfig()
  const baseUrl = siteConfig?.url || 'http://localhost:3000'
  
  return {
    title: `${page?.name || '测试页面'} | ${siteConfig?.name || ''}`,
    description: page?.description || siteConfig?.description || '',
    openGraph: {
      title: `${page?.name || '测试页面'} | ${siteConfig?.name || ''}`,
      description: page?.description || siteConfig?.description || '',
      url: `${baseUrl}/test/${id}`,
    },
  }
}

export default async function TestPage({ params }: PageProps) {
  const page = getPageByRoute('/test/[id]')
  
  if (!page) {
    return <GenericPage pageId="404" />
  }
  
  try {
    return <GenericPage pageId={page.pageId} />
  } catch (error) {
    console.error(`Error loading test page:`, error)
    return <GenericPage pageId="404" />
  }
}
