import "server-only"
import type { ModuleData } from "@/modules/types"
import { readConfig, getPageResponse } from "./config-manager"
import { getJsonDb } from "./json-database"
import { serverLogger } from "./server-logger"

// 每次操作数据库时都获取最新的实例
const jsonDb = getJsonDb()

let initialDataCache: Record<string, any> | null = null

const isDev = process.env.NODE_ENV === 'development'

export function loadInitialData(): Record<string, any> {
  serverLogger.info("loadInitialData called")
  
  // 每次都重新加载数据，确保获取到最新的数据
  jsonDb.reload()

  const data = {
    site: readConfig('site') || {},
    'site-header': readConfig('site-header') || {},
    'site-footer': readConfig('site-footer') || {}
  }

  serverLogger.info("loadInitialData completed", {
    hasSite: !!data.site,
    hasHeader: !!data['site-header'],
    hasFooter: !!data['site-footer'],
  })

  // 仍然更新缓存，以便其他地方可以使用
  initialDataCache = data
  return data
}

export function loadPageData(
  pageId: string,
  extraConfig?: Record<string, any>
): Record<string, any> {
  serverLogger.info("loadPageData called", { pageId, hasExtraConfig: !!extraConfig })
  
  // 每次都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  clearInitialDataCache()

  const pageResponse = getPageResponse(pageId)
  
  serverLogger.info("loadPageData got response", pageResponse)
  
  // 应用 extraConfig 到模块数据中
  if (extraConfig) {
    pageResponse.data = pageResponse.data.map((item: any) => ({
      ...item,
      data: { ...(item?.data || {}), ...extraConfig }
    }))
  }
  
  
  // 直接返回 pageResponse，不进行额外的转化
  return pageResponse
}

export function getInitialData(): Record<string, any> | null {
  return initialDataCache
}

export function clearInitialDataCache(): void {
  initialDataCache = null
}

export function generateInitialDataScript(): string {
  const data = loadInitialData()
  return `window.__INITIAL_DATA__ = ${JSON.stringify(data).replace(/</g, '\\u003c')};`
}
