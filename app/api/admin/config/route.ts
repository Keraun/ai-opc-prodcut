import { NextRequest, NextResponse } from "next/server"
import { readConfig, writeConfig, readAllConfigs, readTemplate } from "@/lib/config-manager"
import { createVersion } from "@/lib/version-manager"
import { logOperation } from "@/lib/operation-logger"
import { cookies } from "next/headers"
import { loadAllConfigs } from "@/lib/config-cache"

export async function GET() {
  try {
    const configs = readAllConfigs()
    return NextResponse.json(configs)
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

    if (!type || data === undefined) {
      return NextResponse.json({
        success: false,
        message: "参数不完整"
      }, { status: 400 })
    }

    const existingData = readConfig(type)
    createVersion(type, existingData)
    writeConfig(type, data)

    // 刷新配置缓存
    loadAllConfigs()

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
      homeOrder: '区块顺序',
      homeBanner: '[区块]Banner信息',
      homePartners: '[区块]伙伴信息',
      homeProducts: '[区块]产品信息',
      homeServices: '[区块]服务信息',
      homePricing: '[区块]价格信息',
      homeAbout: '[区块]关于我们',
      homeContact: '[区块]联系我们',
      products: '产品配置',
      otherPages: '其他页面配置',
      custom: '自定义配置',
      theme: '主题配置',
      account: '账号配置'
    }
    const configName = configNames[type] || type
    logOperation(username, 'update_config', `更新${configName}`, 'unknown', { configType: type })

    return NextResponse.json({
      success: true,
      message: "配置保存成功"
    })
  } catch (error) {
    console.error("配置保存失败:", error)
    return NextResponse.json({
      success: false,
      message: "配置保存失败"
    }, { status: 500 })
  }
}
