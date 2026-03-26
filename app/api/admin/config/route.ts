import { NextRequest, NextResponse } from "next/server"
import { readConfig, writeConfig, readAllConfigs, readTemplate } from "@/lib/config-manager"
import { logOperation } from "@/lib/operation-logger"
import { cookies } from "next/headers"

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('adminUser')?.value
  return !!userCookie
}

export async function GET() {
  try {
    const isAuthenticated = await checkAdminAuth()
    if (!isAuthenticated) {
      return NextResponse.json({
        success: false,
        message: "未登录"
      }, { status: 401 })
    }
    
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
    const isAuthenticated = await checkAdminAuth()
    if (!isAuthenticated) {
      return NextResponse.json({
        success: false,
        message: "未登录"
      }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || data === undefined) {
      return NextResponse.json({
        success: false,
        message: "参数不完整"
      }, { status: 400 })
    }

    writeConfig(type, data)

    console.log(`Config updated: ${type}`)

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
      'page-home': '首页模块配置',
      'page-news': '新闻页模块配置',
      'page-product': '产品页模块配置',
      'page-new-detail': '新闻详情页模块配置',
      'page-404': '404页面模块配置',
      'site-root': '站点根模块',
      'site-header': '页头模块',
      'site-footer': '页脚模块',
      'site-navigation': '导航模块',
      'sidebar-nav': '侧边栏导航',
      'section-hero': 'Hero区块',
      'hero': 'Hero区块',
      'section-partner': '合作伙伴区块',
      'partners': '合作伙伴区块',
      'section-partners': '合作伙伴区块',
      'section-products': '产品区块',
      'products': '产品区块',
      'section-services': '服务区块',
      'services': '服务区块',
      'section-pricing': '价格区块',
      'pricing': '价格区块',
      'section-about': '关于我们区块',
      'about': '关于我们区块',
      'section-contact': '联系我们区块',
      'contact': '联系我们区块',
      'section-404': '404区块',
      'news-list': '新闻列表模块',
      'news-detail': '新闻详情模块',
      'product-list': '产品列表模块',
      theme: '主题配置',
      'theme-custom': '自定义主题',
      'theme-modern': '现代主题',
      'theme-nature': '自然主题',
      'theme-tech': '科技主题',
      account: '账号配置',
      token: 'Token配置',
      'operation-logs': '操作日志',
      'system-logs': '系统日志',
      'verification-codes': '验证码配置'
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
