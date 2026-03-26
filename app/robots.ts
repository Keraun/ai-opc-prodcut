import { MetadataRoute } from 'next'
import { readConfig } from '@/lib/config-manager'

function getSiteConfig() {
  try {
    return readConfig('site') || {}
  } catch (error) {
    console.error('Failed to read site config:', error)
    return {}
  }
}

function getSeoConfig() {
  try {
    return readConfig('site-seo') || {}
  } catch (error) {
    console.error('Failed to read seo config:', error)
    return {}
  }
}

export default function robots(): MetadataRoute.Robots {
  const siteConfig = getSiteConfig()
  const seoConfig = getSeoConfig()
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: seoConfig?.robots?.disallow || ['/api/', '/_next/', '/static/'],
    },
    sitemap: `${siteConfig?.url || 'https://makerai.com'}/sitemap.xml`,
  }
}
