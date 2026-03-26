import fs from "fs"
import path from "path"

const DATABASE_DIR = path.join(process.cwd(), "database")
const TEMPLATES_DIR = path.join(DATABASE_DIR, "templates")
const RUNTIME_DIR = path.join(DATABASE_DIR, "runtime")

interface PathMapping {
  dir: string
  prefix: string
}

const typeToPathMap: Record<string, PathMapping> = {
  'site': { dir: 'site-info', prefix: 'site-config' },
  'site-seo': { dir: 'site-info', prefix: 'site-config' },
  'site-footer': { dir: 'page-data', prefix: 'data-site-footer' },
  'site-navigation': { dir: 'page-data', prefix: 'data-site-navigation' },
  
  'page-home': { dir: 'page-module', prefix: 'page-home' },
  'page-news': { dir: 'page-module', prefix: 'page-news' },
  'page-product': { dir: 'page-module', prefix: 'page-product' },
  'page-new-detail': { dir: 'page-module', prefix: 'page-new-detail' },
  'page-404': { dir: 'page-module', prefix: 'page-404' },
  
  'site-root': { dir: 'page-data', prefix: 'data-site-root' },
  'site-header': { dir: 'page-data', prefix: 'data-site-header' },
  'sidebar-nav': { dir: 'page-data', prefix: 'data-sidebar-nav' },
  'hero': { dir: 'page-data', prefix: 'data-section-hero' },
  'section-hero': { dir: 'page-data', prefix: 'data-section-hero' },
  'partners': { dir: 'page-data', prefix: 'data-section-partner' },
  'section-partner': { dir: 'page-data', prefix: 'data-section-partner' },
  'products': { dir: 'page-data', prefix: 'data-section-products' },
  'section-products': { dir: 'page-data', prefix: 'data-section-products' },
  'services': { dir: 'page-data', prefix: 'data-section-services' },
  'section-services': { dir: 'page-data', prefix: 'data-section-services' },
  'pricing': { dir: 'page-data', prefix: 'data-section-pricing' },
  'section-pricing': { dir: 'page-data', prefix: 'data-section-pricing' },
  'about': { dir: 'page-data', prefix: 'data-section-about' },
  'section-about': { dir: 'page-data', prefix: 'data-section-about' },
  'contact': { dir: 'page-data', prefix: 'data-section-contact' },
  'section-contact': { dir: 'page-data', prefix: 'data-section-contact' },
  'section-404': { dir: 'page-data', prefix: 'data-section-404' },
  'news-list': { dir: 'page-data', prefix: 'data-news-list' },
  'news-detail': { dir: 'page-data', prefix: 'data-news-detail' },
  'product-list': { dir: 'page-data', prefix: 'data-product-list' },
  
  'theme': { dir: 'theme', prefix: 'theme-config' },
  'theme-custom': { dir: 'theme', prefix: 'theme-custom' },
  'theme-modern': { dir: 'theme', prefix: 'theme-modern' },
  'theme-nature': { dir: 'theme', prefix: 'theme-nature' },
  'theme-tech': { dir: 'theme', prefix: 'theme-tech' },
  
  'account': { dir: 'system', prefix: 'system-account' },
  'token': { dir: 'system', prefix: 'system-token' },
  'operation-logs': { dir: 'system', prefix: 'operation-logs' },
  'system-logs': { dir: 'system', prefix: 'system-logs' },
  'verification-codes': { dir: 'system', prefix: 'system-verification-codes' },
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

export function readConfig(configType: string): any {
  const runtimePath = getRuntimePath(configType)
  const templatePath = getTemplatePath(configType)
  
  if (fs.existsSync(runtimePath)) {
    return JSON.parse(fs.readFileSync(runtimePath, "utf-8"))
  }
  
  if (fs.existsSync(templatePath)) {
    const templateData = JSON.parse(fs.readFileSync(templatePath, "utf-8"))
    
    const runtimeDir = path.dirname(runtimePath)
    if (!fs.existsSync(runtimeDir)) {
      fs.mkdirSync(runtimeDir, { recursive: true })
    }
    
    fs.writeFileSync(runtimePath, JSON.stringify(templateData, null, 2), "utf-8")
    
    return templateData
  }
  
  return {}
}

export function writeConfig(configType: string, data: any): void {
  const runtimePath = getRuntimePath(configType)
  const runtimeDir = path.dirname(runtimePath)
  
  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true })
  }
  
  fs.writeFileSync(runtimePath, JSON.stringify(data, null, 2), "utf-8")
}

export function deleteConfig(configType: string): boolean {
  try {
    const runtimePath = getRuntimePath(configType)
    
    if (fs.existsSync(runtimePath)) {
      fs.unlinkSync(runtimePath)
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
      } else if (dir === 'page-module' && baseName.startsWith('page-')) {
        configType = baseName
      } else if (dir === 'site-info') {
        configType = 'site'
      } else if (dir === 'theme' && baseName === 'theme-config') {
        configType = 'theme'
      } else if (dir === 'system') {
        if (baseName === 'system-account') configType = 'account'
        else if (baseName === 'system-token') configType = 'token'
        else if (baseName === 'operation-logs') configType = 'operation-logs'
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
  Object.assign(configs, readAllFromDir('page-module'))
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
}

export function getPageResponse(pageId: string): any {
  const pageModuleType = `page-${pageId}`
  const pageModule = readConfig(pageModuleType)
  
  const response = {
    pageName: pageId,
    pageId: pageId,
    modules: pageModule.modules || [],
    data: [] as any[],
    common: {
      site: readConfig('site'),
      theme: readConfig('theme')
    }
  }
  
  if (pageModule.modules && Array.isArray(pageModule.modules)) {
    for (const moduleId of pageModule.modules) {
      const moduleData = readConfig(moduleId)
      response.data.push({
        moduleId,
        data: moduleData
      })
    }
  }
  
  return response
}
