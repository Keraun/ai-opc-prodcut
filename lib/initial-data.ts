import "server-only"
import type { ModuleData } from "@/modules/types"
import { readConfig, getPageResponse } from "./config-manager"

let initialDataCache: Record<string, any> | null = null
let pageDataCache: Record<string, Record<string, any>> = {}

export function loadInitialData(): Record<string, any> {
  if (initialDataCache) {
    return initialDataCache
  }

  initialDataCache = {
    site: readConfig('site') || {},
    'site-navigation': readConfig('site-navigation') || {},
    'site-header': readConfig('site-header') || {},
    'site-footer': readConfig('site-footer') || {}
  }

  return initialDataCache
}

export function loadPageData(
  pageId: string,
  orderConfigKey?: string,
  extraConfig?: Record<string, any>
): Record<string, any> {
  const cacheKey = `${pageId}-${orderConfigKey || 'default'}`
  
  if (pageDataCache[cacheKey]) {
    return pageDataCache[cacheKey]
  }

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
