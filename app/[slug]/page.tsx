import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadPageData } from '@/lib/initial-data'
import { ModuleRenderer } from '@/modules/renderer'
import { siteConfig } from '@/config/site'
import { getRouteConfig, getAllSlugs } from '@/config/routes'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const routeConfig = getRouteConfig(slug)
  
  return {
    title: `${routeConfig?.title || slug} | ${siteConfig?.name || ''}`,
    description: routeConfig?.description || siteConfig?.description || '',
    openGraph: {
      title: `${routeConfig?.title || slug} | ${siteConfig?.name || ''}`,
      description: routeConfig?.description || siteConfig?.description || '',
      url: `${siteConfig?.url || 'https://makerai.com'}/${slug}`,
    },
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const routeConfig = getRouteConfig(slug)
  
  try {
    let pageId: string
    let orderConfigKey: string | undefined
    
    if (routeConfig) {
      pageId = routeConfig.pageId
      orderConfigKey = routeConfig.orderConfigKey
    } else {
      pageId = slug
      orderConfigKey = `${slug}Order`
    }
    
    const pageData = loadPageData(pageId, orderConfigKey)
    const modules = pageData.data.modules || []
    
    if (modules.length === 0) {
      notFound()
    }
    
    return <ModuleRenderer modules={modules} />
  } catch (error) {
    console.error(`Error loading page ${slug}:`, error)
    notFound()
  }
}
