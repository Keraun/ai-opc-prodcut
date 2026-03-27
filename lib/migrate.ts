import fs from 'fs'
import path from 'path'
import { getDatabase, initializeDatabase } from './database'

const RUNTIME_DIR = path.join(process.cwd(), 'database', 'runtime')
const TEMPLATES_DIR = path.join(process.cwd(), 'database', 'templates')

function readJsonFile(filePath: string): any {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
  }
  return null
}

export function migrateFromJson(useTemplates: boolean = false): void {
  const baseDir = useTemplates ? TEMPLATES_DIR : RUNTIME_DIR
  
  initializeDatabase()
  
  const db = getDatabase()
  
  try {
    db.exec('BEGIN TRANSACTION')
    
    console.log('Starting data migration from JSON to SQLite...')
    
    const accountsPath = path.join(baseDir, 'system', 'system-account.json')
    const accountsData = readJsonFile(accountsPath)
    if (accountsData && Array.isArray(accountsData)) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO accounts 
        (username, password, email, remark, must_change_password, last_login_time, last_login_ip, current_login_ip, current_login_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const account of accountsData) {
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
      console.log(`Migrated ${accountsData.length} accounts`)
    }
    
    const feishuPath = path.join(baseDir, 'system', 'system-feishu-app.json')
    const feishuData = readJsonFile(feishuPath)
    if (feishuData) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO system_config (config_key, config_value)
        VALUES (?, ?)
      `)
      stmt.run('feishu_app', JSON.stringify(feishuData))
      console.log('Migrated feishu_app config')
    }
    
    const tokenPath = path.join(baseDir, 'system', 'system-token.json')
    const tokenData = readJsonFile(tokenPath)
    if (tokenData) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO system_config (config_key, config_value)
        VALUES (?, ?)
      `)
      stmt.run('super_admin_token', tokenData.superAdminToken || '')
      console.log('Migrated super_admin_token config')
    }
    
    const logsPath = path.join(baseDir, 'system', 'system-logs.json')
    const logsData = readJsonFile(logsPath)
    if (logsData && Array.isArray(logsData)) {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO system_logs 
        (log_id, username, type, description, ip, timestamp, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const log of logsData) {
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
      console.log(`Migrated ${logsData.length} system logs`)
    }
    
    const siteConfigPath = path.join(baseDir, 'site-info', 'site-config.json')
    const siteConfigData = readJsonFile(siteConfigPath)
    
    const themeConfigPath = path.join(baseDir, 'theme', 'theme-config.json')
    const themeConfigData = readJsonFile(themeConfigPath)
    
    if (siteConfigData || themeConfigData) {
      const mergedSiteConfig: any = { ...siteConfigData }
      
      if (themeConfigData?.currentTheme) {
        mergedSiteConfig.currentTheme = themeConfigData.currentTheme
      }
      
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO system_config (config_key, config_value)
        VALUES (?, ?)
      `)
      stmt.run('site_config', JSON.stringify(mergedSiteConfig))
      console.log('Migrated site config')
    }
    
    if (themeConfigData?.themes) {
      const themeStmt = db.prepare(`
        INSERT OR REPLACE INTO theme_config (theme_id, theme_name, theme_config)
        VALUES (?, ?, ?)
      `)
      
      for (const [themeId, themeData] of Object.entries(themeConfigData.themes)) {
        const theme = themeData as any
        themeStmt.run(
          themeId,
          theme.name || themeId,
          JSON.stringify(theme)
        )
      }
      console.log('Migrated theme config')
    }
    
    const pageDataDir = path.join(baseDir, 'page-data')
    if (fs.existsSync(pageDataDir)) {
      const files = fs.readdirSync(pageDataDir).filter(file => file.endsWith('.json'))
      const registryStmt = db.prepare(`
        INSERT OR REPLACE INTO module_registry (module_id, module_name, schema, default_data)
        VALUES (?, ?, ?, ?)
      `)
      
      for (const file of files) {
        const moduleId = file.replace('data-', '').replace('.json', '')
        const filePath = path.join(pageDataDir, file)
        const data = readJsonFile(filePath)
        
        if (data) {
          const moduleName = (data.moduleName as string) || moduleId
          const schema = data.schema ? JSON.stringify(data.schema) : null
          const defaultData = JSON.stringify(data)
          
          registryStmt.run(moduleId, moduleName, schema, defaultData)
        }
      }
      console.log(`Migrated ${files.length} module registry entries`)
    }
    
    const pageListPath = path.join(baseDir, 'page-list.json')
    const pageListData = readJsonFile(pageListPath)
    if (pageListData && pageListData.pages) {
      const pageStmt = db.prepare(`
        INSERT OR REPLACE INTO pages 
        (page_id, name, slug, type, description, status, is_system, is_deletable, route, dynamic_param, modules, created_at, updated_at, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const page of pageListData.pages) {
        const moduleInstanceIds: string[] = []
        
        if (page.modules && Array.isArray(page.modules)) {
          for (let i = 0; i < page.modules.length; i++) {
            const moduleId = page.modules[i]
            const timestamp = Date.now()
            const moduleInstanceId = `${moduleId}-${timestamp}`
            moduleInstanceIds.push(moduleInstanceId)
          }
        }
        
        pageStmt.run(
          page.id,
          page.name,
          page.slug,
          page.type || 'static',
          page.description || null,
          page.status || 'draft',
          page.isSystem ? 1 : 0,
          page.isDeletable ? 1 : 0,
          page.route || null,
          page.dynamicParam || null,
          JSON.stringify(moduleInstanceIds),
          page.createdAt || null,
          page.updatedAt || null,
          page.publishedAt || null
        )
      }
      console.log(`Migrated ${pageListData.pages.length} pages`)
      
      const moduleStmt = db.prepare(`
        INSERT OR REPLACE INTO page_modules (module_instance_id, page_id, module_id, module_name, module_order, data)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      
      let moduleCount = 0
      for (const page of pageListData.pages) {
        if (page.modules && Array.isArray(page.modules)) {
          for (let i = 0; i < page.modules.length; i++) {
            const moduleId = page.modules[i]
            const timestamp = Date.now()
            const moduleInstanceId = `${moduleId}-${timestamp}`
            
            const moduleName = moduleId
            moduleStmt.run(moduleInstanceId, page.id, moduleId, moduleName, i, null)
            moduleCount++
          }
        }
      }
      console.log(`Migrated ${moduleCount} page modules`)
    }
    
    db.exec('COMMIT')
    console.log('Data migration completed successfully!')
    
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('Migration failed:', error)
    throw error
  } finally {
    db.close()
  }
}

export function exportToJson(): void {
  const db = getDatabase()
  const exportDir = path.join(process.cwd(), 'database', 'backup')
  
  try {
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true })
    }
    
    console.log('Starting data export from SQLite to JSON...')
    
    const accounts = db.prepare('SELECT * FROM accounts').all() as any[]
    const accountsData = accounts.map(acc => ({
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
    fs.writeFileSync(
      path.join(exportDir, 'system-account.json'),
      JSON.stringify(accountsData, null, 2)
    )
    console.log(`Exported ${accounts.length} accounts`)
    
    const feishuConfig = db.prepare("SELECT config_value FROM system_config WHERE config_key = 'feishu_app'").get() as any
    if (feishuConfig) {
      fs.writeFileSync(
        path.join(exportDir, 'system-feishu-app.json'),
        feishuConfig.config_value
      )
      console.log('Exported feishu_app config')
    }
    
    const tokenConfig = db.prepare("SELECT config_value FROM system_config WHERE config_key = 'super_admin_token'").get() as any
    if (tokenConfig) {
      fs.writeFileSync(
        path.join(exportDir, 'system-token.json'),
        JSON.stringify({ superAdminToken: tokenConfig.config_value }, null, 2)
      )
      console.log('Exported super_admin_token config')
    }
    
    const logs = db.prepare('SELECT * FROM system_logs ORDER BY id DESC').all() as any[]
    const logsData = logs.map(log => ({
      id: log.log_id,
      username: log.username,
      type: log.type,
      description: log.description,
      ip: log.ip,
      timestamp: log.timestamp,
      details: log.details ? JSON.parse(log.details) : null
    }))
    fs.writeFileSync(
      path.join(exportDir, 'system-logs.json'),
      JSON.stringify(logsData, null, 2)
    )
    console.log(`Exported ${logs.length} system logs`)
    
    const siteConfigRaw = db.prepare("SELECT config_value FROM system_config WHERE config_key = 'site_config'").get() as any
    let siteConfigData: any = {}
    let currentTheme = 'modern'
    
    if (siteConfigRaw) {
      try {
        siteConfigData = JSON.parse(siteConfigRaw.config_value)
        currentTheme = siteConfigData.currentTheme || 'modern'
      } catch {
        siteConfigData = {}
      }
    }
    
    fs.writeFileSync(
      path.join(exportDir, 'site-config.json'),
      JSON.stringify(siteConfigData, null, 2)
    )
    console.log('Exported site config')
    
    const themes = db.prepare('SELECT * FROM theme_config').all() as any[]
    
    if (themes.length > 0) {
      const themesMap: Record<string, any> = {}
      themes.forEach(theme => {
        themesMap[theme.theme_id] = JSON.parse(theme.theme_config)
      })
      
      const themeData = {
        currentTheme,
        themes: themesMap
      }
      fs.writeFileSync(
        path.join(exportDir, 'theme-config.json'),
        JSON.stringify(themeData, null, 2)
      )
      console.log('Exported theme config')
    }
    
    const pages = db.prepare('SELECT * FROM pages').all() as any[]
    const pageModules = db.prepare('SELECT * FROM page_modules ORDER BY module_order').all() as any[]
    
    const pagesData: any[] = pages.map(page => {
      const pageModuleInstances = pageModules.filter(pm => pm.page_id === page.page_id)
      const moduleInstanceIds = pageModuleInstances.map(pm => pm.module_instance_id)
      
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
    const pageListData = {
      pages: pagesData,
      systemPages,
      dynamicRoutePattern: '[param]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    fs.writeFileSync(
      path.join(exportDir, 'page-list.json'),
      JSON.stringify(pageListData, null, 2)
    )
    console.log(`Exported ${pages.length} pages`)
    
    const moduleDataDir = path.join(exportDir, 'page-data')
    if (!fs.existsSync(moduleDataDir)) {
      fs.mkdirSync(moduleDataDir, { recursive: true })
    }
    
    const moduleRegistry = db.prepare('SELECT * FROM module_registry').all() as any[]
    for (const module of moduleRegistry) {
      const fileName = `data-${module.module_id}.json`
      fs.writeFileSync(
        path.join(moduleDataDir, fileName),
        module.default_data
      )
    }
    console.log(`Exported ${moduleRegistry.length} module data files`)
    
    console.log('Data export completed successfully!')
    console.log(`Backup saved to: ${exportDir}`)
    
  } finally {
    db.close()
  }
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (command === 'migrate') {
    const useTemplates = args.includes('--templates')
    migrateFromJson(useTemplates)
  } else if (command === 'export') {
    exportToJson()
  } else {
    console.log('Usage:')
    console.log('  ts-node lib/migrate.ts migrate          - Migrate from runtime JSON files')
    console.log('  ts-node lib/migrate.ts migrate --templates - Migrate from template JSON files')
    console.log('  ts-node lib/migrate.ts export           - Export to JSON backup')
  }
}
