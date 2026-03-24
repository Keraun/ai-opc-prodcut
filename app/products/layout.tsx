import { Metadata } from 'next'
import { siteConfig, productsSeoConfig } from '@/config/site'

export const metadata: Metadata = {
  title: productsSeoConfig?.title,
  description: productsSeoConfig?.description,
  keywords: productsSeoConfig?.keywords,
  openGraph: {
    title: `${productsSeoConfig?.title || '产品服务'} | ${siteConfig?.name || '创客AI'}`,
    description: productsSeoConfig?.description,
    url: `${siteConfig?.url || 'https://makerai.com'}/products`,
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
