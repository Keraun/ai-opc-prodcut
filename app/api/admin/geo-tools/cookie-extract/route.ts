import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-utils"
import { checkAdminAuth } from "@/lib/api-utils"
import { updateConfig } from "@/lib/config-manager"
import { getJsonDb } from "@/lib/json-database"

interface ExtractionSession {
  browser: any
  page: any
  status: "initializing" | "waiting" | "extracting" | "completed" | "error"
  cookie_data: string | null
  storage_data: Record<string, string> | null
  error: string | null
  siteId: string
  createdAt: Date
}

const LLM_SITES = [
  { id: "deepseek", name: "DeepSeek", url: "https://chat.deepseek.com/", description: "DeepSeek AI 深度求索", storageType: "both", storageKey: ["userToken"] },
  { id: "openai", name: "OpenAI (ChatGPT)", url: "https://chat.openai.com/", description: "OpenAI 对话模型", storageType: "cookie", storageKey: [] },
  { id: "doubao", name: "豆包", url: "https://www.doubao.com/", description: "字节跳动大模型", storageType: "cookie", storageKey: [] },
  { id: "kimi", name: "Kimi", url: "https://kimi.moonshot.cn/", description: "月之暗面大模型", storageType: "cookie", storageKey: [] },
  { id: "qwen", name: "通义千问", url: "https://tongyi.aliyun.com/", description: "阿里云大语言模型", storageType: "cookie", storageKey: [] },
  { id: "zhipu", name: "智谱AI (GLM)", url: "https://chatglm.cn/", description: "智谱清言对话模型", storageType: "cookie", storageKey: [] },
  { id: "minimax", name: "MiniMax", url: "https://www.minimaxi.com/", description: "MiniMax 大模型", storageType: "cookie", storageKey: [] },
  { id: "claude", name: "Claude (Anthropic)", url: "https://claude.ai/", description: "Anthropic 对话模型", storageType: "cookie", storageKey: [] },
  { id: "wenxin", name: "文心一言", url: "https://yiyan.baidu.com/", description: "百度文心大模型", storageType: "cookie", storageKey: [] },
]

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
      cookie_data: null,
      storage_data: null,
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
      cookies: session.cookie_data,
      storage_data: session.storage_data,
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

    // 定义检查登录状态的函数
    const checkLoginStatus = async () => {
      try {
        const site = LLM_SITES.find(s => s.id === session.siteId)
        
        if (site) {
          console.log(`[Cookie Extract] Checking login status for ${site.name} (${site.id})`)
          console.log(`[Cookie Extract] Current URL: ${page.url()}`)
          console.log(`[Cookie Extract] Storage type: ${site.storageType}, Storage keys: ${site.storageKey}`)
          
          let hasValidData = false
          
          // 抓取localStorage数据
          if ((site.storageType === "both" || site.storageType === "localStorage") && site.storageKey && site.storageKey.length > 0) {
            try {
              console.log(`[Cookie Extract] Attempting to get localStorage data for keys: ${site.storageKey}`)
              const storageData = await page.evaluate((keys) => {
                const data: Record<string, string> = {}
                // 只抓取storage_key中指定的字段
                keys.forEach(key => {
                  try {
                    const value = localStorage.getItem(key)
                    if (value) {
                      data[key] = value
                    } else {
                      console.log(`[Cookie Extract] localStorage key ${key} not found`)
                    }
                  } catch (e) {
                    console.log(`[Cookie Extract] Error getting localStorage key ${key}:`, e)
                  }
                })
                return data
              }, site.storageKey)
              
              console.log(`[Cookie Extract] localStorage data:`, storageData)
              
              // 只使用storage_key中指定的字段
              if (Object.keys(storageData).length > 0) {
                console.log(`[Cookie Extract] Found localStorage data for ${site.name}:`, Object.keys(storageData))
                session.storage_data = storageData
                hasValidData = true
              } else {
                console.log(`[Cookie Extract] No localStorage data found for ${site.name}`)
              }
            } catch (e) {
              console.error("Check localStorage error:", e)
            }
          }
          
          // 抓取cookie数据
          if (site.storageType === "both" || site.storageType === "cookie") {
            const cookies = await context.cookies()
            console.log(`[Cookie Extract] Found ${cookies.length} cookies`)
            console.log(`[Cookie Extract] Cookie names:`, cookies.map(c => c.name))
            
            // 对于DeepSeek，只要有cookie就认为是登录状态
            if (cookies.length > 0) {
              session.status = "extracting"
              
              const cookieString = cookies
                .map(cookie => `${cookie.name}=${cookie.value}`)
                .join("; ")

              session.cookie_data = cookieString
              hasValidData = true
              console.log(`[Cookie Extract] Using cookie data for ${site.name}`)
            } else {
              console.log(`[Cookie Extract] No cookies found for ${site.name}`)
            }
          }
          
          console.log(`[Cookie Extract] hasValidData: ${hasValidData}`)
          
          if (hasValidData) {
            session.status = "completed"
            console.log(`[Cookie Extract] Extraction completed for ${site.name}`)
            
            return true
          } else {
            console.log(`[Cookie Extract] No valid data found for ${site.name}`)
          }
        } else {
          console.log(`[Cookie Extract] Site not found for id: ${session.siteId}`)
        }
        return false
      } catch (error) {
        console.error("Check login status error:", error)
        return false
      }
    }

    // 监听页面导航事件，当用户登录成功并跳转后，实时抓取数据
    let navigationCompleted = false
    
    page.on('framenavigated', async (frame) => {
      if (frame === page.mainFrame()) {
        const currentUrl = page.url()
        console.log(`[Cookie Extract] Page navigated to: ${currentUrl}`)
        
        // 对于DeepSeek，当页面导航到根域名时，实时检查登录状态
        if (currentUrl === 'https://chat.deepseek.com/') {
          console.log(`[Cookie Extract] DeepSeek redirected to root domain, checking login status...`)
          // 等待页面基本加载完成
          await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {
            console.log(`[Cookie Extract] DOM content loaded timeout, proceeding with login check`)
          })
          // 实时检查登录状态
          await checkLoginStatus()
        }
      }
    })
    
    // 监听页面加载事件，实时更新数据
    page.on('load', async () => {
      console.log(`[Cookie Extract] Page loaded, checking login status...`)
      await checkLoginStatus()
    })
    
    // 监听页面状态变化，实时更新数据
    page.on('domcontentloaded', async () => {
      console.log(`[Cookie Extract] DOM content loaded, checking login status...`)
      await checkLoginStatus()
    })

    // 导航到目标网站
    await page.goto(siteUrl, { waitUntil: "domcontentloaded", timeout: 60000 })

    // 初始检查
    await page.waitForTimeout(5000)

    // 初始检查登录状态
    await checkLoginStatus()

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

      // 实时检查登录状态
      await checkLoginStatus()
      
      // 继续检查，直到超时
      elapsedTime += checkInterval
      setTimeout(checkLoop, checkInterval)
    }

    // 启动检查循环
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
