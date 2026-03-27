import fs from 'fs'
import path from 'path'

interface PageInfo {
  id: string
  name: string
  slug: string
  type: 'static' | 'dynamic'
  description?: string
  status: 'draft' | 'published' | 'offline'
  isSystem: boolean
  isDeletable: boolean
  route: string
  dynamicParam?: string
  modules?: string[]
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

interface PageListData {
  pages: PageInfo[]
  systemPages: string[]
  dynamicRoutePattern: string
  createdAt: string
  updatedAt: string
}

export function getPageListData(): PageListData {
  const pageListPath = path.join(process.cwd(), 'database', 'runtime', 'page-list.json')
  
  try {
    if (fs.existsSync(pageListPath)) {
      const content = fs.readFileSync(pageListPath, 'utf-8')
      return JSON.parse(content) as PageListData
    }
  } catch (error) {
    console.error('Failed to read page list:', error)
  }
  
  // Return default data if file doesn't exist or error occurs
  return {
    pages: [],
    systemPages: ['home', '404'],
    dynamicRoutePattern: '[param]',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export function getSystemPages(): string[] {
  const pageListData = getPageListData()
  return pageListData.systemPages
}

export function isSystemPage(pageId: string, systemPages: string[]): boolean {
  return systemPages.includes(pageId)
}