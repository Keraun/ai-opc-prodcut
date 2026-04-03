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
    const { siteId, siteUrl, cookie_data, storage_data, cookies } = body
    
    // 兼容前端传递的cookies参数
    const cookieData = cookie_data || cookies

    if (!siteId || !siteUrl || (!cookieData && !storage_data)) {
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

    validateWithBrowser(sessionId, siteUrl, cookieData, storage_data).catch(console.error)

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

async function validateWithBrowser(sessionId: string, siteUrl: string, cookie_data: string | null, storage_data: Record<string, string> | null) {
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
    // 同时准备根域名（带点前缀），用于跨子域的cookie
    const rootDomain = domain.includes('.') ? '.' + domain.split('.').slice(-2).join('.') : domain

    const site = LLM_SITES.find(s => s.id === session.siteId)
    
    let page = null
    
    // 处理cookie数据
    if (cookie_data) {
      const cookies = cookie_data.split(";").map(cookie => {
        const [name, ...valueParts] = cookie.trim().split("=")
        const value = valueParts.join("=").trim()
        const cookieName = name.trim()
        
        // 根据站点的cookie规则设置属性
        let httpOnly = false
        let secure = urlObj.protocol === 'https:'
        let sameSite: 'Lax' | 'Strict' | 'None' = 'Lax'
        
        // 对于deepseek特定的cookie
        if (domain.includes('deepseek.com')) {
          // ds_session_id 和 hw_session_id 设置为 httpOnly 和 secure
          if (cookieName === 'ds_session_id' || cookieName === 'hw_session_id') {
            httpOnly = true
            secure = true
            sameSite = 'Strict'
          }
        }
        
        return {
          name: cookieName,
          value: decodeURIComponent(value),
          domain: domain,
          path: "/",
          secure: secure,
          httpOnly: httpOnly,
          sameSite: sameSite
        }
      })

      // 同时注入根域名的cookie，确保跨子域生效
      const rootDomainCookies = cookies.map(c => ({
        ...c,
        domain: rootDomain
      }))

      console.log(`[Cookie Validate] Injecting ${cookies.length} cookies for domain: ${domain}`)
      console.log(`[Cookie Validate] Injecting ${rootDomainCookies.length} cookies for root domain: ${rootDomain}`)
      console.log(`[Cookie Validate] Cookie names:`, cookies.map(c => c.name).join(', '))

      // 注入两种domain的cookie
      await context.addCookies([...cookies, ...rootDomainCookies])
    }
    
    // 创建页面
    page = await context.newPage()
    session.page = page
    
    // 先导航到网站，再设置localStorage
    await page.goto(siteUrl, { waitUntil: "domcontentloaded", timeout: 60000 })
    
    // 处理localStorage数据
    if (storage_data && site && (site.storageType === "both" || site.storageType === "localStorage") && site.storageKey && site.storageKey.length > 0) {
      try {
        await page.evaluate((data) => {
          Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, value)
          })
        }, storage_data)
        
        console.log(`[Cookie Validate] Set localStorage data for ${site.name}:`, Object.keys(storage_data))
      } catch (error) {
        console.warn(`[Cookie Validate] Failed to set localStorage for ${site.name}:`, error)
        // 继续执行，不中断流程
      }
    }

    session.status = "validating"

    // 页面已经在设置localStorage之前导航过了，不需要再次导航
    await page.waitForTimeout(3000)

    await page.waitForTimeout(3000)

    const currentUrl = page.url()
    const pageTitle = await page.title()

    // 等待页面完全加载
    await page.waitForTimeout(3000)

    // 检查登录状态的多种方式
    let isLoginPage = false
    let hasLoginElement = false
    let hasUserElement = false

    // 1. 检查URL和标题
    isLoginPage = 
      currentUrl.includes("/login") || 
      currentUrl.includes("/signin") ||
      currentUrl.includes("/auth") ||
      pageTitle.toLowerCase().includes("登录") ||
      pageTitle.toLowerCase().includes("login")

    // 2. 检查页面是否有登录表单元素
    try {
      const loginSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[placeholder*="密码"]',
        'input[placeholder*="password"]',
        'button:has-text("登录")',
        'button:has-text("Login")',
        'a:has-text("登录")',
        'a:has-text("Login")',
        '[class*="login"]',
        '[class*="signin"]'
      ]
      
      for (const selector of loginSelectors) {
        const element = await page.$(selector)
        if (element) {
          const isVisible = await element.isVisible().catch(() => false)
          if (isVisible) {
            hasLoginElement = true
            console.log(`[Cookie Validate] Found login element: ${selector}`)
            break
          }
        }
      }
    } catch (e) {
      console.error("[Cookie Validate] Error checking login elements:", e)
    }

    // 3. 检查是否有用户相关的元素（表示已登录）
    try {
      const userSelectors = [
        '[class*="user"]',
        '[class*="avatar"]',
        '[class*="profile"]',
        'img[alt*="avatar"]',
        'button:has-text("退出")',
        'button:has-text("Logout")',
        'a:has-text("退出")',
        'a:has-text("Logout")'
      ]
      
      for (const selector of userSelectors) {
        const element = await page.$(selector)
        if (element) {
          const isVisible = await element.isVisible().catch(() => false)
          if (isVisible) {
            hasUserElement = true
            console.log(`[Cookie Validate] Found user element: ${selector}`)
            break
          }
        }
      }
    } catch (e) {
      console.error("[Cookie Validate] Error checking user elements:", e)
    }

    // 综合判断：如果有用户元素，则认为已登录；如果有登录元素或登录页面特征，则认为未登录
    const isValid = hasUserElement || (!isLoginPage && !hasLoginElement)

    session.isValid = isValid
    session.status = "completed"

    console.log(`[Cookie Validate] Validation completed for ${session.siteId}:`)
    console.log(`  - URL: ${currentUrl}`)
    console.log(`  - Title: ${pageTitle}`)
    console.log(`  - Is login page: ${isLoginPage}`)
    console.log(`  - Has login element: ${hasLoginElement}`)
    console.log(`  - Has user element: ${hasUserElement}`)
    console.log(`  - Valid: ${isValid}`)

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
