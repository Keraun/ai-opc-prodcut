import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-utils"
import { checkAdminAuth } from "@/lib/api-utils"
import { readConfig, writeConfig } from "@/lib/config-manager"

interface CookieData {
  siteId: string
  name: string
  url: string
  sessionData: {
    cookies: string | null
    storage: any | null
  }
  sessionRules: {
    useCookies: boolean
    storageKey: string[]
  }
  updatedAt: string
  expiresAt?: string
}

export async function GET() {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const cookies = readConfig('llm-cookies') || {}
    
    return successResponse(cookies)
  } catch (error) {
    console.error("Get cookies error:", error)
    return errorResponse("获取Cookie失败")
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    
    if (typeof body === 'object' && !body.siteId) {
      writeConfig('llm-cookies', body)
      return successResponse({ message: "Cookie保存成功" })
    }

    const { siteId, name, url, sessionData, sessionRules, expiresAt } = body

    if (!siteId || !name || !url) {
      return errorResponse("缺少必要参数")
    }

    const allCookies = readConfig('llm-cookies') || {}
    
    allCookies[siteId] = {
      siteId,
      name,
      url,
      sessionData: sessionData || { cookies: null, storage: null },
      sessionRules: sessionRules || { useCookies: false, storageKey: [] },
      updatedAt: new Date().toLocaleString("zh-CN"),
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    writeConfig('llm-cookies', allCookies)

    return successResponse({ message: "Cookie保存成功" })
  } catch (error) {
    console.error("Save cookie error:", error)
    return errorResponse("保存Cookie失败")
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("siteId")

    if (!siteId) {
      return errorResponse("缺少siteId参数")
    }

    const allCookies = readConfig('llm-cookies') || {}
    delete allCookies[siteId]
    writeConfig('llm-cookies', allCookies)

    return successResponse({ message: "Cookie删除成功" })
  } catch (error) {
    console.error("Delete cookie error:", error)
    return errorResponse("删除Cookie失败")
  }
}
