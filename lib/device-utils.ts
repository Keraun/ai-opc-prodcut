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
