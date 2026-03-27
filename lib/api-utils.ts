import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export interface ApiResponse<T = any> {
  code: number
  success: boolean
  message?: string
  data?: T
  [key: string]: any
}

export interface AuthResult {
  isAuthenticated: boolean
  username?: string
  userData?: any
}

export async function checkAdminAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('adminUser')?.value
    
    if (!userCookie) {
      return { isAuthenticated: false }
    }
    
    const userData = JSON.parse(userCookie)
    return {
      isAuthenticated: true,
      username: userData.username,
      userData
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    return { isAuthenticated: false }
  }
}

export function successResponse<T>(data?: T, message?: string, code: number = 200): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    code,
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data })
  }
  return NextResponse.json(response)
}

export function errorResponse(
  message: string,
  code: number = 500
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      code,
      success: false,
      message
    },
    { status: code }
  )
}

export function unauthorizedResponse(message: string = '未登录'): NextResponse<ApiResponse> {
  return errorResponse(message, 401)
}

export function badRequestResponse(message: string): NextResponse<ApiResponse> {
  return errorResponse(message, 400)
}

export function notFoundResponse(message: string = '资源不存在'): NextResponse<ApiResponse> {
  return errorResponse(message, 404)
}

export function withAuth<T = any>(
  handler: (authResult: AuthResult) => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  return checkAdminAuth().then(authResult => {
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse()
    }
    return handler(authResult)
  })
}

export async function setCookie(
  name: string,
  value: string,
  options?: {
    maxAge?: number
    expires?: Date
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    ...options
  })
}

export async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value
}

export async function deleteCookie(name: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(name)
}

export function parseJsonCookie<T = any>(cookieValue: string | undefined): T | null {
  if (!cookieValue) return null
  
  try {
    return JSON.parse(cookieValue)
  } catch (error) {
    console.error('Failed to parse cookie JSON:', error)
    return null
  }
}

export function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown'
}

export function formatDateTime(date: Date = new Date()): string {
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function generateRandomToken(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return Buffer.from(result).toString('base64')
}

export function wrapApiHandler<T = any>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().catch(error => {
    console.error('API Error:', error)
    return errorResponse('服务器内部错误')
  })
}

export function wrapAuthApiHandler<T = any>(
  handler: (authResult: AuthResult) => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  return wrapApiHandler(() => withAuth(handler))
}
