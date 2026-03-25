import fs from "fs"
import path from "path"

// 全局缓存
let configCache: any = null
let cacheTimestamp: number = 0

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

// 辅助函数：优先读取 runtime 配置，如果不存在则读取默认配置
function readConfig(configDir: string, runtimeDir: string, filename: string): any {
  const runtimePath = path.join(runtimeDir, filename)
  const defaultPath = path.join(configDir, filename)

  try {
    if (fs.existsSync(runtimePath)) {
      return JSON.parse(fs.readFileSync(runtimePath, "utf-8"))
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

  const configs = {
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

  // 更新缓存
  configCache = configs
  cacheTimestamp = Date.now()
  console.log(`Config cache updated at ${new Date(cacheTimestamp).toISOString()}`)

  return configs
}

// 获取缓存配置
export function getCachedConfig() {
  return configCache
}

// 获取缓存时间戳
export function getCacheTimestamp() {
  return cacheTimestamp
}

// 设置文件监听
export function setupFileWatchers() {
  const configDir = path.join(process.cwd(), "config/json")
  const runtimeDir = path.join(configDir, "runtime")

  // 监听 runtime 目录
  if (fs.existsSync(runtimeDir)) {
    fs.watch(runtimeDir, (eventType, filename) => {
      if (filename && configFiles.includes(filename)) {
        console.log(`Config file changed: ${filename}, reloading cache...`)
        loadAllConfigs()
      }
    })
  }

  // 监听根配置目录
  fs.watch(configDir, (eventType, filename) => {
    if (filename && configFiles.includes(filename)) {
      console.log(`Config file changed: ${filename}, reloading cache...`)
      loadAllConfigs()
    }
  })

  console.log("File watchers set up for config files")
}

// 初始化缓存
if (configCache === null) {
  loadAllConfigs()
  setupFileWatchers()
}
