'use client'

async function reportError(errorData: any) {
  try {
    await fetch('/api/client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    })
  } catch (e) {
    console.error('[ClientError] 上报错误失败:', e)
  }
}

export function initClientErrorHandler() {
  if (typeof window === 'undefined') return

  window.addEventListener('error', (event) => {
    const isScriptError = event.message === 'Script error.' && event.filename === ''
    
    const errorData = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      isScriptError,
      additionalInfo: isScriptError ? {
        hint: '跨域脚本错误，可能是第三方库或外部脚本导致',
        possibleCauses: [
          'vConsole 调试工具加载失败',
          '百度统计/谷歌统计脚本跨域错误',
          '其他第三方脚本加载失败'
        ]
      } : undefined
    }
    
    console.error('[ClientError] 捕获到错误:', errorData)
    reportError(errorData)
  })

  window.addEventListener('unhandledrejection', (event) => {
    const errorData = {
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      type: 'unhandledrejection',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }
    
    console.error('[ClientError] 捕获到未处理的 Promise 拒绝:', errorData)
    reportError(errorData)
  })

  console.log('[ClientError] 前端错误捕获已初始化')
}

export function logClientError(error: Error | string, extra?: any) {
  const errorData = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'object' && 'stack' in error ? error.stack : undefined,
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...extra,
  }
  reportError(errorData)
}
