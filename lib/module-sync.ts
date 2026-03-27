import "server-only"
import type { ModuleRegistration } from '@/modules/types'
import { registerModule as registerModuleToDb } from './module-service'

export function syncModuleToDatabase(module: ModuleRegistration): boolean {
  try {
    return registerModuleToDb(
      module.moduleId,
      module.moduleName,
      module.schema || null,
      module.defaultData || {}
    )
  } catch (error) {
    console.error('Failed to sync module to database:', error)
    return false
  }
}

export function syncAllModulesToDatabase(modules: ModuleRegistration[]): number {
  let successCount = 0
  
  for (const module of modules) {
    if (syncModuleToDatabase(module)) {
      successCount++
    }
  }
  
  console.log(`Synced ${successCount}/${modules.length} modules to database`)
  return successCount
}
