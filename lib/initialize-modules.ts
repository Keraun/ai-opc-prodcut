import "server-only"
import { initializeModules } from '@/modules/init'
import { getAllModules } from '@/modules/registry'
import { syncAllModulesToDatabase } from './module-sync'

export function initializeAndSyncModules(): void {
  console.log('🔄 Initializing and syncing modules to database...')
  
  initializeModules()
  
  const modules = getAllModules()
  console.log(`📦 Found ${modules.length} modules`)
  
  const successCount = syncAllModulesToDatabase(modules)
  
  console.log(`✅ Successfully synced ${successCount}/${modules.length} modules to database`)
}
