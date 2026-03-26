import fs from 'fs'
import path from 'path'
import type { ModuleData, ModuleRegistration } from '@/modules/types'
import { readConfig, writeConfig, getRuntimePath, getTemplatePath } from './config-manager'

interface PageModuleConfig {
  id: string
  name: string
  visible: boolean
  order: number
  moduleInstanceId?: string
  moduleId?: string
  [key: string]: unknown
}

interface PageConfig {
  layout?: string
  sections?: PageModuleConfig[]
  modules?: string[]
  [key: string]: unknown
}

function loadJsonFile(filePath: string): Record<string, unknown> | null {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error(`Error loading file ${filePath}:`, error)
  }
  return null
}

function saveJsonFile(filePath: string, data: Record<string, unknown>): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`Error saving file ${filePath}:`, error)
    return false
  }
}

export function getPageConfig(pageId: string): PageConfig | null {
  const configType = `page-${pageId}`
  const config = readConfig(configType)
  
  if (config && Object.keys(config).length > 0) {
    return config as PageConfig
  }

  return null
}

export function getPageModules(pageId: string): ModuleData[] {
  const pageConfig = getPageConfig(pageId)
  
  if (!pageConfig) {
    return []
  }

  if (pageConfig.modules && Array.isArray(pageConfig.modules)) {
    const moduleInstanceIdMap: Record<string, string> = {}
    
    return pageConfig.modules.map((moduleId: string) => {
      const moduleInstanceId = moduleInstanceIdMap[moduleId] || 
        `${moduleId}-${Date.now()}`
      
      moduleInstanceIdMap[moduleId] = moduleInstanceId

      return {
        moduleName: moduleId,
        moduleId: moduleId,
        moduleInstanceId,
        data: readConfig(moduleId) || {}
      }
    })
  }

  if (pageConfig.sections && Array.isArray(pageConfig.sections)) {
    const visibleSections = pageConfig.sections
      .filter((s: PageModuleConfig) => s.visible !== false)
      .sort((a: PageModuleConfig, b: PageModuleConfig) => (a.order || 0) - (b.order || 0))

    const moduleInstanceIdMap: Record<string, string> = {}
    
    return visibleSections.map((section: PageModuleConfig) => {
      const moduleInstanceId = section.moduleInstanceId || 
        moduleInstanceIdMap[section.id] || 
        `${section.id}-${Date.now()}`
      
      moduleInstanceIdMap[section.id] = moduleInstanceId

      return {
        moduleName: section.name || section.id,
        moduleId: section.moduleId || section.id,
        moduleInstanceId,
        data: readConfig(section.moduleId || section.id) || {}
      }
    })
  }

  return []
}

export function getModuleInstanceData(moduleInstanceId: string): Record<string, unknown> | null {
  const parts = moduleInstanceId.split('-')
  const moduleId = parts[0]
  
  return readConfig(moduleId)
}

export function getModuleData(moduleId: string): ModuleData | null {
  const data = getModuleInstanceData(moduleId)
  
  if (!data) {
    return null
  }

  return {
    moduleName: (data.moduleName as string) || moduleId,
    moduleId: (data.moduleId as string) || moduleId,
    moduleInstanceId: `${moduleId}-${Date.now()}`,
    data
  }
}

export function updateModuleInstanceData(
  moduleInstanceId: string, 
  data: Record<string, unknown>
): boolean {
  const parts = moduleInstanceId.split('-')
  const moduleId = parts[0]
  
  writeConfig(moduleId, data)
  return true
}

export function updatePageModules(pageId: string, modules: ModuleData[]): boolean {
  const configType = `page-${pageId}`
  const pageConfig = readConfig(configType)
  
  if (!pageConfig) {
    return false
  }

  const sections = modules.map((module, index) => ({
    id: module.moduleId,
    name: module.moduleName,
    visible: true,
    order: index + 1,
    moduleInstanceId: module.moduleInstanceId,
    moduleId: module.moduleId
  }))

  const moduleIds = modules.map((module) => module.moduleId)

  const updatedConfig = {
    ...pageConfig,
    sections,
    modules: moduleIds
  }

  writeConfig(configType, updatedConfig)
  return true
}

export function getModuleTemplate(moduleId: string): ModuleRegistration | null {
  const template = readConfig(moduleId)
  
  if (template) {
    return {
      moduleName: (template.moduleName as string) || moduleId,
      moduleId: (template.moduleId as string) || moduleId,
      component: null as any,
      schema: (template.schema as Record<string, unknown>) || {},
      defaultData: (template.defaultData as Record<string, unknown>) || template
    }
  }

  return null
}

export function getAllAvailableModules(): string[] {
  const modules = new Set<string>()
  
  try {
    const pageDataDir = path.join(process.cwd(), 'database', 'templates', 'page-data')
    if (fs.existsSync(pageDataDir)) {
      const templateFiles = fs.readdirSync(pageDataDir)
      templateFiles.forEach(file => {
        if (file.endsWith('.json') && file.startsWith('data-')) {
          const moduleId = file.replace('.json', '').replace('data-', '')
          modules.add(moduleId)
        }
      })
    }
  } catch (error) {
    console.error('Error getting available modules:', error)
  }

  return Array.from(modules)
}
