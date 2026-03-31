export interface DeviceInfo {
  os: 'Android' | 'iOS' | 'Windows' | 'macOS' | 'Linux' | 'Unknown'
  osVersion: string
  browser: string
  browserVersion: string
  deviceModel: string
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent || ''
  let os: DeviceInfo['os'] = 'Unknown'
  let osVersion = ''
  let browser = 'Unknown'
  let browserVersion = ''
  let deviceModel = 'Unknown'

  const isAndroid = /Android/i.test(ua)
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isWindows = /Windows/i.test(ua)
  const isMacOS = /Macintosh|Mac OS X/i.test(ua)
  const isLinux = /Linux/i.test(ua) && !isAndroid

  if (isAndroid) {
    os = 'Android'
    const match = ua.match(/Android\s([0-9.]+)/)
    osVersion = match ? match[1] : ''
  } else if (isIOS) {
    os = 'iOS'
    const match = ua.match(/OS\s([0-9_]+)/)
    osVersion = match ? match[1].replace(/_/g, '.') : ''
    if (/iPad/i.test(ua)) {
      deviceModel = 'iPad'
    } else if (/iPod/i.test(ua)) {
      deviceModel = 'iPod Touch'
    } else {
      deviceModel = 'iPhone'
    }
  } else if (isWindows) {
    os = 'Windows'
    const match = ua.match(/Windows NT\s([0-9.]+)/)
    osVersion = match ? match[1] : ''
  } else if (isMacOS) {
    os = 'macOS'
    const match = ua.match(/Mac OS X\s([0-9_.]+)/)
    osVersion = match ? match[1].replace(/_/g, '.') : ''
  } else if (isLinux) {
    os = 'Linux'
  }

  const chromeMatch = ua.match(/Chrome\/([0-9.]+)/)
  const firefoxMatch = ua.match(/Firefox\/([0-9.]+)/)
  const safariMatch = ua.match(/Version\/([0-9.]+).*Safari/)
  const edgeMatch = ua.match(/Edg\/([0-9.]+)/)

  if (edgeMatch) {
    browser = 'Edge'
    browserVersion = edgeMatch[1]
  } else if (chromeMatch) {
    browser = 'Chrome'
    browserVersion = chromeMatch[1]
  } else if (firefoxMatch) {
    browser = 'Firefox'
    browserVersion = firefoxMatch[1]
  } else if (safariMatch) {
    browser = 'Safari'
    browserVersion = safariMatch[1]
  }

  if (deviceModel === 'Unknown') {
    if (isAndroid) {
      const modelMatch = ua.match(/;\s([^;]+)\sBuild/)
      deviceModel = modelMatch ? modelMatch[1].trim() : 'Android Device'
    } else if (isWindows) {
      deviceModel = 'Windows PC'
    } else if (isMacOS) {
      deviceModel = 'Mac'
    } else if (isLinux) {
      deviceModel = 'Linux PC'
    }
  }

  return {
    os,
    osVersion,
    browser,
    browserVersion,
    deviceModel
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return '127.0.0.1'
}

/**
 * 根据 Referer 和 User-Agent 检测 LLM 模型来源
 * @param referer - Referer header
 * @param userAgent - User-Agent header
 * @returns 检测到的 LLM 模型名称，如果无法检测则返回空字符串
 */
export function detectLLMModel(referer: string, userAgent: string): string {
  const ref = (referer || '').toLowerCase()
  const ua = (userAgent || '').toLowerCase()

  // OpenAI / ChatGPT
  if (ref.includes('chat.openai.com') || ref.includes('chatgpt.com') || ref.includes('openai.com')) {
    return 'ChatGPT'
  }

  // Anthropic / Claude
  if (ref.includes('claude.ai') || ref.includes('anthropic.com')) {
    return 'Claude'
  }

  // Google / Gemini
  if (ref.includes('gemini.google.com') || ref.includes('bard.google.com')) {
    return 'Gemini'
  }

  // 百度 / 文心一言
  if (ref.includes('yiyan.baidu.com') || ref.includes('wenxin.baidu.com')) {
    return '文心一言'
  }

  // 阿里 / 通义千问
  if (ref.includes('tongyi.aliyun.com') || ref.includes('qianwen.aliyun.com')) {
    return '通义千问'
  }

  // 字节 / 豆包
  if (ref.includes('doubao.com') || ref.includes('coze.cn')) {
    return '豆包'
  }

  // 月之暗面 / Kimi
  if (ref.includes('kimi.moonshot.cn') || ref.includes('moonshot.cn')) {
    return 'Kimi'
  }

  // 智谱 / ChatGLM
  if (ref.includes('chatglm.cn') || ref.includes('zhipuai.cn')) {
    return 'ChatGLM'
  }

  // 讯飞 / 星火
  if (ref.includes('xinghuo.xfyun.cn') || ref.includes('xfyun.cn')) {
    return '讯飞星火'
  }

  // 360 / 智脑
  if (ref.includes('ai.360.cn') || ref.includes('360.cn')) {
    return '360智脑'
  }

  // 腾讯 / 混元
  if (ref.includes('hunyuan.tencent.com') || ref.includes('yuanbao.tencent.com')) {
    return '腾讯混元'
  }

  // 商汤 / 日日新
  if (ref.includes('sensechat.sensetime.com')) {
    return '商汤日日新'
  }

  // 百川智能
  if (ref.includes('baichuan-ai.com') || ref.includes('baichuan.baidu.com')) {
    return '百川大模型'
  }

  // 零一万物
  if (ref.includes('lingyiwanwu.com') || ref.includes('01.ai')) {
    return '零一万物'
  }

  // 深度求索 / DeepSeek
  if (ref.includes('deepseek.com') || ref.includes('deepseek.ai')) {
    return 'DeepSeek'
  }

  // MiniMax
  if (ref.includes('minimax.chat') || ref.includes('minimaxi.com')) {
    return 'MiniMax'
  }

  // Perplexity
  if (ref.includes('perplexity.ai')) {
    return 'Perplexity'
  }

  // Copilot / Bing
  if (ref.includes('copilot.microsoft.com') || ref.includes('bing.com/chat')) {
    return 'Copilot'
  }

  // Poe
  if (ref.includes('poe.com')) {
    return 'Poe'
  }

  // 如果 Referer 没有匹配，尝试从 User-Agent 中检测
  if (ua.includes('chatgpt') || ua.includes('openai')) {
    return 'ChatGPT'
  }
  if (ua.includes('claude')) {
    return 'Claude'
  }
  if (ua.includes('gemini') || ua.includes('google-assistant')) {
    return 'Gemini'
  }

  return ''
}
