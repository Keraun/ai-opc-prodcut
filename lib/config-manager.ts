import "server-only"
import { getDatabase, initializeDatabase } from './database'
import fs from 'fs'
import path from 'path'

const TEMPLATES_DIR = path.join(process.cwd(), 'database', 'templates')

export function clearCache(): void {
}

export function readTemplate(configType: string): any {
  const templatePath = getTemplatePath(configType)
  
  if (!fs.existsSync(templatePath)) {
    return {}
  }
  
  return JSON.parse(fs.readFileSync(templatePath, 'utf-8'))
}

export function getTemplatePath(configType: string): string {
  const mapping = getPathMapping(configType)
  return path.join(TEMPLATES_DIR, mapping.dir, `${mapping.prefix}.json`)
}

export function getRuntimePath(configType: string): string {
  return path.join(process.cwd(), 'database', 'app.db')
}

interface PathMapping {
  dir: string
  prefix: string
}

function getPathMapping(configType: string): PathMapping {
  const map: Record<string, PathMapping> = {
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
  
  const aliasMap: Record<string, string> = {
    'hero': 'section-hero',
    'partners': 'section-partner',
    'products': 'section-products',
    'services': 'section-services',
    'pricing': 'section-pricing',
    'about': 'section-about',
    'contact': 'section-contact',
  }
  
  const resolvedType = aliasMap[configType] || configType
  return map[resolvedType] || { dir: 'page-data', prefix: configType }
}

export function readConfig(configType: string): any {
  const db = getDatabase()
  
  try {
    if (configType === 'account') {
      const accounts = db.prepare('SELECT * FROM accounts').all() as any[]
      return accounts.map(acc => ({
        username: acc.username,
        password: acc.password,
        email: acc.email,
        remark: acc.remark,
        mustChangePassword: acc.must_change_password === 1,
        lastLoginTime: acc.last_login_time,
        lastLoginIP: acc.last_login_ip,
        currentLoginIP: acc.current_login_ip,
        currentLoginTime: acc.current_login_time
      }))
    }
    
    if (configType === 'feishu-app') {
      const config = db.prepare("SELECT config_value FROM system_config WHERE config_key = 'feishu_app'").get() as any
      return config ? JSON.parse(config.config_value) : {}
    }
    
    if (configType === 'token') {
      const config = db.prepare("SELECT config_value FROM system_config WHERE config_key = 'super_admin_token'").get() as any
      return config ? JSON.parse(config.config_value) : {}
    }
    
    if (configType === 'system-logs') {
      const logs = db.prepare('SELECT * FROM system_logs ORDER BY id DESC').all() as any[]
      return logs.map(log => ({
        id: log.log_id,
        username: log.username,
        type: log.type,
        description: log.description,
        ip: log.ip,
        timestamp: log.timestamp,
        details: log.details ? JSON.parse(log.details) : null
      }))
    }
    
    if (configType === 'site' || configType === 'site-seo') {
      const configs = db.prepare('SELECT * FROM site_config').all() as any[]
      const result: any = {}
      for (const config of configs) {
        result[config.config_key] = JSON.parse(config.config_value)
      }
      return result
    }
    
    if (configType === 'theme') {
      const config = db.prepare('SELECT * FROM theme_config LIMIT 1').get() as any
      if (config) {
        return {
          currentTheme: config.current_theme,
          themes: JSON.parse(config.themes_config)
        }
      }
      return {}
    }
    
    if (configType === 'page-list') {
      const pages = db.prepare('SELECT * FROM pages').all() as any[]
      const pageModules = db.prepare('SELECT * FROM page_modules ORDER BY module_order').all() as any[]
      
      const pagesData = pages.map(page => {
        const modules = pageModules
          .filter(pm => pm.page_id === page.page_id)
          .map(pm => pm.module_name)
        
        return {
          id: page.page_id,
          name: page.name,
          slug: page.slug,
          type: page.type,
          description: page.description,
          status: page.status,
          isSystem: page.is_system === 1,
          isDeletable: page.is_deletable === 1,
          route: page.route,
          dynamicParam: page.dynamic_param,
          createdAt: page.created_at,
          updatedAt: page.updated_at,
          publishedAt: page.published_at,
          modules
        }
      })
      
      const systemPages = pages.filter(p => p.is_system === 1).map(p => p.page_id)
      
      return {
        pages: pagesData,
        systemPages,
        dynamicRoutePattern: '[param]',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    
    const module = db.prepare('SELECT * FROM module_data WHERE module_name = ?').get(configType) as any
    if (module) {
      return JSON.parse(module.data)
    }
    
    return {}
    
  } finally {
    db.close()
  }
}

export function writeConfig(configType: string, data: any): void {
  const db = getDatabase()
  
  try {
    if (configType === 'account') {
      db.exec('DELETE FROM accounts')
      
      const stmt = db.prepare(`
        INSERT INTO accounts 
        (username, password, email, remark, must_change_password, last_login_time, last_login_ip, current_login_ip, current_login_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const account of data) {
        stmt.run(
          account.username,
          account.password,
          account.email || null,
          account.remark || null,
          account.mustChangePassword ? 1 : 0,
          account.lastLoginTime || null,
          account.lastLoginIP || null,
          account.currentLoginIP || null,
          account.currentLoginTime || null
        )
      }
      return
    }
    
    if (configType === 'feishu-app') {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO system_config (config_key, config_value)
        VALUES (?, ?)
      `)
      stmt.run('feishu_app', JSON.stringify(data))
      return
    }
    
    if (configType === 'token') {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO system_config (config_key, config_value)
        VALUES (?, ?)
      `)
      stmt.run('super_admin_token', JSON.stringify(data))
      return
    }
    
    if (configType === 'system-logs') {
      db.exec('DELETE FROM system_logs')
      
      const stmt = db.prepare(`
        INSERT INTO system_logs 
        (log_id, username, type, description, ip, timestamp, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const log of data) {
        stmt.run(
          log.id,
          log.username || null,
          log.type,
          log.description || null,
          log.ip || null,
          log.timestamp || null,
          log.details ? JSON.stringify(log.details) : null
        )
      }
      return
    }
    
    if (configType === 'site' || configType === 'site-seo') {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO site_config (config_key, config_value)
        VALUES (?, ?)
      `)
      
      for (const [key, value] of Object.entries(data)) {
        stmt.run(key, JSON.stringify(value))
      }
      return
    }
    
    if (configType === 'theme') {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO theme_config (id, current_theme, themes_config)
        VALUES (1, ?, ?)
      `)
      stmt.run(
        data.currentTheme || 'modern',
        JSON.stringify(data.themes || {})
      )
      return
    }
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO module_data (module_name, data)
      VALUES (?, ?)
    `)
    stmt.run(configType, JSON.stringify(data))
    
  } finally {
    db.close()
  }
}

export function deleteConfig(configType: string): boolean {
  const db = getDatabase()
  
  try {
    if (configType.startsWith('page-')) {
      const pageId = configType.replace('page-', '')
      db.prepare('DELETE FROM page_modules WHERE page_id = ?').run(pageId)
      db.prepare('DELETE FROM pages WHERE page_id = ?').run(pageId)
      return true
    }
    
    const result = db.prepare('DELETE FROM module_data WHERE module_name = ?').run(configType)
    return result.changes > 0
    
  } finally {
    db.close()
  }
}

export function readPageData(moduleName: string): any {
  return readConfig(moduleName)
}

export function writePageData(moduleName: string, data: any): void {
  writeConfig(moduleName, data)
}

export function readAllPageData(): Record<string, any> {
  const db = getDatabase()
  
  try {
    const modules = db.prepare('SELECT * FROM module_data').all() as any[]
    const result: Record<string, any> = {}
    
    for (const module of modules) {
      result[module.module_id] = JSON.parse(module.data)
    }
    
    return result
    
  } finally {
    db.close()
  }
}

export function readSystemConfig(configName: string): any {
  return readConfig(configName)
}

export function writeSystemConfig(configName: string, data: any): void {
  writeConfig(configName, data)
}

export function listSystemConfigs(): string[] {
  return ['account', 'token', 'feishu-app', 'system-logs']
}

export function readAllConfigs(): Record<string, any> {
  console.warn('Warning: readAllConfigs() is deprecated. Use readAllPageData() for page data and readSystemConfig() for system configs.')
  
  const configs: Record<string, any> = {}
  
  Object.assign(configs, readAllPageData())
  
  const systemConfigs = listSystemConfigs()
  for (const configName of systemConfigs) {
    configs[configName] = readSystemConfig(configName)
  }
  
  return configs
}

export function resetToTemplate(configType: string): void {
  const templateData = readTemplate(configType)
  writeConfig(configType, templateData)
}

export function resetAllToTemplates(): void {
  console.warn('Warning: resetAllToTemplates() is deprecated and should not be used in production.')
  
  const configs = readAllConfigs()
  
  for (const configType of Object.keys(configs)) {
    resetToTemplate(configType)
  }
}

export function initializeDatabaseFromTemplates(): void {
  initializeDatabase()
  console.log('Database initialized from templates')
}

export function getPageResponse(pageId: string): any {
  const db = getDatabase()
  
  try {
    const page = db.prepare('SELECT * FROM pages WHERE page_id = ?').get(pageId) as any
    
    if (!page) {
      return {
        pageName: pageId,
        pageId: pageId,
        modules: [],
        data: [],
        common: {
          site: readConfig('site'),
          theme: readConfig('theme')
        }
      }
    }
    
    const pageModules = db.prepare('SELECT * FROM page_modules WHERE page_id = ? ORDER BY module_order').all(pageId) as any[]
    const modules = pageModules.map(pm => pm.module_name)
    
    const response = {
      pageName: page.name || pageId,
      pageId: pageId,
      modules,
      data: [] as any[],
      common: {
        site: readConfig('site'),
        theme: readConfig('theme')
      }
    }
    
    for (const pm of pageModules) {
      const moduleData = readPageData(pm.module_name)
      response.data.push({
        moduleId: pm.module_name,
        moduleInstanceId: pm.module_instance_id,
        data: pm.data ? JSON.parse(pm.data) : moduleData
      })
    }
    
    return response
    
  } finally {
    db.close()
  }
}
