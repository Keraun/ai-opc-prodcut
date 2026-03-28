export interface SiteRootData {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    email: string
    wechat: string
    github: string
    twitter: string
  }
  creator: {
    name: string
    url: string
  }
  contact: {
    address: string
    phone: string
    email: string
  }
  support: {
    customerServiceQRCode: string
    helpDocUrl: string
  }
  icp: string
  features: {
    enableTOC: boolean
    enableReadingProgress: boolean
    enableSearch: boolean
  }
  seo: {
    keywords: string[]
    robots: {
      index: boolean
      follow: boolean
      googleBot: {
        index: boolean
        follow: boolean
        maxVideoPreview: number
        maxImagePreview: 'none' | 'standard' | 'large'
        maxSnippet: number
      }
    }
  }
  currentTheme: string
}
