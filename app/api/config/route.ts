import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

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

export async function GET(request: NextRequest) {
  try {
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
    const customConfig = readConfig(configDir, runtimeDir, "theme-custom.json")
    const themeConfig = readConfig(configDir, runtimeDir, "theme-config.json")

    return NextResponse.json({
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
      custom: customConfig,
      theme: themeConfig
    })
  } catch (error) {
    console.error("Config API error:", error)
    return NextResponse.json({
      success: false,
      message: "获取配置失败"
    }, { status: 500 })
  }
}
