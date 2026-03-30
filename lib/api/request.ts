import type { ApiResponse } from './types'

export async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = { ...options.headers as Record<string, string> }
  
  headers['Accept'] = 'application/json'
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  
  const response = await fetch(url, {
    headers,
    ...options,
  })
  
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const result = await response.json()
    return result as ApiResponse<T>
  }
  
  return {
    code: response.status,
    success: response.ok,
    message: response.ok ? '操作成功' : '操作失败',
  } as ApiResponse<T>
}
