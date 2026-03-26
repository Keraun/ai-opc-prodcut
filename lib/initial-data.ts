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

  const headerModule: ModuleData = {
    moduleName: '顶部导航',
    moduleId: 'header',
    moduleInstanceId: `header-${Date.now()}`,
    data: configs.navigation?.header || {}
  }

  const sidebarNavModule: ModuleData = {
    moduleName: '侧边栏导航',
    moduleId: 'sidebar-nav',
    moduleInstanceId: `sidebar-nav-${Date.now()}`,
    data: { visible: true }
  }

  const footerModule: ModuleData = {
    moduleName: '页脚',
    moduleId: 'footer',
    moduleInstanceId: `footer-${Date.now()}`,
    data: configs.footer || {}
  }

  const sectionModuleDataMap: Record<string, () => ModuleData> = {
    hero: () => ({
      moduleName: 'Hero 区块',
      moduleId: 'section-hero',
      moduleInstanceId: `section-hero-${Date.now()}`,
      data: configs.homeBanner?.hero || configs.homeBanner || {}
    }),
    partner: () => ({
      moduleName: '合作伙伴区块',
      moduleId: 'section-partner',
      moduleInstanceId: `section-partner-${Date.now()}`,
      data: configs.homePartners?.partners || configs.homePartners || {}
    }),
    products: () => ({
      moduleName: '产品区块',
      moduleId: 'section-products',
      moduleInstanceId: `section-products-${Date.now()}`,
      data: configs.homeProducts?.products || configs.homeProducts || {}
    }),
    services: () => ({
      moduleName: '服务区块',
      moduleId: 'section-services',
      moduleInstanceId: `section-services-${Date.now()}`,
      data: configs.homeServices?.services || configs.homeServices || {}
    }),
    pricing: () => ({
      moduleName: '价格区块',
      moduleId: 'section-pricing',
      moduleInstanceId: `section-pricing-${Date.now()}`,
      data: configs.homePricing?.pricing || configs.homePricing || {}
    }),
    about: () => ({
      moduleName: '关于我们区块',
      moduleId: 'section-about',
      moduleInstanceId: `section-about-${Date.now()}`,
      data: configs.homeAbout?.about || configs.homeAbout || {}
    }),
    contact: () => ({
      moduleName: '联系我们区块',
      moduleId: 'section-contact',
      moduleInstanceId: `section-contact-${Date.now()}`,
      data: configs.homeContact?.contact || configs.homeContact || {}
    }),
  }

  const sectionModules: ModuleData[] = visibleSections
    .map((section: any) => {
      const generator = sectionModuleDataMap[section.id]
      return generator ? generator() : null
    })
    .filter((module: ModuleData | null): module is ModuleData => module !== null)

  const modules: ModuleData[] = [
    headerModule,
    sidebarNavModule,
    ...sectionModules,
    footerModule
  ]

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
