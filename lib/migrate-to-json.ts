import { getDatabase } from './database.ts'
import { jsonDb } from './json-database.ts'
import fs from 'fs'
import path from 'path'

export async function migrateToJson() {
  console.log('Starting migration from SQLite to JSON...')
  
  const db = getDatabase()
  
  try {
    // Migrate accounts
    console.log('Migrating accounts...')
    const accounts = db.prepare('SELECT * FROM accounts').all()
    jsonDb.importData('accounts', accounts)
    console.log(`Migrated ${accounts.length} accounts`)
    
    // Migrate system_config
    console.log('Migrating system_config...')
    const systemConfig = db.prepare('SELECT * FROM system_config').all()
    jsonDb.importData('system_config', systemConfig)
    console.log(`Migrated ${systemConfig.length} system configs`)
    
    // Migrate system_logs
    console.log('Migrating system_logs...')
    const systemLogs = db.prepare('SELECT * FROM system_logs').all()
    jsonDb.importData('system_logs', systemLogs)
    console.log(`Migrated ${systemLogs.length} system logs`)
    
    // Migrate theme_config
    console.log('Migrating theme_config...')
    const themeConfig = db.prepare('SELECT * FROM theme_config').all()
    jsonDb.importData('theme_config', themeConfig)
    console.log(`Migrated ${themeConfig.length} theme configs`)
    
    // Migrate pages
    console.log('Migrating pages...')
    const pages = db.prepare('SELECT * FROM pages').all()
    jsonDb.importData('pages', pages)
    console.log(`Migrated ${pages.length} pages`)
    
    // Migrate module_registry
    console.log('Migrating module_registry...')
    const moduleRegistry = db.prepare('SELECT * FROM module_registry').all()
    jsonDb.importData('module_registry', moduleRegistry)
    console.log(`Migrated ${moduleRegistry.length} module registries`)
    
    // Migrate page_modules
    console.log('Migrating page_modules...')
    const pageModules = db.prepare('SELECT * FROM page_modules').all()
    jsonDb.importData('page_modules', pageModules)
    console.log(`Migrated ${pageModules.length} page modules`)
    
    console.log('Migration completed successfully!')
    
    // Create backup of original database
    const backupDir = path.join(process.cwd(), 'database', 'backup')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const backupPath = path.join(backupDir, `sqlite-backup-${Date.now()}.db`)
    const originalDbPath = path.join(process.cwd(), 'database', 'app.db')
    
    if (fs.existsSync(originalDbPath)) {
      fs.copyFileSync(originalDbPath, backupPath)
      console.log(`Created backup of SQLite database at: ${backupPath}`)
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    db.close()
  }
}

if (require.main === module) {
  migrateToJson()
}