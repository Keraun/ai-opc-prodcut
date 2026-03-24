import "server-only"
import fs from "fs"
import path from "path"

const configDir = path.join(process.cwd(), "config/json")

const loadConfig = (filename: string) => {
  try {
    const filePath = path.join(configDir, filename)
    const content = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(content)
  } catch (error) {
    console.error(`Failed to load config: ${filename}`, error)
    return {}
  }
}

const siteConfigData = loadConfig("site.json")
const commonConfigData = loadConfig("common.json")
const seoConfigData = loadConfig("seo.json")
const navigationConfigData = loadConfig("navigation.json")
const footerConfigData = loadConfig("footer.json")
const homeConfigData = loadConfig("home.json")
const productsConfigData = loadConfig("products.json")
const otherPagesConfigData = loadConfig("other-pages.json")
const customConfigData = loadConfig("custom.json")
const accountConfigData = loadConfig("account.json")

export const siteConfig = {
  name: siteConfigData.name || "创客AI",
  description: siteConfigData.description || "专注AI一人公司服务",
  url: siteConfigData.url || "https://makerai.com",
  ogImage: siteConfigData.ogImage || "/og-image.png",
  links: siteConfigData.links || {},
  creator: siteConfigData.creator || {},
}

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

export const productCategories: ProductCategory[] = productsConfigData.products?.categories || []

export const products: Product[] = productsConfigData.products?.items || []

export const productsConfig = homeConfigData.homeProducts || []

export const servicesConfig = homeConfigData.homeServices || []

export const heroConfig = homeConfigData.hero || {}

export const aboutConfig = homeConfigData.about || {}

export const pagesConfig: Record<string, {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}> = otherPagesConfigData.pages || {}

export const customConfigExport = customConfigData || {}

export const accountConfigExport = accountConfigData || {}
