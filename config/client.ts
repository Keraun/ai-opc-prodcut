// Fallback static imports for initial load
import siteConfigData from "./json/site-config.json"
import commonConfig from "./json/site-common.json"
import seoConfigData from "./json/site-seo.json"
import navigationConfigData from "./json/site-navigation.json"
import footerConfigData from "./json/site-footer.json"
import homeConfig from "./json/home-config.json"
import homeOrderConfig from "./json/home-order.json"
import productsConfigData from "./json/page-products.json"
import otherPagesConfig from "./json/page-other.json"
import customConfig from "./json/theme-custom.json"
import accountConfig from "./json/system-account.json"

export const siteConfig = {
  ...siteConfigData,
  contact: siteConfigData.contact || {},
  icp: siteConfigData.icp || ""
}

export { commonConfig, customConfig, accountConfig }

export const seoConfig = seoConfigData.seo || {}

export const productsSeoConfig = seoConfigData.productsSeo || {}

export const navigationConfig = navigationConfigData.navigation || {}

export const footerConfig = footerConfigData.footer || {}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  image: string
  tags: string[]
  category: string
  details?: {
    type?: 'markdown' | 'html' | 'link'
    content?: string
    link?: string
  }
}

export interface ProductCategory {
  key: string
  title: string
}

export const productCategories: ProductCategory[] = productsConfigData.products?.categories || []

export const products: Product[] = productsConfigData.products?.items || []

export const productsConfig = homeConfig.products?.items || []

export const servicesConfig = homeConfig.services?.items || []

export const heroConfig = homeConfig.hero || {}

export const aboutConfig = homeConfig.about || {}
export const pricingConfig = homeConfig.pricing || {}
export const sectionsConfig = homeOrderConfig.sections || []

export const pagesConfigExport: Record<string, {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}> = (otherPagesConfig.pages || {}) as Record<string, {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}>

export const customConfigExport = customConfig || {}

// Dynamic fetch function for server-side rendering
export async function fetchConfig() {
  try {
    const response = await fetch('/api/config')
    if (!response.ok) {
      throw new Error('获取配置失败')
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch config:', error)
    // Return fallback static configs
    return {
      site: siteConfigData,
      common: commonConfig,
      seo: seoConfigData,
      navigation: navigationConfigData,
      footer: footerConfigData,
      home: homeConfig,
      homeOrder: homeOrderConfig,
      products: productsConfigData,
      otherPages: otherPagesConfig,
      custom: customConfig
    }
  }
}

