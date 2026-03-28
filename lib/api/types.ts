export type { ModuleRegistration } from '@/modules/types'

export interface ApiResponse<T> {
  code: number
  success: boolean
  message?: string
  data?: T
}

export interface ModuleInfo {
  moduleId: string
  moduleName: string
  category?: string
  schema?: Record<string, unknown>
  defaultData?: Record<string, unknown>
}

export interface PageInfo {
  id: string
  dbId: number
  name: string
  slug: string
  moduleInstanceIds: string[]
  modules: ModuleData[]
  status?: 'draft' | 'published' | 'offline'
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export interface ModuleData {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

export interface PageConfig {
  pageId: string
  layout: string
  modules: ModuleData[]
  config: Record<string, unknown>
}

export interface User {
  username: string
  role: string
}

export interface AuthResult {
  authenticated: boolean
  user?: User
}

export interface LoginResult {
  success: boolean
  user?: User
  requireEmailSetup?: boolean
  showSuperAdminToken?: boolean
  superAdminToken?: string
  message?: string
}

export interface Account {
  username: string
  password: string
  email: string
  remark?: string
}

export interface BackupInfo {
  filename: string
  path: string
  timestamp: string
}
