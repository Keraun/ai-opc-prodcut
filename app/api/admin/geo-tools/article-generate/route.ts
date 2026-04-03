import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-utils"
import { checkAdminAuth } from "@/lib/api-utils"
import { readConfig } from "@/lib/config-manager"

interface GenerationSession {
  browser: any
  page: any
  context: any
  status: "initializing" | "generating" | "completed" | "error"
  answer: string | null
  error: string | null
  llmId: string
  createdAt: Date
}

const generationSessions = new Map<string, GenerationSession>()

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

const LLM_SITES: Record<string, { url: string; inputSelector: string; submitSelector: string }> = {
  deepseek: {
    url: "https://chat.deepseek.com/",
    inputSelector: "textarea[placeholder*='问'], textarea[placeholder*='输入'], textarea",
    submitSelector: "button[type='submit'], button:has-text('发送'), button:has-text('Send')"
  },
  openai: {
    url: "https://chat.openai.com/",
    inputSelector: "textarea[placeholder*='Message'], textarea",
    submitSelector: "button[data-testid='send-button'], button[type='submit']"
  },
  doubao: {
    url: "https://www.doubao.com/",
    inputSelector: "textarea[placeholder*='输入'], textarea",
    submitSelector: "button[type='submit'], button:has-text('发送')"
  },
  kimi: {
    url: "https://kimi.moonshot.cn/",
    inputSelector: "textarea[placeholder*='输入'], textarea",
    submitSelector: "button[type='submit'], button:has-text('发送')"
  },
  qwen: {
    url: "https://tongyi.aliyun.com/",
    inputSelector: "textarea[placeholder*='输入'], textarea",
    submitSelector: "button[type='submit'], button:has-text('发送')"
  },
  zhipu: {
    url: "https://chatglm.cn/",
    inputSelector: "textarea[placeholder*='输入'], textarea",
    submitSelector: "button[type='submit'], button:has-text('发送')"
  },
  minimax: {
    url: "https://www.minimaxi.com/",
    inputSelector: "textarea[placeholder*='输入'], textarea",
    submitSelector: "button[type='submit'], button:has-text('发送')"
  },
  claude: {
    url: "https://claude.ai/",
    inputSelector: "textarea[placeholder*='Message'], textarea",
    submitSelector: "button[type='submit'], button:has-text('Send')"
  },
  wenxin: {
    url: "https://yiyan.baidu.com/",
    inputSelector: "textarea[placeholder*='输入'], textarea",
    submitSelector: "button[type='submit'], button:has-text('发送')"
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
        return errorResponse("服务器环境不支持浏览器自动化", 501)
      }
    }

    const body = await request.json()
    const { llmId, prompt } = body

    if (!llmId || !prompt) {
      return errorResponse("缺少必要参数")
    }

    const siteConfig = LLM_SITES[llmId]
    if (!siteConfig) {
      return errorResponse("不支持的大模型")
    }

    const cookiesData = readConfig("llm-cookies") as any[] || []
    const cookieData = cookiesData.find((item: any) => item.site_id === llmId)
    
    if (!cookieData?.cookies) {
      return errorResponse(`请先在 Cookie 管理中配置 ${llmId} 的 Cookie`)
    }

    const sessionId = `${llmId}-generate-${Date.now()}`

    generationSessions.set(sessionId, {
      browser: null,
      page: null,
      context: null,
      status: "initializing",
      answer: null,
      error: null,
      llmId,
      createdAt: new Date()
    })

    generateWithLLM(sessionId, siteConfig, cookieData.cookies, prompt).catch(console.error)

    return successResponse({
      sessionId,
      message: "浏览器启动中，请稍候..."
    })
  } catch (error) {
    console.error("Article generation error:", error)
    if ((error as Error).message.includes("DISPLAY") || (error as Error).message.includes("headless")) {
      return errorResponse("服务器环境不支持图形界面", 501)
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

    const session = generationSessions.get(sessionId)
    if (!session) {
      return errorResponse("会话不存在")
    }

    return successResponse({
      status: session.status,
      answer: session.answer,
      error: session.error
    })
  } catch (error) {
    console.error("Get generation status error:", error)
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

    const session = generationSessions.get(sessionId)
    if (session) {
      if (session.browser) {
        await session.browser.close()
      }
      generationSessions.delete(sessionId)
    }

    return successResponse({ message: "生成会话已关闭" })
  } catch (error) {
    console.error("Delete generation session error:", error)
    return errorResponse("关闭会话失败")
  }
}

async function generateWithLLM(
  sessionId: string,
  siteConfig: { url: string; inputSelector: string; submitSelector: string },
  cookiesString: string,
  prompt: string
) {
  const session = generationSessions.get(sessionId)
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

    const urlObj = new URL(siteConfig.url)
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

    console.log(`[Article Generate] Injecting ${cookies.length} cookies for domain: ${domain}`)
    console.log(`[Article Generate] Cookie names:`, cookies.map(c => c.name).join(', '))

    await context.addCookies(cookies)

    const page = await context.newPage()
    session.page = page

    session.status = "generating"

    await page.goto(siteConfig.url, { waitUntil: "domcontentloaded", timeout: 60000 })

    await page.waitForTimeout(3000)

    let inputElement = null
    for (const selector of siteConfig.inputSelector.split(", ")) {
      try {
        inputElement = await page.waitForSelector(selector.trim(), { timeout: 5000 })
        if (inputElement) break
      } catch (e) {
        continue
      }
    }

    if (!inputElement) {
      throw new Error("未找到输入框")
    }

    await inputElement.fill(prompt)
    await page.waitForTimeout(1000)

    let submitButton = null
    for (const selector of siteConfig.submitSelector.split(", ")) {
      try {
        submitButton = await page.waitForSelector(selector.trim(), { timeout: 3000 })
        if (submitButton) {
          const isVisible = await submitButton.isVisible()
          if (isVisible) break
        }
      } catch (e) {
        continue
      }
    }

    if (submitButton) {
      await submitButton.click()
    } else {
      await inputElement.press("Enter")
    }

    await page.waitForTimeout(5000)

    const collectAnswer = async () => {
      try {
        const answerSelectors = [
          ".markdown-body",
          ".prose",
          "[class*='answer']",
          "[class*='response']",
          "[class*='message']:last-child",
          ".chat-message:last-child",
          "article",
          ".content"
        ]

        for (const selector of answerSelectors) {
          try {
            const element = await page.waitForSelector(selector, { timeout: 3000 })
            if (element) {
              const text = await element.textContent()
              if (text && text.length > 50) {
                return text.trim()
              }
            }
          } catch (e) {
            continue
          }
        }

        const pageText = await page.textContent("body")
        return pageText ? pageText.trim().substring(0, 5000) : null
      } catch (error) {
        console.error("Collect answer error:", error)
        return null
      }
    }

    const maxWaitTime = 180000
    const checkInterval = 5000
    let elapsedTime = 0
    let lastAnswerLength = 0

    const checkLoop = async () => {
      if (elapsedTime >= maxWaitTime) {
        const answer = await collectAnswer()
        if (answer) {
          session.answer = answer
          session.status = "completed"
          console.log(`[Article Generate] Generation completed for ${session.llmId}`)
        } else {
          session.status = "error"
          session.error = "生成超时，未获取到有效答案"
        }
        return
      }

      const answer = await collectAnswer()
      if (answer && answer.length > lastAnswerLength) {
        lastAnswerLength = answer.length
        session.answer = answer
      }

      elapsedTime += checkInterval
      setTimeout(checkLoop, checkInterval)
    }

    await checkLoop()

  } catch (error) {
    console.error("Generate with LLM error:", error)
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
