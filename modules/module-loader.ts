export interface ModuleLoaderConfig {
  loaders: Record<string, () => Promise<any>>
  componentNames: Record<string, string>
}

export const MODULE_LOADERS: Record<string, () => Promise<any>> = {
  'site-header': () => import('./site-header/mod'),
  'site-footer': () => import('./site-footer/mod'),
  'section-hero': () => import('./section-hero/mod'),
  'section-services': () => import('./section-services/mod'),
  'section-partner': () => import('./section-partner/mod'),
  'section-products': () => import('./section-products/mod'),
  'section-pricing': () => import('./section-pricing/mod'),
  'section-about': () => import('./section-about/mod'),
  'section-contact': () => import('./section-contact/mod'),
  'site-root': () => import('./site-root/mod'),
  'site-navigation': () => import('./site-navigation/mod'),
  'news-list': () => import('./news-list/mod'),
  'news-detail': () => import('./news-detail/mod'),
  'section-404': () => import('./section-404/mod'),
  'product-list': () => import('./product-list/mod'),
}

export const MODULE_COMPONENT_NAMES: Record<string, string> = {
  'site-header': 'HeaderModule',
  'site-footer': 'FooterModule',
  'section-hero': 'HeroModule',
  'section-services': 'ServicesModule',
  'section-partner': 'PartnerModule',
  'section-products': 'ProductsModule',
  'section-pricing': 'PricingModule',
  'section-about': 'AboutModule',
  'section-contact': 'ContactModule',
  'site-root': 'SiteRootModule',
  'site-navigation': 'NavigationModule',
  'news-list': 'NewsListModule',
  'news-detail': 'NewsDetailModule',
  'section-404': 'NotFoundModule',
  'product-list': 'ProductListModule',
}

export function getModuleLoaderConfig(): ModuleLoaderConfig {
  return {
    loaders: MODULE_LOADERS,
    componentNames: MODULE_COMPONENT_NAMES
  }
}

export function getModuleLoader(moduleId: string): (() => Promise<any>) | undefined {
  return MODULE_LOADERS[moduleId]
}

export function getModuleComponentName(moduleId: string): string | undefined {
  return MODULE_COMPONENT_NAMES[moduleId]
}

export function isModuleRegistered(moduleId: string): boolean {
  return moduleId in MODULE_LOADERS
}

export function getRegisteredModuleIds(): string[] {
  return Object.keys(MODULE_LOADERS)
}

export function validateModuleId(moduleId: string): { valid: boolean; error?: string } {
  if (!moduleId) {
    return { valid: false, error: 'Module ID is required' }
  }
  if (!isModuleRegistered(moduleId)) {
    return { valid: false, error: `Module "${moduleId}" is not registered` }
  }
  return { valid: true }
}
