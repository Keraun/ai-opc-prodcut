import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-utils"
import { checkAdminAuth } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { siteId, siteUrl, cookies } = body

    if (!siteId || !siteUrl || !cookies) {
      return errorResponse("缺少必要参数")
    }

    let isValid = false
    let userInfo = null
    let testUrl = ""

    try {
      switch (siteId) {
        case "qwen":
          testUrl = "https://tongyi.aliyun.com/api/user/info"
          break
        case "openai":
          testUrl = "https://chat.openai.com/backend-api/me"
          break
        case "zhipu":
          testUrl = "https://chatglm.cn/api/user/info"
          break
        case "minimax":
          testUrl = "https://www.minimaxi.com/api/user/info"
          break
        case "claude":
          testUrl = "https://claude.ai/api/organizations"
          break
        case "doubao":
          testUrl = "https://www.doubao.com/"
          break
        case "wenxin":
          testUrl = "https://yiyan.baidu.com/"
          break
        case "kimi":
          testUrl = "https://kimi.moonshot.cn/"
          break
        case "deepseek":
          testUrl = "https://chat.deepseek.com/"
          break
        default:
          testUrl = siteUrl
      }

      console.log(`[Cookie Validate] Testing ${siteId} with URL: ${testUrl}`)

      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          "Cookie": cookies,
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Referer": siteUrl
        },
        redirect: "manual"
      })

      console.log(`[Cookie Validate] Response status: ${response.status}`)

      if (response.status === 200 || response.status === 302) {
        isValid = true
      } else if (response.status === 401 || response.status === 403) {
        isValid = false
      } else {
        isValid = response.status < 400
      }

    } catch (error) {
      console.error("Cookie validation error:", error)
      isValid = false
    }

    return successResponse({
      valid: isValid,
      testUrl,
      userInfo,
      message: isValid ? "Cookie 验证成功" : "Cookie 已失效或无效"
    })

  } catch (error) {
    console.error("Validate cookie error:", error)
    return errorResponse("验证失败: " + (error as Error).message)
  }
}
