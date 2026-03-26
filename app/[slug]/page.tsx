import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GenericPage } from '@/components/common/GenericPage'
import { readConfig } from '@/lib/config-manager'

interface RouteConfig {
  title: string
  description?: string
  pageId: string
  orderConfigKey?: string
}

const routeConfigMap: Record<string, RouteConfig> = {
  'home': {
    title: '首页',
    description: '创客AI - 专注AI一人公司服务',
    pageId: 'home'
  },
  'about': {
    title: '关于我们',
    pageId: 'home'
  },
  'products': {
    title: '产品服务',
    pageId: 'product'
  },
  'contact': {
    title: '联系我们',
    pageId: 'home'
  },
  'news': {
    title: '新闻资讯',
    pageId: 'news'
  }
}

function getRouteConfig(slug: string): RouteConfig | undefined {
  return routeConfigMap[slug]
}

function getAllSlugs(): string[] {
  return Object.keys(routeConfigMap)
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
  const siteConfig = getSiteConfig()
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
