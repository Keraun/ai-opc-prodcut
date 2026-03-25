import { loadAllConfigs } from "./config-cache"
import type { ModuleData } from "@/modules/types"

let initialDataCache: Record<string, any> | null = null

export function loadInitialData(): Record<string, any> {
  if (initialDataCache) {
    return initialDataCache
  }

  const configs = loadAllConfigs()

  const sections = configs.homeOrder?.sections || []
  const visibleSections = sections
    .filter((s: any) => s.visible !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

  const moduleDataMap: Record<string, () => ModuleData> = {
    hero: () => ({
      moduleName: 'Hero 区块',
      moduleId: 'hero',
      moduleInstanceId: `hero-${Date.now()}`,
      data: configs.homeBanner?.hero || configs.homeBanner || {}
    }),
    partner: () => ({
      moduleName: '合作伙伴区块',
      moduleId: 'partner',
      moduleInstanceId: `partner-${Date.now()}`,
      data: configs.homePartners?.partners || configs.homePartners || {}
    }),
    products: () => ({
      moduleName: '产品区块',
      moduleId: 'products',
      moduleInstanceId: `products-${Date.now()}`,
      data: configs.homeProducts?.products || configs.homeProducts || {}
    }),
    services: () => ({
      moduleName: '服务区块',
      moduleId: 'services',
      moduleInstanceId: `services-${Date.now()}`,
      data: configs.homeServices?.services || configs.homeServices || {}
    }),
    pricing: () => ({
      moduleName: '价格区块',
      moduleId: 'pricing',
      moduleInstanceId: `pricing-${Date.now()}`,
      data: configs.homePricing?.pricing || configs.homePricing || {}
    }),
    about: () => ({
      moduleName: '关于我们区块',
      moduleId: 'about',
      moduleInstanceId: `about-${Date.now()}`,
      data: configs.homeAbout?.about || configs.homeAbout || {}
    }),
    contact: () => ({
      moduleName: '联系我们区块',
      moduleId: 'contact',
      moduleInstanceId: `contact-${Date.now()}`,
      data: configs.homeContact?.contact || configs.homeContact || {}
    }),
  }

  const modules: ModuleData[] = visibleSections
    .map((section: any) => {
      const generator = moduleDataMap[section.id]
      return generator ? generator() : null
    })
    .filter((module: ModuleData | null): module is ModuleData => module !== null)

  initialDataCache = {
    data: {
      theme: configs.theme || {},
      layout: configs.homeOrder?.layout || 'default',
      modules,
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
