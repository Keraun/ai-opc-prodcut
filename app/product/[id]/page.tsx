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

interface Product {
  id: number
  title: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  tags: string[]
  category: string
  categoryName: string
  features: string[]
  salesCount: number
  rating: number
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

function getProduct(id: string): Product | undefined {
  try {
    const products = jsonDb.getAll('products')
    const product = products.find((p: any) => p.id === parseInt(id) && p.status === 'active')
    if (!product) return undefined
    return product
  } catch (error) {
    console.error('Failed to get product:', error)
    return undefined
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const page = getPageByRoute('/product/[id]')
  const siteConfig = getSiteConfig()
  const product = getProduct(id)
  const baseUrl = siteConfig?.url || 'http://localhost:3000'
  
  const title = product 
    ? `${product.title} - ${product.categoryName} | ${siteConfig?.name || ''}`
    : `${page?.name || '产品详情'} | ${siteConfig?.name || ''}`
  
  const description = product 
    ? product.description
    : page?.description || siteConfig?.description || ''
  
  const keywords = product 
    ? [...product.tags, product.categoryName, product.title].join(', ')
    : siteConfig?.seo?.keywords?.join(', ') || ''
  
  const ogImage = product 
    ? (product.mainImage || product.image)
    : siteConfig?.ogImage || ''
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/product/${id}`,
      type: 'website',
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
