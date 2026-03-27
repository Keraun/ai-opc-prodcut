import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { readConfig } from "@/lib/config-manager"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')
    
    if (!adminUserCookie) {
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    }

    const adminUser = JSON.parse(adminUserCookie.value)
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ success: false, message: '密码不能为空' }, { status: 400 })
    }

    let tokenConfig = readConfig('token') || { superAdminToken: '' }
    
    if (!tokenConfig.superAdminToken) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      tokenConfig = { superAdminToken: Buffer.from(result).toString('base64') }
    }

    if (password !== tokenConfig.superAdminToken) {
      return NextResponse.json({ success: false, message: '超级管理员口令错误' }, { status: 401 })
    }

    return NextResponse.json({ success: true, token: tokenConfig.superAdminToken })
  } catch (error) {
    console.error("获取超级管理员口令失败:", error)
    return NextResponse.json({ success: false, message: '获取超级管理员口令失败' }, { status: 500 })
  }
}
