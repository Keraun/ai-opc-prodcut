import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-utils"
import { checkAdminAuth } from "@/lib/api-utils"

interface ExtractionSession {
  browser: any
  page: any
  status: "initializing" | "waiting" | "extracting" | "completed" | "error"
  cookies: string | null
  error: string | null
  siteId: string
  createdAt: Date
}

const sessions = new Map<string, ExtractionSession>()

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
    const { siteId, siteUrl } = body

    if (!siteId || !siteUrl) {
      return errorResponse("缺少必要参数")
    }

    const sessionId = `${siteId}-${Date.now()}`

    sessions.set(sessionId, {
      browser: null,
      page: null,
      status: "initializing",
      cookies: null,
      error: null,
      siteId,
      createdAt: new Date()
    })

    extractCookies(sessionId, siteUrl).catch(console.error)

    return successResponse({
      sessionId,
      message: "浏览器启动中，请稍候..."
    })
  } catch (error) {
    console.error("Cookie extraction error:", error)
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

    const session = sessions.get(sessionId)
    if (!session) {
      return errorResponse("会话不存在")
    }

    return successResponse({
      status: session.status,
      cookies: session.cookies,
      error: session.error
    })
  } catch (error) {
    console.error("Get status error:", error)
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

    const session = sessions.get(sessionId)
    if (session) {
      if (session.browser) {
        await session.browser.close()
      }
      sessions.delete(sessionId)
    }

    return successResponse({ message: "会话已关闭" })
  } catch (error) {
    console.error("Delete session error:", error)
    return errorResponse("关闭会话失败")
  }
}

async function extractCookies(sessionId: string, siteUrl: string) {
  const session = sessions.get(sessionId)
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

    const page = await context.newPage()
    session.page = page

    session.status = "waiting"

    await page.goto(siteUrl, { waitUntil: "domcontentloaded", timeout: 60000 })

    await page.waitForTimeout(5000)

    const checkLoginStatus = async () => {
      try {
        const cookies = await context.cookies()
        
        const hasSessionCookie = cookies.some(cookie => {
          const importantCookies = [
            "session", "token", "auth", "login", "user",
            "sessionid", "csrf", "jwt", "access_token",
            "refresh_token", "sid", "JSESSIONID"
          ]
          return importantCookies.some(name => 
            cookie.name.toLowerCase().includes(name.toLowerCase())
          )
        })

        if (hasSessionCookie) {
          session.status = "extracting"
          
          const cookieString = cookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join("; ")

          session.cookies = cookieString
          session.status = "completed"

          return true
        }
        return false
      } catch (error) {
        console.error("Check login status error:", error)
        return false
      }
    }

    const maxWaitTime = 300000
    const checkInterval = 3000
    let elapsedTime = 0

    const checkLoop = async () => {
      if (elapsedTime >= maxWaitTime) {
        session.status = "error"
        session.error = "等待超时，请重试"
        await browser.close()
        sessions.delete(sessionId)
        return
      }

      const isLoggedIn = await checkLoginStatus()
      if (!isLoggedIn) {
        elapsedTime += checkInterval
        setTimeout(checkLoop, checkInterval)
      }
    }

    await checkLoop()

  } catch (error) {
    console.error("Extract cookies error:", error)
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
    }
  }
}
