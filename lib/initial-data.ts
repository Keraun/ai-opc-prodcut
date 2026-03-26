import "server-only"
import fs from 'fs'
import path from 'path'
import type { ModuleData } from "@/modules/types"

let initialDataCache: Record<string, any> | null = null
let pageDataCache: Record<string, Record<string, any>> = {}

const PAGE_TEMPLATES_DIR = path.join(process.cwd(), 'config', 'json', 'page-templates')

function loadConfigs() {
  const configPath = path.join(process.cwd(), 'config', 'json', 'runtime')
  const configs: Record<string, any> = {}

  try {
    if (fs.existsSync(configPath)) {
      const files = fs.readdirSync(configPath)
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(configPath, file)
          const content = fs.readFileSync(filePath, 'utf8')
          const key = file.replace('.json', '')
          configs[key] = JSON.parse(content)
        }
      })
    }
  } catch (error) {
    console.error('Error loading configs:', error)
  }

  return configs
}

function loadPageTemplate(pageId: string): any {
  const templatePath = path.join(PAGE_TEMPLATES_DIR, `page-${pageId}.json`)
  try {
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error(`Error loading page template for ${pageId}:`, error)
  }
  return null
}

function createModuleData(
  moduleId: string,
  pageId: string,
  configs: Record<string, any>,
  extraConfig?: Record<string, any>
): ModuleData | null {
  const moduleIdToName: Record<string, string> = {
    'site-root': '站点根容器',
    'site-header': '站点头部',
    'site-footer': '站点页脚',
    'sidebar-nav': '侧边栏导航',
    'section-hero': 'Hero 区块',
    'section-partners': '合作伙伴区块',
    'section-products': '产品区块',
    'section-services': '服务区块',
    'section-pricing': '价格区块',
    'section-about': '关于我们区块',
    'section-contact': '联系我们区块',
    'product-list': '产品列表',
    'news-list': '新闻列表',
    'news-detail': '新闻详情',
    'section-404': '404 页面',
  }

  const moduleName = moduleIdToName[moduleId] || moduleId

  let moduleData: any = {}

  switch (moduleId) {
    case 'site-root':
      moduleData = {}
      break
    case 'site-header':
      moduleData = configs.navigation || {}
      break
    case 'site-footer':
      moduleData = configs.footer || {}
      break
    case 'sidebar-nav':
      moduleData = { visible: true }
      break
    case 'section-hero':
      moduleData = configs.homeBanner?.hero || configs.homeBanner || {}
      break
    case 'section-partners':
      moduleData = configs.homePartners?.partners || configs.homePartners || {}
      break
    case 'section-products':
      moduleData = { ...(configs.homeProducts?.products || configs.homeProducts || {}), ...extraConfig }
      break
    case 'section-services':
      moduleData = configs.homeServices?.services || configs.homeServices || {}
      break
    case 'section-pricing':
      moduleData = configs.homePricing?.pricing || configs.homePricing || {}
      break
    case 'section-about':
      moduleData = configs.homeAbout?.about || configs.homeAbout || {}
      break
    case 'section-contact':
      moduleData = configs.homeContact?.contact || configs.homeContact || {}
      break
    case 'product-list':
      moduleData = { 
        ...(configs.products || {}), 
        products: configs.products?.items || [],
        ...extraConfig 
      }
      break
    case 'news-list':
      moduleData = { ...configs.newsList || {}, ...extraConfig }
      break
    case 'news-detail':
      moduleData = { ...configs.newsDetail || {}, ...extraConfig }
      break
    case 'section-404':
      moduleData = {}
      break
    default:
      console.warn(`Unknown module type: ${moduleId}`)
      return null
  }

  return {
    moduleName,
    moduleId,
    moduleInstanceId: `${moduleId}-${pageId}-${Date.now()}`,
    data: moduleData
  }
}

function buildModulesFromTemplate(
  configs: Record<string, any>,
  pageTemplate: any,
  pageId: string,
  extraConfig?: Record<string, any>
): ModuleData[] {
  const moduleIds = pageTemplate?.modules || []
  
  const modules: ModuleData[] = []
  
  for (const moduleId of moduleIds) {
    const moduleData = createModuleData(moduleId, pageId, configs, extraConfig)
    if (moduleData) {
      modules.push(moduleData)
    }
  }
  
  return modules
}

function buildModulesFromConfig(
  configs: Record<string, any>,
  pageOrderConfig: any,
  pageId: string,
  extraConfig?: Record<string, any>
): ModuleData[] {
  const sections = pageOrderConfig?.sections || pageOrderConfig || []
  const visibleSections = sections
    .filter((s: any) => s.visible !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

  const headerModule: ModuleData = {
    moduleName: '站点头部',
    moduleId: 'site-header',
    moduleInstanceId: `site-header-${pageId}-${Date.now()}`,
    data: configs.navigation || {}
  }

  const sidebarNavModule: ModuleData = {
    moduleName: '侧边栏导航',
    moduleId: 'sidebar-nav',
    moduleInstanceId: `sidebar-nav-${pageId}-${Date.now()}`,
    data: { visible: true }
  }

  const navigationModule: ModuleData = {
    moduleName: '导航栏',
    moduleId: 'site-navigation',
    moduleInstanceId: `site-navigation-${pageId}-${Date.now()}`,
    data: configs.navigation || {}
  }

  const footerModule: ModuleData = {
    moduleName: '站点页脚',
    moduleId: 'site-footer',
    moduleInstanceId: `site-footer-${pageId}-${Date.now()}`,
    data: configs.footer || {}
  }

  const sectionModuleDataMap: Record<string, () => ModuleData> = {
    hero: () => ({
      moduleName: 'Hero 区块',
      moduleId: 'section-hero',
      moduleInstanceId: `section-hero-${pageId}-${Date.now()}`,
      data: configs.homeBanner?.hero || configs.homeBanner || {}
    }),
    partner: () => ({
      moduleName: '合作伙伴区块',
      moduleId: 'section-partner',
      moduleInstanceId: `section-partner-${pageId}-${Date.now()}`,
      data: configs.homePartners?.partners || configs.homePartners || {}
    }),
    products: () => ({
      moduleName: '产品区块',
      moduleId: 'section-products',
      moduleInstanceId: `section-products-${pageId}-${Date.now()}`,
      data: { ...(configs.homeProducts?.products || configs.homeProducts || {}), ...extraConfig }
    }),
    services: () => ({
      moduleName: '服务区块',
      moduleId: 'section-services',
      moduleInstanceId: `section-services-${pageId}-${Date.now()}`,
      data: configs.homeServices?.services || configs.homeServices || {}
    }),
    pricing: () => ({
      moduleName: '价格区块',
      moduleId: 'section-pricing',
      moduleInstanceId: `section-pricing-${pageId}-${Date.now()}`,
      data: configs.homePricing?.pricing || configs.homePricing || {}
    }),
    about: () => ({
      moduleName: '关于我们区块',
      moduleId: 'section-about',
      moduleInstanceId: `section-about-${pageId}-${Date.now()}`,
      data: configs.homeAbout?.about || configs.homeAbout || {}
    }),
    contact: () => ({
      moduleName: '联系我们区块',
      moduleId: 'section-contact',
      moduleInstanceId: `section-contact-${pageId}-${Date.now()}`,
      data: configs.homeContact?.contact || configs.homeContact || {}
    }),
    'news-list': () => ({
      moduleName: '新闻列表',
      moduleId: 'news-list',
      moduleInstanceId: `news-list-${pageId}-${Date.now()}`,
      data: { ...configs.newsList || {}, ...extraConfig }
    }),
    'news-detail': () => ({
      moduleName: '新闻详情',
      moduleId: 'news-detail',
      moduleInstanceId: `news-detail-${pageId}-${Date.now()}`,
      data: { ...configs.newsDetail || {}, ...extraConfig }
    }),
    'section-404': () => ({
      moduleName: '404 页面',
      moduleId: 'section-404',
      moduleInstanceId: `section-404-${pageId}-${Date.now()}`,
      data: {}
    })
  }

  const sectionModules: ModuleData[] = visibleSections
    .map((section: any) => {
      const generator = sectionModuleDataMap[section.id]
      return generator ? generator() : null
    })
    .filter((module: ModuleData | null): module is ModuleData => module !== null)

  const modules: ModuleData[] = [
    headerModule,
    navigationModule,
    sidebarNavModule,
    ...sectionModules,
    footerModule
  ]

  return modules
}

export function loadInitialData(): Record<string, any> {
  if (initialDataCache) {
    return initialDataCache
  }

  const configs = loadConfigs()
  const pageTemplate = loadPageTemplate('home')
  
  let modules: ModuleData[]
  if (pageTemplate) {
    modules = buildModulesFromTemplate(configs, pageTemplate, 'home')
  } else {
    const homeOrderConfig = configs.homeOrder || []
    modules = buildModulesFromConfig(configs, homeOrderConfig, 'home')
  }

  initialDataCache = {
    data: {
      theme: configs.theme || {},
      layout: 'default',
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

export function loadPageData(
  pageId: string,
  orderConfigKey?: string,
  extraConfig?: Record<string, any>
): Record<string, any> {
  const cacheKey = `${pageId}-${orderConfigKey || 'default'}`
  
  if (pageDataCache[cacheKey]) {
    return pageDataCache[cacheKey]
  }

  const configs = loadConfigs()
  
  let modules: ModuleData[]
  const pageTemplate = loadPageTemplate(pageId)
  
  if (pageTemplate) {
    modules = buildModulesFromTemplate(configs, pageTemplate, pageId, extraConfig)
  } else {
    const orderConfigKeyToUse = orderConfigKey || `${pageId}Order`
    let pageOrderConfig = configs[orderConfigKeyToUse]
    
    if (!pageOrderConfig) {
      pageOrderConfig = configs.homeOrder || []
    }
    
    modules = buildModulesFromConfig(configs, pageOrderConfig, pageId, extraConfig)
  }

  const pageData = {
    data: {
      theme: configs.theme || {},
      layout: 'default',
      modules,
      common: {
        site: configs.site || {},
        seo: configs.seo || {},
        navigation: configs.navigation || {},
        footer: configs.footer || {},
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
