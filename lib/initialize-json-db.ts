import { jsonDb } from './json-database'
import fs from 'fs'
import path from 'path'

export function initializeJsonDb() {
  initializeThemeData()
  
  initializeSystemConfig()
  
  initializeModuleRegistry()
}

function initializeThemeData() {
  const themes = jsonDb.getAll('theme_config')
  if (themes.length === 0) {
    const themeConfigPath = path.join(process.cwd(), 'database', 'tpl', 'theme_config.json')
    
    if (fs.existsSync(themeConfigPath)) {
      try {
        const themeList = JSON.parse(fs.readFileSync(themeConfigPath, 'utf-8'))
        
        if (Array.isArray(themeList)) {
          for (const theme of themeList) {
            jsonDb.insert('theme_config', {
              theme_id: theme.theme_id,
              theme_name: theme.theme_name,
              theme_setting: theme.theme_setting,
              is_current: theme.is_current,
              created_at: theme.created_at,
              updated_at: theme.updated_at
            })
          }
        }
      } catch (error) {
        console.error('Error initializing theme data:', error)
      }
    } else {
      console.error('Theme template file not found at:', themeConfigPath)
    }
  }
}

function initializeSystemConfig() {
  const systemConfigs = jsonDb.getAll('system_config')
  if (systemConfigs.length === 0) {
    // 创建默认站点配置
    jsonDb.insert('system_config', {
      config_key: 'site_config',
      config_value: JSON.stringify({
        name: '',
        description: 'AI 产品管理系统',
        url: '',
        currentTheme: 'modern'
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }
}

function initializeModuleRegistry() {
  const modules = jsonDb.getAll('module_registry')
  if (modules.length === 0) {
    const defaultModules = [
      {
        module_id: 'section-hero',
        module_name: 'Hero 区域',
        default_data: JSON.stringify({
          title: '欢迎使用 AI OPC Product',
          subtitle: '智能产品管理系统',
          buttonText: '了解更多',
          buttonLink: '#',
          backgroundImage: ''
        })
      },
      {
        module_id: 'section-about',
        module_name: '关于我们',
        default_data: JSON.stringify({
          title: '关于我们',
          content: '我们是一家专注于 AI 产品开发的公司',
          image: ''
        })
      }
    ]
    
    for (const module of defaultModules) {
      jsonDb.insert('module_registry', {
        module_id: module.module_id,
        module_name: module.module_name,
        default_data: module.default_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }
}

if (require.main === module) {
  initializeJsonDb()
}