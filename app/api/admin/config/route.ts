import { NextRequest, NextResponse } from "next/server"
import { readConfig, writeConfig, readAllConfigs, readTemplate } from "@/lib/config-manager"
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
