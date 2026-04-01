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
    const errorData = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    }
    reportError(errorData)
  })

  window.addEventListener('unhandledrejection', (event) => {
    const errorData = {
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      type: 'unhandledrejection',
      url: window.location.href,
      userAgent: navigator.userAgent,
    }
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
