import { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { readConfig } from "@/lib/config-manager"
import { successResponse, errorResponse, badRequestResponse, unauthorizedResponse } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')
    
    if (!adminUserCookie) {
      return unauthorizedResponse()
    }

    const adminUser = JSON.parse(adminUserCookie.value)
    const body = await request.json()
    const { password } = body

    if (!password) {
      return badRequestResponse('密码不能为空')
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
      return unauthorizedResponse('超级管理员口令错误')
    }

    return successResponse({ token: tokenConfig.superAdminToken })
  } catch (error) {
    console.error("获取超级管理员口令失败:", error)
    return errorResponse('获取超级管理员口令失败')
  }
}
