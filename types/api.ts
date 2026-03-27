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

export interface PageInfo {
  id: string
  name: string
  slug: string
  moduleInstanceIds: string[]
  modules: any[]
  status?: 'draft' | 'published' | 'offline'
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}
