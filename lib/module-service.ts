import fs from 'fs'
import path from 'path'
import type { ModuleData, ModuleRegistration } from '@/modules/types'

const CONFIG_PATH = path.join(process.cwd(), 'config/json/runtime')
const TEMPLATE_PATH = path.join(process.cwd(), 'config/json/templates')

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
  modules?: ModuleData[]
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
  const pageConfigFiles = [
    `${pageId}Order.json`,
    `${pageId}.json`,
    `page-${pageId}.json`
  ]

  for (const fileName of pageConfigFiles) {
    const filePath = path.join(CONFIG_PATH, fileName)
    const config = loadJsonFile(filePath)
    
    if (config) {
      return config as PageConfig
    }
  }

  return null
}

export function getPageModules(pageId: string): ModuleData[] {
  const pageConfig = getPageConfig(pageId)
  
  if (!pageConfig) {
    return []
  }

  if (pageConfig.modules && Array.isArray(pageConfig.modules)) {
    return pageConfig.modules
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
        data: getModuleInstanceData(moduleInstanceId) || {}
      }
    })
  }

  return []
}

export function getModuleInstanceData(moduleInstanceId: string): Record<string, unknown> | null {
  const parts = moduleInstanceId.split('-')
  const moduleId = parts[0]
  
  const dataFiles = [
    `${moduleInstanceId}.json`,
    `${moduleId}.json`,
    `site-${moduleId}.json`,
    `page-${moduleId}.json`,
    `home-${moduleId}.json`
  ]

  for (const fileName of dataFiles) {
    const filePath = path.join(CONFIG_PATH, fileName)
    const data = loadJsonFile(filePath)
    
    if (data) {
      return data
    }
  }

  return null
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
  
  const existingFiles = [
    { path: path.join(CONFIG_PATH, `${moduleInstanceId}.json`), name: `${moduleInstanceId}.json` },
    { path: path.join(CONFIG_PATH, `${moduleId}.json`), name: `${moduleId}.json` },
    { path: path.join(CONFIG_PATH, `site-${moduleId}.json`), name: `site-${moduleId}.json` },
    { path: path.join(CONFIG_PATH, `page-${moduleId}.json`), name: `page-${moduleId}.json` },
    { path: path.join(CONFIG_PATH, `home-${moduleId}.json`), name: `home-${moduleId}.json` }
  ]

  for (const { path: filePath } of existingFiles) {
    if (fs.existsSync(filePath)) {
      const existingData = loadJsonFile(filePath)
      if (existingData) {
        const updatedData = { ...existingData, ...data }
        return saveJsonFile(filePath, updatedData)
      }
    }
  }

  const newFilePath = path.join(CONFIG_PATH, `${moduleInstanceId}.json`)
  return saveJsonFile(newFilePath, data)
}

export function updatePageModules(pageId: string, modules: ModuleData[]): boolean {
  const pageConfig = getPageConfig(pageId)
  
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

  const updatedConfig = {
    ...pageConfig,
    sections,
    modules
  }

  const pageConfigFiles = [
    `${pageId}Order.json`,
    `${pageId}.json`,
    `page-${pageId}.json`
  ]

  for (const fileName of pageConfigFiles) {
    const filePath = path.join(CONFIG_PATH, fileName)
    if (fs.existsSync(filePath)) {
      return saveJsonFile(filePath, updatedConfig)
    }
  }

  const newFilePath = path.join(CONFIG_PATH, `${pageId}Order.json`)
  return saveJsonFile(newFilePath, updatedConfig)
}

export function getModuleTemplate(moduleId: string): ModuleRegistration | null {
  const templateFiles = [
    `${moduleId}.json`,
    `site-${moduleId}.json`,
    `page-${moduleId}.json`
  ]

  for (const fileName of templateFiles) {
    const filePath = path.join(TEMPLATE_PATH, fileName)
    const template = loadJsonFile(filePath)
    
    if (template) {
      return {
        moduleName: (template.moduleName as string) || moduleId,
        moduleId: (template.moduleId as string) || moduleId,
        component: null as any,
        schema: (template.schema as Record<string, unknown>) || {},
        defaultData: (template.defaultData as Record<string, unknown>) || template
      }
    }
  }

  return null
}

export function getAllAvailableModules(): string[] {
  const modules = new Set<string>()
  
  try {
    const runtimeFiles = fs.readdirSync(CONFIG_PATH)
    runtimeFiles.forEach(file => {
      if (file.endsWith('.json') && !file.includes('Order')) {
        const moduleId = file.replace('.json', '').replace(/^(site-|page-|home-)/, '')
        modules.add(moduleId)
      }
    })

    const templateFiles = fs.readdirSync(TEMPLATE_PATH)
    templateFiles.forEach(file => {
      if (file.endsWith('.json')) {
        const moduleId = file.replace('.json', '').replace(/^(site-|page-|home-)/, '')
        modules.add(moduleId)
      }
    })
  } catch (error) {
    console.error('Error getting available modules:', error)
  }

  return Array.from(modules)
}
