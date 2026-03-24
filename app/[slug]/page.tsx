import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { pagesConfig, siteConfig } from '@/config/site'
import DynamicPageContent from './DynamicPageContent'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(pagesConfig).map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pageConfig = pagesConfig[slug]
  
  if (!pageConfig) {
    return {
      title: '页面未找到',
    }
  }
  
  return {
    title: pageConfig.title,
    description: pageConfig.description,
    openGraph: {
      title: `${pageConfig.title} | ${siteConfig?.name || '创客AI'}`,
      description: pageConfig.description,
      url: `${siteConfig?.url || 'https://makerai.com'}/${slug}`,
    },
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const pageConfig = pagesConfig[slug]
  
  if (!pageConfig) {
    notFound()
  }
  
  return <DynamicPageContent pageConfig={pageConfig} slug={slug} />
}
