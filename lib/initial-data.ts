import "server-only"
import type { ModuleData } from "@/modules/types"
import { readConfig, getPageResponse } from "./config-manager"
import { jsonDb } from "./json-database"

let initialDataCache: Record<string, any> | null = null
let pageDataCache: Record<string, Record<string, any>> = {}

const isDev = process.env.NODE_ENV === 'development'

export function loadInitialData(): Record<string, any> {
  // 每次都重新加载数据，确保获取到最新的数据
  jsonDb.reload()

  const data = {
    site: readConfig('site') || {},
    'site-header': readConfig('site-header') || {},
    'site-footer': readConfig('site-footer') || {}
  }

  // 仍然更新缓存，以便其他地方可以使用
  initialDataCache = data
  return data
}

export function loadPageData(
  pageId: string,
  orderConfigKey?: string,
  extraConfig?: Record<string, any>
): Record<string, any> {
  const cacheKey = `${pageId}-${orderConfigKey || 'default'}`
  
  // 每次都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  clearInitialDataCache()

  const pageResponse = getPageResponse(pageId)

  const pageData = {
    data: {
      theme: pageResponse.common.theme || {},
      layout: 'default',
      modules: pageResponse.data.map((item: any) => ({
        moduleName: item.moduleId,
        moduleId: item.moduleId,
        moduleInstanceId: `${item.moduleId}-${pageId}-${Date.now()}`,
        data: { ...item.data, ...extraConfig }
      })),
      common: {
        site: pageResponse.common.site || {},
        theme: pageResponse.common.theme || {}
      }
    }
  }

  // 仍然更新缓存，以便其他地方可以使用
  pageDataCache[cacheKey] = pageData
  return pageData
}

export function getInitialData(): Record<string, any> | null {
  return initialDataCache
}

export function clearInitialDataCache(): void {
  initialDataCache = null
  pageDataCache = {}
}

export function generateInitialDataScript(): string {
  const data = loadInitialData()
  return `window.__INITIAL_DATA__ = ${JSON.stringify(data).replace(/</g, '\\u003c')};`
}
