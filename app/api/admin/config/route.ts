import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { createVersion } from "@/lib/version-manager"
import { logOperation } from "@/lib/operation-logger"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const configDir = path.join(process.cwd(), "config/json")
    
    const siteConfig = JSON.parse(fs.readFileSync(path.join(configDir, "site.json"), "utf-8"))
    const commonConfig = JSON.parse(fs.readFileSync(path.join(configDir, "common.json"), "utf-8"))
    const seoConfig = JSON.parse(fs.readFileSync(path.join(configDir, "seo.json"), "utf-8"))
    const navigationConfig = JSON.parse(fs.readFileSync(path.join(configDir, "navigation.json"), "utf-8"))
    const footerConfig = JSON.parse(fs.readFileSync(path.join(configDir, "footer.json"), "utf-8"))
    const homeConfig = JSON.parse(fs.readFileSync(path.join(configDir, "home.json"), "utf-8"))
    const productsConfig = JSON.parse(fs.readFileSync(path.join(configDir, "products.json"), "utf-8"))
    const otherPagesConfig = JSON.parse(fs.readFileSync(path.join(configDir, "other-pages.json"), "utf-8"))
    const customConfig = JSON.parse(fs.readFileSync(path.join(configDir, "custom.json"), "utf-8"))
    const accountConfig = JSON.parse(fs.readFileSync(path.join(configDir, "account.json"), "utf-8"))
    const loginLogsConfig = JSON.parse(fs.readFileSync(path.join(configDir, "login-logs.json"), "utf-8"))

    return NextResponse.json({
      site: siteConfig,
      common: commonConfig,
      seo: seoConfig,
      navigation: navigationConfig,
      footer: footerConfig,
      home: homeConfig,
      products: productsConfig,
      otherPages: otherPagesConfig,
      custom: customConfig,
      account: accountConfig,
      loginLogs: loginLogsConfig
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
    
    if (type === 'otherPages') {
      configPath = path.join(process.cwd(), "config/json/other-pages.json")
    } else {
      configPath = path.join(process.cwd(), `config/json/${type}.json`)
    }
    
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
      site: '站点配置',
      common: '通用配置',
      seo: 'SEO配置',
      navigation: '导航配置',
      footer: '底部配置',
      home: '首页配置',
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
