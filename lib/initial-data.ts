import { loadAllConfigs } from "./config-cache"

// 全局初始数据缓存（服务端渲染时填充）
let initialDataCache: Record<string, any> | null = null

/**
 * 加载首屏所需的全部配置数据
 * 在 SSR 时调用，聚合所有区块配置
 * 返回格式：
 * {
 *   data: {
 *     theme: {},
 *     layout: '',
 *     module: ['a', 'b', 'c', 'd'],
 *     moduleData: [{ name: '', data: {} }],
 *     common: { site: {} }
 *   }
 * }
 */
export function loadInitialData(): Record<string, any> {
  if (initialDataCache) {
    return initialDataCache
  }

  const configs = loadAllConfigs()

  // 从 homeOrder 获取模块顺序
  const sections = configs.homeOrder?.sections || []
  const visibleSections = sections
    .filter((s: any) => s.visible !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

  // 模块顺序列表
  const module = visibleSections.map((s: any) => s.id)

  // 模块数据映射
  const moduleDataMap: Record<string, any> = {
    hero: { name: 'hero', data: configs.homeBanner?.hero || {} },
    partner: { name: 'partner', data: configs.homePartners?.partners || {} },
    products: { name: 'products', data: configs.homeProducts?.products || {} },
    services: { name: 'services', data: configs.homeServices?.services || {} },
    pricing: { name: 'pricing', data: configs.homePricing?.pricing || {} },
    about: { name: 'about', data: configs.homeAbout?.about || {} },
    contact: { name: 'contact', data: configs.homeContact?.contact || {} },
  }

  // 按顺序组装模块数据
  const moduleData = module.map((id: string) => moduleDataMap[id] || { name: id, data: {} })

  // 聚合首屏所需的所有配置
  initialDataCache = {
    data: {
      // 主题配置
      theme: configs.theme || {},
      // 布局类型
      layout: configs.homeOrder?.layout || 'default',
      // 模块顺序列表
      module,
      // 模块数据列表
      moduleData,
      // 通用配置
      common: {
        site: configs.site || {},
        seo: configs.seo || {},
        navigation: configs.navigation || {},
        footer: configs.footer || {},
      }
    }
  }

  return initialDataCache
}

/**
 * 获取初始数据（服务端渲染时）
 */
export function getInitialData(): Record<string, any> | null {
  return initialDataCache
}

/**
 * 清除初始数据缓存
 */
export function clearInitialDataCache(): void {
  initialDataCache = null
}

/**
 * 生成注入到 HTML 的脚本
 */
export function generateInitialDataScript(): string {
  const data = loadInitialData()
  return `window.__INITIAL_DATA__ = ${JSON.stringify(data).replace(/</g, '\\u003c')};`
}
