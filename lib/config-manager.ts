import fs from "fs"
import path from "path"

const DATABASE_DIR = path.join(process.cwd(), "database")
const TEMPLATES_DIR = path.join(DATABASE_DIR, "templates")
const RUNTIME_DIR = path.join(DATABASE_DIR, "runtime")

interface PathMapping {
  dir: string
  prefix: string
}

// 基础路径映射
const basePathMap: Record<string, PathMapping> = {
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

// 别名映射
const aliasMap: Record<string, string> = {
  'hero': 'section-hero',
  'partners': 'section-partner',
  'products': 'section-products',
  'services': 'section-services',
  'pricing': 'section-pricing',
  'about': 'section-about',
  'contact': 'section-contact',
}

// 合并基础映射和别名映射
const typeToPathMap: Record<string, PathMapping> = {
  ...basePathMap,
  // 添加别名映射
  ...Object.fromEntries(
    Object.entries(aliasMap).map(([alias, target]) => [alias, basePathMap[target]])
  ),
}

function getPathMapping(configType: string): PathMapping {
  return typeToPathMap[configType] || { dir: 'page-data', prefix: configType }
}

export function getTemplatePath(configType: string): string {
  const { dir, prefix } = getPathMapping(configType)
  return path.join(TEMPLATES_DIR, dir, `${prefix}.json`)
}

export function getRuntimePath(configType: string): string {
  const { dir, prefix } = getPathMapping(configType)
  return path.join(RUNTIME_DIR, dir, `${prefix}.json`)
}

// 配置缓存
const configCache: Record<string, any> = {}

// 清除缓存
export function clearCache(configType?: string): void {
  if (configType) {
    delete configCache[configType]
  } else {
    Object.keys(configCache).forEach(key => delete configCache[key])
  }
}

export function readConfig(configType: string): any {
  // 检查缓存
  if (configCache[configType]) {
    return configCache[configType]
  }
  
  const runtimePath = getRuntimePath(configType)
  const templatePath = getTemplatePath(configType)
  
  let configData: any = {}
  
  if (fs.existsSync(runtimePath)) {
    configData = JSON.parse(fs.readFileSync(runtimePath, "utf-8"))
  } else if (fs.existsSync(templatePath)) {
    configData = JSON.parse(fs.readFileSync(templatePath, "utf-8"))
    
    // 复制到运行时目录
    const runtimeDir = path.dirname(runtimePath)
    if (!fs.existsSync(runtimeDir)) {
      fs.mkdirSync(runtimeDir, { recursive: true })
    }
    
    fs.writeFileSync(runtimePath, JSON.stringify(configData, null, 2), "utf-8")
  }
  
  // 缓存结果
  configCache[configType] = configData
  return configData
}

export function writeConfig(configType: string, data: any): void {
  const runtimePath = getRuntimePath(configType)
  const runtimeDir = path.dirname(runtimePath)
  
  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true })
  }
  
  fs.writeFileSync(runtimePath, JSON.stringify(data, null, 2), "utf-8")
  
  // 清除缓存
  clearCache(configType)
}

export function deleteConfig(configType: string): boolean {
  try {
    const runtimePath = getRuntimePath(configType)
    
    if (fs.existsSync(runtimePath)) {
      fs.unlinkSync(runtimePath)
      // 清除缓存
      clearCache(configType)
      return true
    }
    
    return false
  } catch (error) {
    console.error(`Error deleting config ${configType}:`, error)
    return false
  }
}

export function readTemplate(configType: string): any {
  const templatePath = getTemplatePath(configType)
  
  if (!fs.existsSync(templatePath)) {
    return {}
  }
  
  return JSON.parse(fs.readFileSync(templatePath, "utf-8"))
}

function readAllFromDir(dir: string, typePrefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {}
  const templateDir = path.join(TEMPLATES_DIR, dir)
  
  if (fs.existsSync(templateDir)) {
    const files = fs.readdirSync(templateDir).filter(file => file.endsWith('.json'))
    
    for (const file of files) {
      const baseName = file.replace('.json', '')
      let configType = baseName
      
      if (dir === 'page-data' && baseName.startsWith('data-')) {
        configType = baseName.replace('data-', '')

      } else if (dir === 'site-info') {
        configType = 'site'
      } else if (dir === 'theme' && baseName === 'theme-config') {
        configType = 'theme'
      } else if (dir === 'system') {
        if (baseName === 'system-account') configType = 'account'
        else if (baseName === 'system-token') configType = 'token'
        else if (baseName === 'system-feishu-app') configType = 'feishu-app'
        else configType = baseName
      }
      
      result[configType] = readConfig(configType)
    }
  }
  
  return result
}

export function readAllConfigs(): Record<string, any> {
  const configs: Record<string, any> = {}
  
  Object.assign(configs, readAllFromDir('site-info'))
  Object.assign(configs, readAllFromDir('page-data'))
  Object.assign(configs, readAllFromDir('theme'))
  Object.assign(configs, readAllFromDir('system'))
  
  return configs
}

export function resetToTemplate(configType: string): void {
  const templateData = readTemplate(configType)
  writeConfig(configType, templateData)
}

export function resetAllToTemplates(): void {
  const configs = readAllConfigs()
  
  for (const configType of Object.keys(configs)) {
    resetToTemplate(configType)
  }
  
  // 清除所有缓存
  clearCache()
}

export function getPageResponse(pageId: string): any {
  // 从 page-list.json 读取页面配置
  const pageListPath = getRuntimePath('page-list')
  let pageConfig = null
  
  if (fs.existsSync(pageListPath)) {
    const pageListData = JSON.parse(fs.readFileSync(pageListPath, 'utf-8'))
    pageConfig = pageListData.pages.find((page: any) => page.id === pageId)
  }
  
  const response = {
    pageName: pageId,
    pageId: pageId,
    modules: pageConfig?.modules || [],
    data: [] as any[],
    common: {
      site: readConfig('site'),
      theme: readConfig('theme')
    }
  }
  
  if (pageConfig?.modules && Array.isArray(pageConfig.modules)) {
    for (const moduleId of pageConfig.modules) {
      const moduleData = readConfig(moduleId)
      response.data.push({
        moduleId,
        data: moduleData
      })
    }
  }
  
  return response
}
