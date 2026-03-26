import fs from "fs"
import path from "path"

// 配置文件列表
const configFiles = [
  "site-config.json",
  "site-common.json",
  "site-seo.json",
  "site-navigation.json",
  "site-footer.json",
  "home-config.json",
  "home-order.json",
  "home-banner.json",
  "home-partners.json",
  "home-products.json",
  "home-services.json",
  "home-pricing.json",
  "home-about.json",
  "home-contact.json",
  "page-products.json",
  "page-other.json",
  "page-news.json",
  "theme-custom.json",
  "theme-config.json"
]

// 短横线命名到驼峰命名的映射
const filenameToCamelCase: Record<string, string> = {
  "site-config.json": "site.json",
  "site-common.json": "common.json",
  "site-seo.json": "seo.json",
  "site-navigation.json": "navigation.json",
  "site-footer.json": "footer.json",
  "home-config.json": "home.json",
  "home-order.json": "homeOrder.json",
  "home-banner.json": "homeBanner.json",
  "home-partners.json": "homePartners.json",
  "home-products.json": "homeProducts.json",
  "home-services.json": "homeServices.json",
  "home-pricing.json": "homePricing.json",
  "home-about.json": "homeAbout.json",
  "home-contact.json": "homeContact.json",
  "page-products.json": "products.json",
  "page-other.json": "otherPages.json",
  "page-news.json": "news.json",
  "theme-custom.json": "custom.json",
  "theme-config.json": "theme.json"
}

// 辅助函数：优先读取 runtime 配置，如果不存在则读取默认配置
function readConfig(configDir: string, runtimeDir: string, filename: string): any {
  // runtime 目录使用驼峰命名
  const runtimeFilename = filenameToCamelCase[filename] || filename
  const runtimePath = path.join(runtimeDir, runtimeFilename)
  
  // templates 目录使用短横线命名
  const templatesPath = path.join(configDir, "templates", filename)
  
  // 根目录配置文件
  const defaultPath = path.join(configDir, filename)

  try {
    if (fs.existsSync(runtimePath)) {
      return JSON.parse(fs.readFileSync(runtimePath, "utf-8"))
    }
    if (fs.existsSync(templatesPath)) {
      return JSON.parse(fs.readFileSync(templatesPath, "utf-8"))
    }
    if (fs.existsSync(defaultPath)) {
      return JSON.parse(fs.readFileSync(defaultPath, "utf-8"))
    }
  } catch (error) {
    console.error(`Failed to read config: ${filename}`, error)
  }
  return {}
}

// 加载所有配置
export function loadAllConfigs() {
  const configDir = path.join(process.cwd(), "config/json")
  const runtimeDir = path.join(configDir, "runtime")

  const siteConfig = readConfig(configDir, runtimeDir, "site-config.json")
  const commonConfig = readConfig(configDir, runtimeDir, "site-common.json")
  const seoConfig = readConfig(configDir, runtimeDir, "site-seo.json")
  const navigationConfig = readConfig(configDir, runtimeDir, "site-navigation.json")
  const footerConfig = readConfig(configDir, runtimeDir, "site-footer.json")
  const homeConfig = readConfig(configDir, runtimeDir, "home-config.json")
  const homeOrderConfig = readConfig(configDir, runtimeDir, "home-order.json")
  const homeBannerConfig = readConfig(configDir, runtimeDir, "home-banner.json")
  const homePartnersConfig = readConfig(configDir, runtimeDir, "home-partners.json")
  const homeProductsConfig = readConfig(configDir, runtimeDir, "home-products.json")
  const homeServicesConfig = readConfig(configDir, runtimeDir, "home-services.json")
  const homePricingConfig = readConfig(configDir, runtimeDir, "home-pricing.json")
  const homeAboutConfig = readConfig(configDir, runtimeDir, "home-about.json")
  const homeContactConfig = readConfig(configDir, runtimeDir, "home-contact.json")
  const productsConfig = readConfig(configDir, runtimeDir, "page-products.json")
  const otherPagesConfig = readConfig(configDir, runtimeDir, "page-other.json")
  const newsConfig = readConfig(configDir, runtimeDir, "page-news.json")
  const customConfig = readConfig(configDir, runtimeDir, "theme-custom.json")
  const themeConfig = readConfig(configDir, runtimeDir, "theme-config.json")

  return {
    site: siteConfig,
    common: commonConfig,
    seo: seoConfig,
    navigation: navigationConfig,
    footer: footerConfig,
    home: homeConfig,
    homeOrder: homeOrderConfig,
    homeBanner: homeBannerConfig,
    homePartners: homePartnersConfig,
    homeProducts: homeProductsConfig,
    homeServices: homeServicesConfig,
    homePricing: homePricingConfig,
    homeAbout: homeAboutConfig,
    homeContact: homeContactConfig,
    products: productsConfig,
    otherPages: otherPagesConfig,
    news: newsConfig,
    custom: customConfig,
    theme: themeConfig
  }
}
