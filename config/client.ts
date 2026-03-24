import siteConfigData from "./json/site.json"
import commonConfig from "./json/common.json"
import pagesConfig from "./json/pages.json"
import customConfig from "./json/custom.json"

export const siteConfig = {
  ...siteConfigData,
  contact: siteConfigData.contact || {},
  icp: siteConfigData.icp || ""
}

export { commonConfig, pagesConfig, customConfig }

export const seoConfig = commonConfig.seo || {}

export const productsSeoConfig = commonConfig.productsSeo || {}

export const navigationConfig = commonConfig.navigation || {}

export const footerConfig = commonConfig.footer || {}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  image: string
  tags: string[]
  category: string
}

export interface ProductCategory {
  key: string
  title: string
}

export const productCategories: ProductCategory[] = pagesConfig.products?.categories || []

export const products: Product[] = pagesConfig.products?.items || []

export const productsConfig = pagesConfig.homeProducts || []

export const servicesConfig = pagesConfig.homeServices || []

export const heroConfig = pagesConfig.hero || {}

export const aboutConfig = pagesConfig.about || {}

export const pagesConfigExport: Record<string, {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}> = (pagesConfig.pages || {}) as Record<string, {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}>

export const customConfigExport = customConfig || {}
