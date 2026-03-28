import { jsonDb } from './json-database'
import fs from 'fs'
import path from 'path'

export function initializeJsonDb() {
  console.log('Initializing JSON database...')
  
  // 初始化主题数据
  initializeThemeData()
  
  // 初始化系统配置
  initializeSystemConfig()
  
  // 初始化模块注册表
  initializeModuleRegistry()
  
  console.log('JSON database initialized successfully!')
}

function initializeThemeData() {
  const themes = jsonDb.getAll('theme_config')
  if (themes.length === 0) {
    console.log('Initializing theme data...')
    
    const themeConfigPath = path.join(process.cwd(), 'database', 'templates', 'theme', 'theme-config.json')
    
    if (fs.existsSync(themeConfigPath)) {
      try {
        const themeConfigData = JSON.parse(fs.readFileSync(themeConfigPath, 'utf-8'))
        
        if (themeConfigData?.themes) {
          const currentThemeId = themeConfigData.currentTheme || 'modern'
          
          for (const [themeId, themeData] of Object.entries(themeConfigData.themes)) {
            const theme = themeData as any
            jsonDb.insert('theme_config', {
              theme_id: themeId,
              theme_name: theme.name || themeId,
              theme_config: JSON.stringify(theme),
              is_current: themeId === currentThemeId ? 1 : 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
          console.log(`Initialized ${Object.keys(themeConfigData.themes).length} themes`)
        }
      } catch (error) {
        console.error('Error initializing theme data:', error)
      }
    } else {
      console.log('Theme template file not found, creating default themes...')
      
      const defaultThemes = {
        modern: {
          name: '现代简约',
          colors: {
            primary: '#1e40af',
            secondary: '#3b82f6',
            accent: '#06b6d4'
          }
        },
        tech: {
          name: '科技蓝紫',
          colors: {
            primary: '#7c3aed',
            secondary: '#a78bfa',
            accent: '#ec4899'
          }
        },
        nature: {
          name: '自然清新',
          colors: {
            primary: '#10b981',
            secondary: '#34d399',
            accent: '#14b8a6'
          }
        },
        dark: {
          name: '深邃暗夜',
          colors: {
            primary: '#3b82f6',
            secondary: '#60a5fa',
            accent: '#22d3ee'
          }
        },
        luxury: {
          name: '奢华金棕',
          colors: {
            primary: '#b45309',
            secondary: '#d97706',
            accent: '#f59e0b'
          }
        },
        minimal: {
          name: '极简灰调',
          colors: {
            primary: '#374151',
            secondary: '#6b7280',
            accent: '#9ca3af'
          }
        }
      }
      
      for (const [themeId, themeData] of Object.entries(defaultThemes)) {
        const theme = themeData as any
        jsonDb.insert('theme_config', {
          theme_id: themeId,
          theme_name: theme.name || themeId,
          theme_config: JSON.stringify(theme),
          is_current: themeId === 'modern' ? 1 : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      console.log('Created default theme')
    }
  }
}

function initializeSystemConfig() {
  const systemConfigs = jsonDb.getAll('system_config')
  if (systemConfigs.length === 0) {
    console.log('Initializing system config...')
    
    // 创建默认站点配置
    jsonDb.insert('system_config', {
      config_key: 'site_config',
      config_value: JSON.stringify({
        name: 'AI OPC Product',
        description: 'AI 产品管理系统',
        url: 'http://localhost:3000',
        currentTheme: 'modern'
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    console.log('Initialized system config')
  }
}

function initializeModuleRegistry() {
  const modules = jsonDb.getAll('module_registry')
  if (modules.length === 0) {
    console.log('Initializing module registry...')
    
    // 创建默认模块
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
    
    console.log('Initialized module registry')
  }
}

if (require.main === module) {
  initializeJsonDb()
}