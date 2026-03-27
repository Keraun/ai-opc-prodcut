import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'app.db')

function getDatabase(): Database.Database {
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true })
  }
  
  const db = new Database(DATABASE_PATH)
  db.pragma('journal_mode = WAL')
  
  return db
}

function migrateDatabase(): void {
  const db = getDatabase()
  
  try {
    console.log('开始数据库迁移...')
    
    db.exec('BEGIN TRANSACTION')
    
    console.log('1. 备份现有数据...')
    const existingPages = db.prepare('SELECT * FROM pages').all() as any[]
    const existingModuleRegistry = db.prepare('SELECT * FROM module_registry').all() as any[]
    const existingPageModules = db.prepare('SELECT * FROM page_modules').all() as any[]
    
    console.log(`   - 页面数据: ${existingPages.length} 条`)
    console.log(`   - 模块注册数据: ${existingModuleRegistry.length} 条`)
    console.log(`   - 页面模块数据: ${existingPageModules.length} 条`)
    
    console.log('2. 删除旧表...')
    db.exec('DROP TABLE IF EXISTS pages')
    db.exec('DROP TABLE IF EXISTS module_registry')
    db.exec('DROP TABLE IF EXISTS page_modules')
    
    console.log('3. 创建新表结构...')
    
    db.exec(`
      CREATE TABLE pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        type TEXT DEFAULT 'static',
        description TEXT,
        status TEXT DEFAULT 'draft',
        is_system INTEGER DEFAULT 0,
        is_deletable INTEGER DEFAULT 1,
        route TEXT,
        dynamic_param TEXT,
        module_instance_ids TEXT DEFAULT '[]',
        created_at TEXT,
        updated_at TEXT,
        published_at TEXT
      )
    `)
    
    db.exec(`
      CREATE TABLE module_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id TEXT UNIQUE NOT NULL,
        module_name TEXT NOT NULL,
        schema TEXT,
        default_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    db.exec(`
      CREATE TABLE page_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_instance_id TEXT UNIQUE NOT NULL,
        page_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        module_name TEXT NOT NULL,
        module_order INTEGER NOT NULL,
        data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(page_id) ON DELETE CASCADE
      )
    `)
    
    console.log('4. 创建索引...')
    db.exec('CREATE INDEX IF NOT EXISTS idx_pages_page_id ON pages(page_id)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_module_registry_module_id ON module_registry(module_id)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_page_modules_page_id ON page_modules(page_id)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_page_modules_module_instance_id ON page_modules(module_instance_id)')
    
    console.log('5. 恢复模块注册数据...')
    const insertModuleRegistry = db.prepare(`
      INSERT INTO module_registry (module_id, module_name, schema, default_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    for (const module of existingModuleRegistry) {
      insertModuleRegistry.run(
        module.module_id,
        module.module_name,
        module.schema,
        module.default_data,
        module.created_at,
        module.updated_at
      )
    }
    
    console.log('6. 恢复页面数据并生成模块实例ID...')
    const insertPage = db.prepare(`
      INSERT INTO pages (page_id, name, slug, type, description, status, is_system, is_deletable, route, dynamic_param, module_instance_ids, created_at, updated_at, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const insertPageModule = db.prepare(`
      INSERT INTO page_modules (module_instance_id, page_id, module_id, module_name, module_order, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    for (const page of existingPages) {
      let oldModuleIds: string[] = []
      try {
        oldModuleIds = JSON.parse(page.modules || '[]')
      } catch (e) {
        oldModuleIds = []
      }
      
      const newModuleInstanceIds: string[] = []
      
      for (let i = 0; i < oldModuleIds.length; i++) {
        const moduleId = oldModuleIds[i]
        const timestamp = Date.now() + (i * 1000)
        const moduleInstanceId = `${moduleId}-${timestamp}`
        
        newModuleInstanceIds.push(moduleInstanceId)
      }
      
      insertPage.run(
        page.page_id,
        page.name,
        page.slug,
        page.type,
        page.description,
        page.status,
        page.is_system,
        page.is_deletable,
        page.route,
        page.dynamic_param,
        JSON.stringify(newModuleInstanceIds),
        page.created_at,
        page.updated_at,
        page.published_at
      )
      
      for (let i = 0; i < oldModuleIds.length; i++) {
        const moduleId = oldModuleIds[i]
        const moduleInstanceId = newModuleInstanceIds[i]
        
        const existingModuleData = existingPageModules.find(
          pm => pm.page_id === page.page_id && pm.module_id === moduleId
        )
        
        insertPageModule.run(
          moduleInstanceId,
          page.page_id,
          moduleId,
          moduleId,
          i,
          existingModuleData?.data || null,
          existingModuleData?.created_at || new Date().toISOString(),
          existingModuleData?.updated_at || new Date().toISOString()
        )
      }
    }
    
    db.exec('COMMIT')
    
    console.log('\n=== 迁移完成 ===')
    console.log(`页面总数: ${existingPages.length}`)
    console.log(`模块注册总数: ${existingModuleRegistry.length}`)
    console.log(`页面模块实例总数: ${existingPageModules.length}`)
    
    verifyMigration()
    
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('迁移失败:', error)
    throw error
  } finally {
    db.close()
  }
}

function verifyMigration(): void {
  const db = getDatabase()
  
  try {
    console.log('\n=== 验证迁移结果 ===\n')
    
    const pages = db.prepare('SELECT page_id, name, module_instance_ids FROM pages').all() as any[]
    
    for (const page of pages) {
      const moduleInstanceIds: string[] = JSON.parse(page.module_instance_ids || '[]')
      const dbModules = db.prepare(`
        SELECT module_instance_id, module_id, module_order 
        FROM page_modules 
        WHERE page_id = ? 
        ORDER BY module_order
      `).all(page.page_id) as any[]
      
      const dbInstanceIds = dbModules.map(m => m.module_instance_id)
      
      const isConsistent = 
        moduleInstanceIds.length === dbInstanceIds.length &&
        moduleInstanceIds.every((id, index) => id === dbInstanceIds[index])
      
      if (isConsistent) {
        console.log(`✓ 页面 ${page.page_id} (${page.name}) - ${moduleInstanceIds.length} 个模块实例`)
      } else {
        console.log(`✗ 页面 ${page.page_id} (${page.name}) - 数据不一致`)
        console.log(`  pages.module_instance_ids: ${JSON.stringify(moduleInstanceIds)}`)
        console.log(`  page_modules: ${JSON.stringify(dbInstanceIds)}`)
      }
    }
    
    const moduleRegistryCount = db.prepare('SELECT COUNT(*) as count FROM module_registry').get() as any
    console.log(`\n模块注册表记录数: ${moduleRegistryCount.count}`)
    
    const pageModulesCount = db.prepare('SELECT COUNT(*) as count FROM page_modules').get() as any
    console.log(`页面模块实例记录数: ${pageModulesCount.count}`)
    
    console.log('\n=== 验证完成 ===\n')
    
  } finally {
    db.close()
  }
}

if (require.main === module) {
  migrateDatabase()
}

export { migrateDatabase }
