import "server-only"
import { getJsonDb } from './json-database'
import fs from 'fs'
import path from 'path'

// 每次操作数据库时都获取最新的实例
const jsonDb = getJsonDb()

export function clearCache(): void {
   jsonDb.reload()
}


export function getRuntimePath(configType: string): string {
  return path.join(process.cwd(), 'data', configType + '.json')
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

    'verification-codes': { dir: 'system', prefix: 'system-verification-codes' },
    'llm-cookies': { dir: 'system', prefix: 'system-llm-cookies' },
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
  // 无论在开发环境还是生产环境，都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  
  try {
    if (configType === 'account') {
      const accounts = jsonDb.getAll('accounts')
      return accounts.map((acc: any) => ({
        username: acc.username,
        password: acc.password,
        email: acc.email,
        remark: acc.remark,
        role: acc.role || 'operator',
        isSuperAdmin: Boolean(acc.isSuperAdmin),
        mustChangePassword: Boolean(acc.must_change_password),
        lastLoginTime: acc.last_login_time,
        lastLoginIP: acc.last_login_ip,
        currentLoginIP: acc.current_login_ip,
        currentLoginTime: acc.current_login_time
      }))
    }
    
    if (configType === 'notification') {
      const config = jsonDb.findOne('system_config', { config_key: 'notification' })
      return config ? JSON.parse(config.config_value) : {}
    }
    
    if (configType === 'verificationCodes') {
      const codes = jsonDb.getAll('verification_codes')
      const result: Record<string, { code: string; expiresAt: number }> = {}
      for (const item of codes) {
        result[item.email] = {
          code: item.code,
          expiresAt: item.expires_at
        }
      }
      return result
    }
    


    
    if (configType === 'site' || configType === 'site-seo') {
      const config = jsonDb.findOne('system_config', { config_key: 'site_config' })
      if (config) {
        try {
          return JSON.parse(config.config_value)
        } catch {
          return {}
        }
      }
      return {}
    }
    
    if (configType === 'site-root') {
      const config = jsonDb.findOne('system_config', { config_key: 'site_config' })
      if (config) {
        try {
          return JSON.parse(config.config_value)
        } catch {
          return {}
        }
      }
      const module = jsonDb.findOne('module_registry', { module_id: 'site-root' })
      if (module) {
        try {
          return JSON.parse(module.default_data)
        } catch {
          return {}
        }
      }
      return {}
    }
    
    if (configType === 'site-footer') {
      const config = jsonDb.findOne('system_config', { config_key: 'site_footer_config' })
      if (config) {
        try {
          return JSON.parse(config.config_value)
        } catch {
          return {}
        }
      }
      const module = jsonDb.findOne('module_registry', { module_id: 'site-footer' })
      if (module) {
        try {
          return JSON.parse(module.default_data)
        } catch {
          return {}
        }
      }
      return {}
    }
    
    if (configType === 'site-header') {
      const config = jsonDb.findOne('system_config', { config_key: 'site_header_config' })
      if (config) {
        try {
          return JSON.parse(config.config_value)
        } catch {
          return {}
        }
      }
      const module = jsonDb.findOne('module_registry', { module_id: 'site-header' })
      if (module) {
        try {
          return JSON.parse(module.default_data)
        } catch {
          return {}
        }
      }
      return {}
    }
    
    if (configType === 'theme') {
      const themes = jsonDb.getAll('theme_config')
      
      let currentTheme = 'modern'
      const themesMap: Record<string, any> = {}
      
      themes.forEach((theme: any) => {
        themesMap[theme.theme_id] = {
          ...JSON.parse(theme.theme_setting),
          themeName: theme.theme_name
        }
        if (theme.is_current === 1) {
          currentTheme = theme.theme_id
        }
      })
      
      return {
        currentTheme,
        themes: themesMap
      }
    }
    
    if (configType === 'product-categories') {
      const config = jsonDb.findOne('system_config', { config_key: 'product_categories' })
      if (config) {
        try {
          return JSON.parse(config.config_value)
        } catch {
          return [
            { value: "ai-tools", label: "AI工具" },
            { value: "courses", label: "课程" },
            { value: "services", label: "服务" },
            { value: "other", label: "其他" }
          ]
        }
      }
      return [
        { value: "ai-tools", label: "AI工具" },
        { value: "courses", label: "课程" },
        { value: "services", label: "服务" },
        { value: "other", label: "其他" }
      ]
    }

    if (configType === 'page-list') {
      const pages = jsonDb.getAll('pages')
      
      const pagesData = pages.map((page: any) => {
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
      
      const systemPages = pages.filter((p: any) => p.is_system === 1).map((p: any) => p.page_id)
      
      return {
        pages: pagesData,
        systemPages,
        dynamicRoutePattern: '[param]',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    
    const module = jsonDb.findOne('module_registry', { module_id: configType })
    if (module) {
      return JSON.parse(module.default_data)
    }
    
    return {}
    
  } catch (error) {
    console.error('Error reading config:', error)
    return {}
  }
}

export function writeConfig(configType: string, data: any): void {
  try {
    if (configType === 'account') {
      jsonDb.clearTable('accounts')
      
      for (const account of data) {
        jsonDb.insert('accounts', {
          username: account.username,
          password: account.password,
          email: account.email || null,
          remark: account.remark || null,
          role: account.role || 'operator',
          isSuperAdmin: Boolean(account.isSuperAdmin),
          must_change_password: Boolean(account.mustChangePassword),
          last_login_time: account.lastLoginTime || null,
          last_login_ip: account.lastLoginIP || null,
          current_login_ip: account.currentLoginIP || null,
          current_login_time: account.currentLoginTime || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      return
    }
    
    if (configType === 'notification') {
      const existing = jsonDb.findOne('system_config', { config_key: 'notification' })
      if (existing) {
        jsonDb.update('system_config', existing.id, {
          config_value: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
      } else {
        jsonDb.insert('system_config', {
          config_key: 'notification',
          config_value: JSON.stringify(data),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      return
    }
    
    if (configType === 'verificationCodes') {
      jsonDb.clearTable('verification_codes')
      
      for (const [email, codeData] of Object.entries(data)) {
        const { code, expiresAt } = codeData as any
        jsonDb.insert('verification_codes', {
          email,
          code,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      return
    }
    


    
    if (configType === 'site' || configType === 'site-seo') {
      const existing = jsonDb.findOne('system_config', { config_key: 'site_config' })
      if (existing) {
        jsonDb.update('system_config', existing.id, {
          config_value: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
      } else {
        jsonDb.insert('system_config', {
          config_key: 'site_config',
          config_value: JSON.stringify(data),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      return
    }
    
    if (configType === 'site-root') {
      const existingSiteConfig = jsonDb.findOne('system_config', { config_key: 'site_config' })
      if (existingSiteConfig) {
        jsonDb.update('system_config', existingSiteConfig.id, {
          config_value: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
      } else {
        jsonDb.insert('system_config', {
          config_key: 'site_config',
          config_value: JSON.stringify(data),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
      const existingSiteRoot = jsonDb.findOne('module_registry', { module_id: 'site-root' })
      if (existingSiteRoot) {
        jsonDb.update('module_registry', existingSiteRoot.id, {
          default_data: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
      }
      
      const siteRootDefaultPath = path.join(process.cwd(), 'modules', 'site-root', 'default.json')
      try {
        fs.writeFileSync(siteRootDefaultPath, JSON.stringify(data, null, 2), 'utf-8')
      } catch (e) {
        console.error('Error writing site-root default.json:', e)
      }
      
      const siteRootPageModules = jsonDb.find('page_modules', { module_id: 'site-root' })
      for (const pm of siteRootPageModules) {
        jsonDb.update('page_modules', pm.id, {
          data: null,
          updated_at: new Date().toISOString()
        })
      }
      
      const existingSiteFooter = jsonDb.findOne('module_registry', { module_id: 'site-footer' })
      if (existingSiteFooter) {
        try {
          const footerData = JSON.parse(existingSiteFooter.default_data)
          footerData.description = data.description || footerData.description
          footerData.address = data.contact?.address || footerData.address
          footerData.phone = data.contact?.phone || footerData.phone
          footerData.email = data.contact?.email || footerData.email
          
          jsonDb.update('module_registry', existingSiteFooter.id, {
            default_data: JSON.stringify(footerData),
            updated_at: new Date().toISOString()
          })
        } catch (e) {
          console.error('Error updating site-footer:', e)
        }
      }
      
      return
    }
    
    if (configType === 'site-footer') {
      const existing = jsonDb.findOne('system_config', { config_key: 'site_footer_config' })
      if (existing) {
        jsonDb.update('system_config', existing.id, {
          config_value: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
      } else {
        jsonDb.insert('system_config', {
          config_key: 'site_footer_config',
          config_value: JSON.stringify(data),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
      const existingSiteFooter = jsonDb.findOne('module_registry', { module_id: 'site-footer' })
      if (existingSiteFooter) {
        jsonDb.update('module_registry', existingSiteFooter.id, {
          default_data: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
      }
      
      const siteFooterDefaultPath = path.join(process.cwd(), 'modules', 'site-footer', 'default.json')
      try {
        fs.writeFileSync(siteFooterDefaultPath, JSON.stringify(data, null, 2), 'utf-8')
      } catch (e) {
        console.error('Error writing site-footer default.json:', e)
      }
      
      const siteFooterPageModules = jsonDb.find('page_modules', { module_id: 'site-footer' })
      for (const pm of siteFooterPageModules) {
        jsonDb.update('page_modules', pm.id, {
          data: null,
          updated_at: new Date().toISOString()
        })
      }
      
      return
    }
    
    if (configType === 'site-header') {
      const existing = jsonDb.findOne('system_config', { config_key: 'site_header_config' })
      if (existing) {
        jsonDb.update('system_config', existing.id, {
          config_value: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
      } else {
        jsonDb.insert('system_config', {
          config_key: 'site_header_config',
          config_value: JSON.stringify(data),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
      const existingSiteHeader = jsonDb.findOne('module_registry', { module_id: 'site-header' })
      if (existingSiteHeader) {
        jsonDb.update('module_registry', existingSiteHeader.id, {
          default_data: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
      }
      
      const siteHeaderDefaultPath = path.join(process.cwd(), 'modules', 'site-header', 'default.json')
      try {
        fs.writeFileSync(siteHeaderDefaultPath, JSON.stringify(data, null, 2), 'utf-8')
      } catch (e) {
        console.error('Error writing site-header default.json:', e)
      }
      
      const siteHeaderPageModules = jsonDb.find('page_modules', { module_id: 'site-header' })
      for (const pm of siteHeaderPageModules) {
        jsonDb.update('page_modules', pm.id, {
          data: null,
          updated_at: new Date().toISOString()
        })
      }
      
      return
    }
    
    if (configType === 'product-categories') {
      const existing = jsonDb.findOne('system_config', { config_key: 'product_categories' })
      if (existing) {
        jsonDb.update('system_config', existing.id, {
          config_value: JSON.stringify(data),
          updated_at: new Date().toISOString()
        })
      } else {
        jsonDb.insert('system_config', {
          config_key: 'product_categories',
          config_value: JSON.stringify(data),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      return
    }

    if (configType === 'theme') {
      if (data.currentTheme) {
        const themes = jsonDb.getAll('theme_config')
        themes.forEach((theme: any) => {
          jsonDb.update('theme_config', theme.id, { 
            is_current: theme.theme_id === data.currentTheme ? 1 : 0,
            updated_at: new Date().toISOString()
          })
        })
      }
      
      if (data.themes) {
        const currentThemeId = data.currentTheme
        
        for (const [themeId, themeData] of Object.entries(data.themes)) {
          const theme = themeData as any
          const existingTheme = jsonDb.findOne('theme_config', { theme_id: themeId })
          
          const themeName = theme.themeName || theme.name || themeId
          const { themeName: _, name: __, ...settingData } = theme
          
          if (existingTheme) {
            jsonDb.update('theme_config', existingTheme.id, {
              theme_name: themeName,
              theme_setting: JSON.stringify(settingData),
              is_current: themeId === currentThemeId ? 1 : 0,
              updated_at: new Date().toISOString()
            })
          } else {
            jsonDb.insert('theme_config', {
              theme_id: themeId,
              theme_name: themeName,
              theme_setting: JSON.stringify(settingData),
              is_current: themeId === currentThemeId ? 1 : 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        }
      }
      return
    }
    
    const moduleName = (data.moduleName as string) || configType
    const schema = data.schema ? JSON.stringify(data.schema) : null
    
    const existing = jsonDb.findOne('module_registry', { module_id: configType })
    if (existing) {
      jsonDb.update('module_registry', existing.id, {
        module_name: moduleName,
        schema: schema,
        default_data: JSON.stringify(data),
        updated_at: new Date().toISOString()
      })
    } else {
      jsonDb.insert('module_registry', {
        module_id: configType,
        module_name: moduleName,
        schema: schema,
        default_data: JSON.stringify(data),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('Error writing config:', error)
  }
}

export function deleteConfig(configType: string): boolean {
  try {
    if (configType.startsWith('page-')) {
      const pageId = configType.replace('page-', '')
      
      const page = jsonDb.findOne('pages', { page_id: pageId })
      if (page?.module_instance_ids) {
        const moduleInstanceIds = JSON.parse(page.module_instance_ids)
        for (const instanceId of moduleInstanceIds) {
          jsonDb.delete('page_modules', { module_instance_id: instanceId })
        }
      }
      
      jsonDb.delete('pages', { page_id: pageId })
      return true
    }
    
    const existing = jsonDb.findOne('module_registry', { module_id: configType })
    if (existing) {
      jsonDb.delete('module_registry', existing.id)
      return true
    }
    
    return false
    
  } catch (error) {
    console.error('Error deleting config:', error)
    return false
  }
}

export function readPageData(moduleId: string): any {
  return readConfig(moduleId)
}

export function writePageData(moduleId: string, data: any): void {
  writeConfig(moduleId, data)
}

export function readAllPageData(): Record<string, any> {
  // 无论在开发环境还是生产环境，都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  
  try {
    const modules = jsonDb.getAll('module_registry')
    const result: Record<string, any> = {}
    
    for (const module of modules) {
      result[module.module_id] = JSON.parse(module.default_data)
    }
    
    return result
    
  } catch (error) {
    console.error('Error reading all page data:', error)
    return {}
  }
}

export function readSystemConfig(configName: string): any {
  return readConfig(configName)
}

export function getThemeList(onlyCurrent: boolean = false): any[] {
  // 无论在开发环境还是生产环境，都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  
  try {
    let themes = jsonDb.getAll('theme_config')
    
    if (onlyCurrent) {
      themes = themes.filter((theme: any) => theme.is_current === 1)
    }
    
    return themes.map((theme: any) => ({
      id: theme.id,
      themeId: theme.theme_id,
      themeName: theme.theme_name,
      themeConfig: JSON.parse(theme.theme_setting),
      isCurrent: theme.is_current === 1,
      createdAt: theme.created_at,
      updatedAt: theme.updated_at
    }))
  } catch (error) {
    console.error('Error getting theme list:', error)
    return []
  }
}

export function writeSystemConfig(configName: string, data: any): void {
  writeConfig(configName, data)
}

export function listSystemConfigs(): string[] {
  return ['account', 'token', 'theme', 'notification']
}

export function readAllConfigs(): Record<string, any> {

  
  const configs: Record<string, any> = {}
  
  Object.assign(configs, readAllPageData())
  
  const systemConfigs = listSystemConfigs()
  for (const configName of systemConfigs) {
    configs[configName] = readSystemConfig(configName)
  }
  
  return configs
}


export function initializeDatabaseFromTemplates(): void {

}

export function getPageResponse(pageId: string): any {
  // 无论在开发环境还是生产环境，都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  
  try {
    const page = jsonDb.findOne('pages', { page_id: pageId })
    
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
    
    const pageModules = jsonDb.find('page_modules', { page_id: pageId })
      .sort((a: any, b: any) => a.module_order - b.module_order)
    
    const modules = pageModules.map((pm: any) => pm.module_id)
    
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
      const module = jsonDb.findOne('module_registry', { module_id: pm.module_id })
      
      let moduleData = {}
      
      if (pm.module_id === 'site-root') {
        const siteConfig = jsonDb.findOne('system_config', { config_key: 'site_config' })
        moduleData = siteConfig ? JSON.parse(siteConfig.config_value) : {}
      } else if (pm.module_id === 'site-footer') {
        const footerConfig = jsonDb.findOne('system_config', { config_key: 'site_footer_config' })
        moduleData = footerConfig ? JSON.parse(footerConfig.config_value) : {}
      } else if (pm.module_id === 'site-header') {
        const headerConfig = jsonDb.findOne('system_config', { config_key: 'site_header_config' })
        moduleData = headerConfig ? JSON.parse(headerConfig.config_value) : {}
      } else {
        moduleData = pm.data 
          ? JSON.parse(pm.data) 
          : (module?.default_data ? JSON.parse(module.default_data) : {})
      }
      
      response.data.push({
        moduleId: pm.module_id,
        moduleInstanceId: pm.module_instance_id,
        moduleName: pm.module_name,
        data: moduleData
      })
    }
    
    return response
    
  } catch (error) {
    console.error('Error getting page response:', error)
    return {
      pageName: pageId,
      pageId: pageId,
      modules: [],
      moduleInstanceIds: [],
      data: [],
      common: {
        site: {},
        theme: {}
      }
    }
  }
}

export function getModuleRegistry(): any[] {
  // 无论在开发环境还是生产环境，都重新加载数据，确保获取到最新的数据
  jsonDb.reload()
  
  try {
    const modules = jsonDb.getAll('module_registry')
    
    return modules.map((m: any) => ({
      moduleId: m.module_id,
      moduleName: m.module_name,
      schema: m.schema ? JSON.parse(m.schema) : null,
      defaultData: m.default_data ? JSON.parse(m.default_data) : null
    }))
  } catch (error) {
    console.error('Error getting module registry:', error)
    return []
  }
}

export function registerModule(moduleId: string, moduleName: string, schema: any, defaultData: any): void {
  try {
    const existing = jsonDb.findOne('module_registry', { module_id: moduleId })
    if (existing) {
      jsonDb.update('module_registry', existing.id, {
        module_name: moduleName,
        schema: schema ? JSON.stringify(schema) : null,
        default_data: defaultData ? JSON.stringify(defaultData) : null,
        updated_at: new Date().toISOString()
      })
    } else {
      jsonDb.insert('module_registry', {
        module_id: moduleId,
        module_name: moduleName,
        schema: schema ? JSON.stringify(schema) : null,
        default_data: defaultData ? JSON.stringify(defaultData) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error registering module:', error)
  }
}

export function syncSiteRootToAllPages(data: any): { success: boolean; syncedPages: string[]; message?: string } {
  try {
    const siteRootModules = jsonDb.find('page_modules', { module_id: 'site-root' })
    
    const syncedPages: string[] = []
    
    for (const module of siteRootModules) {
      jsonDb.update('page_modules', module.id, {
        data: JSON.stringify(data),
        updated_at: new Date().toISOString()
      })
      syncedPages.push(module.page_id)
    }
    
    return {
      success: true,
      syncedPages,
      message: `成功同步到 ${syncedPages.length} 个页面`
    }
  } catch (error) {
    console.error('Error syncing site-root to all pages:', error)
    return {
      success: false,
      syncedPages: [],
      message: '同步失败'
    }
  }
}

export function syncSiteFooterToAllPages(data: any): { success: boolean; syncedPages: string[]; message?: string } {
  try {
    const siteFooterModules = jsonDb.find('page_modules', { module_id: 'site-footer' })
    
    const syncedPages: string[] = []
    
    for (const module of siteFooterModules) {
      jsonDb.update('page_modules', module.id, {
        data: JSON.stringify(data),
        updated_at: new Date().toISOString()
      })
      syncedPages.push(module.page_id)
    }
    
    return {
      success: true,
      syncedPages,
      message: `成功同步到 ${syncedPages.length} 个页面`
    }
  } catch (error) {
    console.error('Error syncing site-footer to all pages:', error)
    return {
      success: false,
      syncedPages: [],
      message: '同步失败'
    }
  }
}
