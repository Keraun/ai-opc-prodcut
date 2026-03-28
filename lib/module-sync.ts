import "server-only"
import type { ModuleRegistration } from '@/modules/types'
import { ModuleRegistryRepository } from './repositories/ModuleRegistryRepository'

const moduleRegistryRepo = new ModuleRegistryRepository()

export function syncModuleToDatabase(module: ModuleRegistration): boolean {
  try {
    moduleRegistryRepo.registerModule(
      module.moduleId,
      module.moduleName,
      module.schema || null,
      module.defaultData || {}
    )
    return true
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
