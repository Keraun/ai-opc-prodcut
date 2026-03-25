import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { createVersion } from "@/lib/version-manager"
import { logOperation } from "@/lib/operation-logger"
import { cookies } from "next/headers"

export async function GET() {
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
    const accountConfig = JSON.parse(fs.readFileSync(path.join(configDir, "system-account.json"), "utf-8"))
    const loginLogsConfig = JSON.parse(fs.readFileSync(path.join(configDir, "system-login-logs.json"), "utf-8"))
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
      account: accountConfig,
      loginLogs: loginLogsConfig,
      theme: themeConfig
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "获取配置失败"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    let configPath: string
    
    // 处理特殊的配置类型命名
    let fileName: string
    if (type === 'site') {
      fileName = 'site-config'
    } else if (type === 'common') {
      fileName = 'site-common'
    } else if (type === 'seo') {
      fileName = 'site-seo'
    } else if (type === 'navigation') {
      fileName = 'site-navigation'
    } else if (type === 'footer') {
      fileName = 'site-footer'
    } else if (type === 'home') {
      fileName = 'home-config'
    } else if (type === 'homeOrder') {
      fileName = 'home-order'
    } else if (type === 'homeBanner') {
      fileName = 'home-banner'
    } else if (type === 'homePartners') {
      fileName = 'home-partners'
    } else if (type === 'homeProducts') {
      fileName = 'home-products'
    } else if (type === 'homeServices') {
      fileName = 'home-services'
    } else if (type === 'homePricing') {
      fileName = 'home-pricing'
    } else if (type === 'homeAbout') {
      fileName = 'home-about'
    } else if (type === 'homeContact') {
      fileName = 'home-contact'
    } else if (type === 'products') {
      fileName = 'page-products'
    } else if (type === 'otherPages') {
      fileName = 'page-other'
    } else if (type === 'custom') {
      fileName = 'theme-custom'
    } else if (type === 'theme') {
      fileName = 'theme-config'
    } else if (type === 'account') {
      fileName = 'system-account'
    } else if (type === 'loginLogs') {
      fileName = 'system-login-logs'
    } else if (type === 'operationLogs') {
      fileName = 'system-operation-logs'
    } else if (type === 'verificationCodes') {
      fileName = 'system-verification-codes'
    } else {
      fileName = type
    }
    
    configPath = path.join(process.cwd(), `config/json/${fileName}.json`)
    
    let existingData: any = {}
    try {
      if (fs.existsSync(configPath)) {
        existingData = JSON.parse(fs.readFileSync(configPath, "utf-8"))
      }
    } catch (error) {
      console.error("Failed to read existing config:", error)
    }
    
    createVersion(type, existingData)
    
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2))

    const cookieStore = await cookies()
    const userCookie = cookieStore.get('adminUser')?.value
    let username = 'unknown'
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie)
        username = userData.username
      } catch (e) {
        console.error('Failed to parse user cookie:', e)
      }
    }
    
    const configNames: Record<string, string> = {
      site: '站点基础配置',
      common: '通用配置',
      seo: '站点SEO配置',
      navigation: '导航配置',
      footer: '底部配置',
      home: '首页配置',
      homeOrder: '区块顺序配置',
      homeBanner: 'Banner信息区块',
      homePartners: '伙伴信息区块',
      homeProducts: '产品信息区块',
      homeServices: '服务信息区块',
      homePricing: '价格信息区块',
      homeAbout: '关于我们区块',
      homeContact: '联系我们区块',
      products: '产品配置',
      otherPages: '其他页面配置',
      custom: '自定义配置'
    }
    const configName = configNames[type] || type
    logOperation(username, 'update_config', `更新${configName}`, 'unknown', { configType: type })

    return NextResponse.json({
      success: true,
      message: "配置保存成功"
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "配置保存失败"
    }, { status: 500 })
  }
}
