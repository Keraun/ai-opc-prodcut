import { NextRequest } from "next/server"
import { checkAdminAuth, successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-utils"
import { serverLogger } from "@/lib/server-logger"

export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { enabled } = body

    if (enabled === true) {
      serverLogger.enable()
      return successResponse({ enabled: true }, "日志已启用")
    } else if (enabled === false) {
      serverLogger.disable()
      return successResponse({ enabled: false }, "日志已禁用")
    } else {
      return errorResponse("参数错误，enabled 必须是 true 或 false", 400)
    }
  } catch (error) {
    console.error("Failed to toggle server logs:", error)
    return errorResponse("切换日志状态失败", 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse()
    }

    return successResponse({ enabled: serverLogger.isEnabled() })
  } catch (error) {
    console.error("Failed to get server log status:", error)
    return errorResponse("获取日志状态失败", 500)
  }
}
