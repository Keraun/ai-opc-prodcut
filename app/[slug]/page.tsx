import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GenericPage } from '@/components/common/GenericPage'
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
  const baseUrl = siteConfig?.url || 'http://localhost:3000'
  
  return {
    title: `${routeConfig?.title || slug} | ${siteConfig?.name || ''}`,
    description: routeConfig?.description || siteConfig?.description || '',
    openGraph: {
      title: `${routeConfig?.title || slug} | ${siteConfig?.name || ''}`,
      description: routeConfig?.description || siteConfig?.description || '',
      url: `${baseUrl}/${slug}`,
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
    
    return <GenericPage 
      pageId={pageId} 
      orderConfigKey={orderConfigKey} 
    />
  } catch (error) {
    console.error(`Error loading page ${slug}:`, error)
    notFound()
  }
}
