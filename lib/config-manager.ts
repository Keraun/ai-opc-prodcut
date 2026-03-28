import "server-only"
import { getDatabase, initializeDatabase } from './database'
import fs from 'fs'
import path from 'path'

const TEMPLATES_DIR = path.join(process.cwd(), 'database', 'templates')

export function clearCache(): void {
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
      return config ? { superAdminToken: config.config_value } : { superAdminToken: '' }
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
      const config = db.prepare("SELECT config_value FROM system_config WHERE config_key = 'site_config'").get() as any
      if (config) {
        try {
          return JSON.parse(config.config_value)
        } catch {
          return {}
        }
      }
      return {}
    }
    
    if (configType === 'theme') {
      const themes = db.prepare('SELECT * FROM theme_config').all() as any[]
      
      let currentTheme = 'modern'
      const themesMap: Record<string, any> = {}
      
      themes.forEach(theme => {
        themesMap[theme.theme_id] = JSON.parse(theme.theme_config)
        if (theme.is_current === 1) {
          currentTheme = theme.theme_id
        }
      })
      
      return {
        currentTheme,
        themes: themesMap
      }
    }
    
    if (configType === 'page-list') {
      const pages = db.prepare('SELECT * FROM pages').all() as any[]
      
      const pagesData = pages.map(page => {
        let moduleInstanceIds: string[] = []
        try {
          moduleInstanceIds = page.module_instance_ids ? JSON.parse(page.module_instance_ids) : []
        } catch (e) {
          moduleInstanceIds = []
        }
        
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
          moduleInstanceIds
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
    
    const module = db.prepare('SELECT * FROM module_registry WHERE module_id = ?').get(configType) as any
    if (module) {
      return JSON.parse(module.default_data)
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
      stmt.run('super_admin_token', data.superAdminToken || '')
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
        INSERT OR REPLACE INTO system_config (config_key, config_value)
        VALUES (?, ?)
      `)
      stmt.run('site_config', JSON.stringify(data))
      return
    }
    
    if (configType === 'theme') {
      if (data.currentTheme) {
        db.exec('UPDATE theme_config SET is_current = 0')
        db.prepare('UPDATE theme_config SET is_current = 1 WHERE theme_id = ?').run(data.currentTheme)
      }
      
      if (data.themes) {
        const deleteStmt = db.prepare('DELETE FROM theme_config')
        deleteStmt.run()
        
        const currentThemeId = data.currentTheme
        
        const insertStmt = db.prepare(`
          INSERT INTO theme_config (theme_id, theme_name, theme_config, is_current)
          VALUES (?, ?, ?, ?)
        `)
        
        for (const [themeId, themeData] of Object.entries(data.themes)) {
          const theme = themeData as any
          const isCurrent = themeId === currentThemeId ? 1 : 0
          insertStmt.run(
            themeId,
            theme.name || themeId,
            JSON.stringify(theme),
            isCurrent
          )
        }
      }
      return
    }
    
    const moduleName = (data.moduleName as string) || configType
    const schema = data.schema ? JSON.stringify(data.schema) : null
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO module_registry (module_id, module_name, schema, default_data)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(configType, moduleName, schema, JSON.stringify(data))
    
  } finally {
    db.close()
  }
}

export function deleteConfig(configType: string): boolean {
  const db = getDatabase()
  
  try {
    if (configType.startsWith('page-')) {
      const pageId = configType.replace('page-', '')
      
      const page = db.prepare('SELECT modules FROM pages WHERE page_id = ?').get(pageId) as any
      if (page?.modules) {
        const moduleInstanceIds = JSON.parse(page.modules)
        for (const instanceId of moduleInstanceIds) {
          db.prepare('DELETE FROM page_modules WHERE module_instance_id = ?').run(instanceId)
        }
      }
      
      db.prepare('DELETE FROM pages WHERE page_id = ?').run(pageId)
      return true
    }
    
    const result = db.prepare('DELETE FROM module_registry WHERE module_id = ?').run(configType)
    return result.changes > 0
    
  } finally {
    db.close()
  }
}

export function readPageData(moduleId: string): any {
  return readConfig(moduleId)
}

export function writePageData(moduleId: string, data: any): void {
  writeConfig(moduleId, data)
}

export function readAllPageData(): Record<string, any> {
  const db = getDatabase()
  
  try {
    const modules = db.prepare('SELECT * FROM module_registry').all() as any[]
    const result: Record<string, any> = {}
    
    for (const module of modules) {
      result[module.module_id] = JSON.parse(module.default_data)
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
        moduleInstanceIds: [],
        data: [],
        common: {
          site: readConfig('site'),
          theme: readConfig('theme')
        }
      }
    }
    
    let moduleInstanceIds: string[] = []
    try {
      moduleInstanceIds = page.module_instance_ids ? JSON.parse(page.module_instance_ids) : []
    } catch (e) {
      moduleInstanceIds = []
    }
    
    const pageModules = db.prepare(`
      SELECT pm.*, mr.default_data 
      FROM page_modules pm 
      LEFT JOIN module_registry mr ON pm.module_id = mr.module_id 
      WHERE pm.page_id = ? 
      ORDER BY pm.module_order
    `).all(pageId) as any[]
    
    const modules = pageModules.map(pm => pm.module_id)
    
    const response = {
      pageName: page.name || pageId,
      pageId: pageId,
      modules,
      moduleInstanceIds,
      data: [] as any[],
      common: {
        site: readConfig('site'),
        theme: readConfig('theme')
      }
    }
    
    for (const pm of pageModules) {
      const moduleData = pm.data 
        ? JSON.parse(pm.data) 
        : (pm.default_data ? JSON.parse(pm.default_data) : {})
      
      response.data.push({
        moduleId: pm.module_id,
        moduleInstanceId: pm.module_instance_id,
        moduleName: pm.module_name,
        data: moduleData
      })
    }
    
    return response
    
  } finally {
    db.close()
  }
}

export function getModuleRegistry(): any[] {
  const db = getDatabase()
  
  try {
    const modules = db.prepare('SELECT * FROM module_registry').all() as any[]
    
    return modules.map(m => ({
      moduleId: m.module_id,
      moduleName: m.module_name,
      schema: m.schema ? JSON.parse(m.schema) : null,
      defaultData: m.default_data ? JSON.parse(m.default_data) : null
    }))
  } finally {
    db.close()
  }
}

export function registerModule(moduleId: string, moduleName: string, schema: any, defaultData: any): void {
  const db = getDatabase()
  
  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO module_registry (module_id, module_name, schema, default_data)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(
      moduleId,
      moduleName,
      schema ? JSON.stringify(schema) : null,
      defaultData ? JSON.stringify(defaultData) : null
    )
  } finally {
    db.close()
  }
}
