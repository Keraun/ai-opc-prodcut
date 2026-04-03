import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-utils"
import { checkAdminAuth } from "@/lib/api-utils"

interface ValidationSession {
  browser: any
  page: any
  context: any
  status: "initializing" | "validating" | "completed" | "error"
  isValid: boolean | null
  error: string | null
  siteId: string
  createdAt: Date
}

const validationSessions = new Map<string, ValidationSession>()

let isPlaywrightAvailable = true

async function checkPlaywright() {
  try {
    const { chromium } = await import("playwright")
    return true
  } catch (error) {
    console.warn("Playwright not available:", error)
    isPlaywrightAvailable = false
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    if (!isPlaywrightAvailable) {
      const available = await checkPlaywright()
      if (!available) {
        return errorResponse("服务器环境不支持浏览器自动化，请使用手动方式设置Cookie", 501)
      }
    }

    const body = await request.json()
    const { siteId, siteUrl, cookies } = body

    if (!siteId || !siteUrl || !cookies) {
      return errorResponse("缺少必要参数")
    }

    const sessionId = `${siteId}-validate-${Date.now()}`

    validationSessions.set(sessionId, {
      browser: null,
      page: null,
      context: null,
      status: "initializing",
      isValid: null,
      error: null,
      siteId,
      createdAt: new Date()
    })

    validateWithBrowser(sessionId, siteUrl, cookies).catch(console.error)

    return successResponse({
      sessionId,
      message: "浏览器启动中，请在浏览器窗口中查看登录状态..."
    })
  } catch (error) {
    console.error("Cookie validation error:", error)
    if ((error as Error).message.includes("DISPLAY") || (error as Error).message.includes("headless")) {
      return errorResponse("服务器环境不支持图形界面，请使用手动方式设置Cookie", 501)
    }
    return errorResponse("启动失败: " + (error as Error).message)
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return errorResponse("缺少sessionId")
    }

    const session = validationSessions.get(sessionId)
    if (!session) {
      return errorResponse("会话不存在")
    }

    return successResponse({
      status: session.status,
      isValid: session.isValid,
      error: session.error
    })
  } catch (error) {
    console.error("Get validation status error:", error)
    return errorResponse("获取状态失败")
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return errorResponse("缺少sessionId")
    }

    const session = validationSessions.get(sessionId)
    if (session) {
      if (session.browser) {
        await session.browser.close()
      }
      validationSessions.delete(sessionId)
    }

    return successResponse({ message: "验证会话已关闭" })
  } catch (error) {
    console.error("Delete validation session error:", error)
    return errorResponse("关闭会话失败")
  }
}

async function validateWithBrowser(sessionId: string, siteUrl: string, cookiesString: string) {
  const session = validationSessions.get(sessionId)
  if (!session) return

  try {
    const { chromium } = await import("playwright")

    session.status = "initializing"
    
    const browser = await chromium.launch({
      headless: false,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process"
      ]
    })

    session.browser = browser

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })

    session.context = context

    const urlObj = new URL(siteUrl)
    const hostname = urlObj.hostname
    const domain = hostname.startsWith('www.') ? hostname.substring(4) : hostname

    const cookies = cookiesString.split(";").map(cookie => {
      const [name, ...valueParts] = cookie.trim().split("=")
      const value = valueParts.join("=").trim()
      
      return {
        name: name.trim(),
        value: decodeURIComponent(value),
        domain: domain,
        path: "/",
        secure: urlObj.protocol === 'https:',
        httpOnly: false,
        sameSite: 'Lax' as const
      }
    })

    console.log(`[Cookie Validate] Injecting ${cookies.length} cookies for domain: ${domain}`)
    console.log(`[Cookie Validate] Cookie names:`, cookies.map(c => c.name).join(', '))

    await context.addCookies(cookies)

    const page = await context.newPage()
    session.page = page

    session.status = "validating"

    await page.goto(siteUrl, { waitUntil: "domcontentloaded", timeout: 60000 })

    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    const pageTitle = await page.title()

    const isLoginPage = 
      currentUrl.includes("/login") || 
      currentUrl.includes("/signin") ||
      currentUrl.includes("/auth") ||
      pageTitle.toLowerCase().includes("登录") ||
      pageTitle.toLowerCase().includes("login")

    session.isValid = !isLoginPage
    session.status = "completed"

    console.log(`[Cookie Validate] Validation completed for ${session.siteId}. Valid: ${session.isValid}`)

  } catch (error) {
    console.error("Validate with browser error:", error)
    session.status = "error"
    session.error = (error as Error).message
    
    if (session.browser) {
      try {
        await session.browser.close()
      } catch (e) {
        console.error("Failed to close browser:", e)
      }
      session.browser = null
      session.page = null
      session.context = null
    }
  }
}
