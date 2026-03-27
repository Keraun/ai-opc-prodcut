export interface PathMapping {
  dir: string
  prefix: string
}

export const PATH_MAPPINGS: Record<string, PathMapping> = {
  'site': { dir: 'site-info', prefix: 'site-config' },
  'site-seo': { dir: 'site-info', prefix: 'site-config' },
  'site-footer': { dir: 'page-data', prefix: 'data-site-footer' },
  'site-navigation': { dir: 'page-data', prefix: 'data-site-navigation' },
  'site-root': { dir: 'page-data', prefix: 'data-site-root' },
  'site-header': { dir: 'page-data', prefix: 'data-site-header' },
  'section-hero': { dir: 'page-data', prefix: 'data-section-hero' },
  'section-partner': { dir: 'page-data', prefix: 'data-section-partner' },
  'section-products': { dir: 'page-data', prefix: 'data-section-products' },
  'section-services': { dir: 'page-data', prefix: 'data-section-services' },
  'section-pricing': { dir: 'page-data', prefix: 'data-section-pricing' },
  'section-about': { dir: 'page-data', prefix: 'data-section-about' },
  'section-contact': { dir: 'page-data', prefix: 'data-section-contact' },
  'section-404': { dir: 'page-data', prefix: 'data-section-404' },
  'news-list': { dir: 'page-data', prefix: 'data-news-list' },
  'news-detail': { dir: 'page-data', prefix: 'data-news-detail' },
  'product-list': { dir: 'page-data', prefix: 'data-product-list' },
  'theme': { dir: 'theme', prefix: 'theme-config' },
  'account': { dir: 'system', prefix: 'system-account' },
  'token': { dir: 'system', prefix: 'system-token' },
  'system-logs': { dir: 'system', prefix: 'system-logs' },
  'verification-codes': { dir: 'system', prefix: 'system-verification-codes' },
  'feishu-app': { dir: 'system', prefix: 'system-feishu-app' },
  'page-list': { dir: '', prefix: 'page-list' },
}

export const ALIAS_MAPPINGS: Record<string, string> = {
  'hero': 'section-hero',
  'partners': 'section-partner',
  'products': 'section-products',
  'services': 'section-services',
  'pricing': 'section-pricing',
  'about': 'section-about',
  'contact': 'section-contact',
}

export function getPathMapping(configType: string): PathMapping {
  const resolvedType = ALIAS_MAPPINGS[configType] || configType
  return PATH_MAPPINGS[resolvedType] || { dir: 'page-data', prefix: configType }
}

export function resolveConfigType(configType: string): string {
  return ALIAS_MAPPINGS[configType] || configType
}
