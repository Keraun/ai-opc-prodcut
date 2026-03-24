import siteConfigData from "./json/site.json"
import commonConfig from "./json/common.json"
import seoConfigData from "./json/seo.json"
import navigationConfigData from "./json/navigation.json"
import footerConfigData from "./json/footer.json"
import pagesConfig from "./json/pages.json"
import customConfig from "./json/custom.json"
import accountConfig from "./json/account.json"

export const siteConfig = {
  ...siteConfigData,
  contact: siteConfigData.contact || {},
  icp: siteConfigData.icp || ""
}

export { commonConfig, pagesConfig, customConfig, accountConfig }

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
