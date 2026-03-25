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
  contact: {
    address: "浙江省杭州市西湖区三墩镇西园八路3号浙大森林",
    phone: "400-888-4889",
    email: "wuly93@163.com"
  },
  support: {
    customerServiceQRCode: "/images/customer-service-qr.png",
    helpDocUrl: "https://help.makerai.com"
  },
  icp: "浙ICP备XXXXXXXX号"
}

export const commonConfig = {
  version: "1.0.0",
  buildDate: new Date().toISOString()
}

export const seoConfig = {
  title: "创客AI - 专注AI一人公司服务",
  description: "创客AI为AI一人公司提供全方位的技术支持和解决方案",
  keywords: ["AI", "人工智能", "一人公司", "技术支持", "解决方案"],
  ogImage: "/og-image.png"
}

export const productsSeoConfig = {}

export const navigationConfig = {
  main: [
    { label: "首页", href: "/" },
    { label: "关于我们", href: "/about" },
    { label: "产品服务", href: "/products" },
    { label: "联系我们", href: "/contact" }
  ],
  footer: [
    { label: "首页", href: "/" },
    { label: "关于我们", href: "/about" },
    { label: "产品服务", href: "/products" },
    { label: "联系我们", href: "/contact" }
  ]
}

export const footerConfig = {
  copyright: "© 2024 创客AI. All rights reserved.",
  links: [
    { name: "隐私政策", url: "/privacy" },
    { name: "服务条款", url: "/terms" },
    { name: "帮助中心", url: "/help" }
  ],
  social: {
    wechat: "makerai_official",
    github: "https://github.com/makerai",
    twitter: "https://twitter.com/makerai"
  }
}

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
    type?: string
    content?: string
    link?: string
  }
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

export const pricingConfig = {}

export const sectionsConfig = []

export const pagesConfigExport: Record<string, {
  title: string
  description?: string
  contentType: 'markdown' | 'html'
  content: string
  showTOC?: boolean
}> = {}

export const customConfig = {}

export const accountConfig = {
  username: "admin",
  email: "admin@makerai.com",
  mustChangePassword: true
}

// Dynamic fetch function for server-side rendering
export async function fetchConfig() {
  try {
    const response = await fetch('/api/admin/config')
    if (!response.ok) {
      throw new Error('获取配置失败')
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch config:', error)
    return {
      site: siteConfig,
      common: commonConfig,
      seo: seoConfig,
      navigation: navigationConfig,
      footer: footerConfig,
      home: {},
      homeOrder: {},
      products: {},
      otherPages: {},
      custom: customConfig,
      account: accountConfig
    }
  }
}