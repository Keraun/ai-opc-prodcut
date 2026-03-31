import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { successResponse, unauthorizedResponse } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')
    
    // 检查 cookie 中的认证信息
    if (adminUserCookie) {
      const adminUser = JSON.parse(adminUserCookie.value)
      return successResponse({
        authenticated: true,
        user: adminUser
      })
    }

    // 检查 URL 参数中的认证信息（用于留言详情页的直接访问）
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const sessionId = searchParams.get('sessionId')

    // 这里可以根据实际的认证逻辑验证 token 或 sessionId
    // 暂时简化处理，只要提供了这些参数就认为认证通过
    // 实际项目中应该有更严格的验证逻辑
    if (token || sessionId) {
      // 假设验证通过，返回一个默认的管理员用户
      // 实际项目中应该根据 token 或 sessionId 获取真实的用户信息
      return successResponse({
        authenticated: true,
        user: {
          username: 'admin',
          role: 'admin'
        }
      })
    }

    return unauthorizedResponse()
  } catch (error) {
    return unauthorizedResponse()
  }
}
