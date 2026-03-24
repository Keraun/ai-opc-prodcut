import { MetadataRoute } from 'next'
import { siteConfig, seoConfig } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: seoConfig?.robots?.disallow || ['/api/', '/_next/', '/static/'],
    },
    sitemap: `${siteConfig?.url || 'https://makerai.com'}/sitemap.xml`,
  }
}
