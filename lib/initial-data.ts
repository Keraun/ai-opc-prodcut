import "server-only"
import type { ModuleData } from "@/modules/types"
import { readConfig, getPageResponse } from "./config-manager"

let initialDataCache: Record<string, any> | null = null
let pageDataCache: Record<string, Record<string, any>> = {}

export function loadInitialData(): Record<string, any> {
  if (initialDataCache) {
    return initialDataCache
  }

  const pageResponse = getPageResponse('home')
  
  initialDataCache = {
    site: readConfig('site') || {},
    common: {},
    seo: readConfig('site-seo') || {},
    navigation: readConfig('site-navigation') || {},
    footer: readConfig('site-footer') || {},
    theme: pageResponse.common.theme || {},
    homeOrder: {},
    homeBanner: {},
    homePartners: {},
    homeProducts: {},
    homeServices: {},
    homePricing: {},
    homeAbout: {},
    homeContact: {},
    products: {},
    otherPages: {},
    news: {},
    custom: {}
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

  // 为sidebar-nav模块添加页面模块列表
  const sidebarNavModule = pageData.data.modules.find((m: any) => m.moduleId === 'sidebar-nav')
  if (sidebarNavModule) {
    sidebarNavModule.data.pageModules = pageResponse.modules || []
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
