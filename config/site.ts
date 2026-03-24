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
const pagesConfigData = loadConfig("pages.json")
const customConfigData = loadConfig("custom.json")

export const siteConfig = {
  name: siteConfigData.name || "创客AI",
  description: siteConfigData.description || "专注AI一人公司服务",
  url: siteConfigData.url || "https://makerai.com",
  ogImage: siteConfigData.ogImage || "/og-image.png",
  links: siteConfigData.links || {},
  creator: siteConfigData.creator || {},
}

export const seoConfig = commonConfigData.seo || {}

export const productsSeoConfig = commonConfigData.productsSeo || {}

export const navigationConfig = commonConfigData.navigation || {}

export const footerConfig = commonConfigData.footer || {}

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

export const productCategories: ProductCategory[] = pagesConfigData.products?.categories || []

export const products: Product[] = pagesConfigData.products?.items || []

export const productsConfig = pagesConfigData.homeProducts || []

export const servicesConfig = pagesConfigData.homeServices || []

export const heroConfig = pagesConfigData.hero || {}

export const aboutConfig = pagesConfigData.about || {}

export const pagesConfig: Record<string, {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}> = pagesConfigData.pages || {}

export const customConfigExport = customConfigData || {}
