import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const configDir = path.join(process.cwd(), "config/json")
    
    const siteConfig = JSON.parse(fs.readFileSync(path.join(configDir, "site-config.json"), "utf-8"))
    const commonConfig = JSON.parse(fs.readFileSync(path.join(configDir, "site-common.json"), "utf-8"))
    const seoConfig = JSON.parse(fs.readFileSync(path.join(configDir, "site-seo.json"), "utf-8"))
    const navigationConfig = JSON.parse(fs.readFileSync(path.join(configDir, "site-navigation.json"), "utf-8"))
    const footerConfig = JSON.parse(fs.readFileSync(path.join(configDir, "site-footer.json"), "utf-8"))
    const homeConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home-config.json"), "utf-8"))
    const homeOrderConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home-order.json"), "utf-8"))
    const homeBannerConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home-banner.json"), "utf-8"))
    const homePartnersConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home-partners.json"), "utf-8"))
    const homeProductsConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home-products.json"), "utf-8"))
    const homeServicesConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home-services.json"), "utf-8"))
    const homePricingConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home-pricing.json"), "utf-8"))
    const homeAboutConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home-about.json"), "utf-8"))
    const homeContactConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home-contact.json"), "utf-8"))
    const productsConfig = JSON.parse(fs.readFileSync(path.join(configDir, "page-products.json"), "utf-8"))
    const otherPagesConfig = JSON.parse(fs.readFileSync(path.join(configDir, "page-other.json"), "utf-8"))
    const customConfig = JSON.parse(fs.readFileSync(path.join(configDir, "theme-custom.json"), "utf-8"))
    const themeConfig = JSON.parse(fs.readFileSync(path.join(configDir, "theme-config.json"), "utf-8"))

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
    return NextResponse.json({
      success: false,
      message: "获取配置失败"
    }, { status: 500 })
  }
}
