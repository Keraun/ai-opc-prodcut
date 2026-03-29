import type { Metadata } from 'next'
import { readConfig } from '@/lib/config-manager'
import { jsonDb } from '@/lib/json-database'
import { GenericPage } from '@/components/common/GenericPage'

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
  const page = getPageByRoute('/product/[id]')
  const siteConfig = getSiteConfig()
  const baseUrl = siteConfig?.url || 'http://localhost:3000'
  
  return {
    title: `${page?.name || '产品详情'} | ${siteConfig?.name || ''}`,
    description: page?.description || siteConfig?.description || '',
    openGraph: {
      title: `${page?.name || '产品详情'} | ${siteConfig?.name || ''}`,
      description: page?.description || siteConfig?.description || '',
      url: `${baseUrl}/product/${id}`,
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const page = getPageByRoute('/product/[id]')
  
  if (!page) {
    return <GenericPage pageId="404" />
  }
  
  try {
    return <GenericPage pageId={page.pageId} />
  } catch (error) {
    console.error(`Error loading product detail page:`, error)
    return <GenericPage pageId="404" />
  }
}
