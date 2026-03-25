import "server-only"
import { readConfig } from "@/lib/config-manager"

export const siteConfig = {
  name: "创客AI",
  description: "专注AI一人公司服务",
  url: "https://makerai.com",
  ogImage: "/og-image.png",
  links: {
    email: "wuly93@163.com",
    wechat: "makerai_official",
    github: "https://github.com/makerai",
    twitter: "https://twitter.com/makerai"
  },
  creator: {
    name: "创客AI",
    url: "https://makerai.com"
  },
}

export const seoConfig = {}

export const productsSeoConfig = {}

export const navigationConfig = {}

export const footerConfig = {}

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

export const productCategories: ProductCategory[] = []

export const products: Product[] = []

export const productsConfig = []

export const servicesConfig = []

export const heroConfig = {}

export const aboutConfig = {}

export const sectionsConfig = []

export const pagesConfig: Record<string, {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}> = {}

export const customConfigExport = {}

export const accountConfigExport = {}