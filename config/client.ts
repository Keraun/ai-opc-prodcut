import siteConfigData from "./json/site.json"
import commonConfig from "./json/common.json"
import seoConfigData from "./json/seo.json"
import navigationConfigData from "./json/navigation.json"
import footerConfigData from "./json/footer.json"
import homeConfig from "./json/home.json"
import productsConfigData from "./json/products.json"
import otherPagesConfig from "./json/other-pages.json"
import customConfig from "./json/custom.json"
import accountConfig from "./json/account.json"

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
export const sectionsConfig = homeConfig.sections || []

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
