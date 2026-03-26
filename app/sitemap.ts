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

export default function sitemap(): MetadataRoute.Sitemap {
  const siteConfig = getSiteConfig()
  const baseUrl = siteConfig?.url || 'https://makerai.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}
