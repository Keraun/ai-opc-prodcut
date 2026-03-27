import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'app.db')

function getDatabase(): Database.Database {
  return new Database(DATABASE_PATH)
}

function verifyDatabase(): void {
  const db = getDatabase()
  
  try {
    console.log('=== 数据库完整性验证 ===\n')
    
    console.log('1. 检查表结构...')
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as any[]
    
    console.log(`  ✅ 共有 ${tables.length} 个数据表`)
    
    console.log('\n2. 检查数据完整性...')
    
    const pages = db.prepare('SELECT COUNT(*) as count FROM pages').get() as any
    console.log(`  📄 页面数: ${pages.count}`)
    
    const pageModules = db.prepare('SELECT COUNT(*) as count FROM page_modules').get() as any
    console.log(`  📦 模块实例数: ${pageModules.count}`)
    
    const moduleRegistry = db.prepare('SELECT COUNT(*) as count FROM module_registry').get() as any
    console.log(`  🔧 注册模块数: ${moduleRegistry.count}`)
    
    console.log('\n3. 检查外键关系...')
    
    const orphanedModules = db.prepare(`
      SELECT COUNT(*) as count FROM page_modules pm
      LEFT JOIN pages p ON pm.page_id = p.page_id
      WHERE p.page_id IS NULL
    `).get() as any
    
    if (orphanedModules.count > 0) {
      console.log(`  ❌ 发现 ${orphanedModules.count} 个孤立模块实例`)
    } else {
      console.log(`  ✅ 无孤立模块实例`)
    }
    
    const moduleIds = db.prepare('SELECT DISTINCT module_id FROM page_modules').all() as any[]
    const registryIds = db.prepare('SELECT module_id FROM module_registry').all() as any[]
    const registrySet = new Set(registryIds.map(r => r.module_id))
    
    let missingModules = 0
    moduleIds.forEach(m => {
      if (!registrySet.has(m.module_id)) {
        console.log(`  ❌ 模块 ${m.module_id} 在注册表中不存在`)
        missingModules++
      }
    })
    
    if (missingModules === 0) {
      console.log(`  ✅ 所有模块ID都正确关联`)
    } else {
      console.log(`  ❌ 发现 ${missingModules} 个未关联的模块ID`)
    }
    
    console.log('\n4. 检查数据一致性...')
    
    const pagesWithModules = db.prepare(`
      SELECT page_id, name, module_instance_ids FROM pages
    `).all() as any[]
    
    let inconsistentPages = 0
    
    pagesWithModules.forEach(page => {
      const instanceIds = JSON.parse(page.module_instance_ids || '[]')
      const actualModules = db.prepare(`
        SELECT module_instance_id FROM page_modules 
        WHERE page_id = ?
        ORDER BY module_order
      `).all(page.page_id) as any[]
      
      const actualInstanceIds = actualModules.map(m => m.module_instance_id)
      
      if (JSON.stringify(instanceIds) !== JSON.stringify(actualInstanceIds)) {
        console.log(`  ❌ 页面 ${page.name} 的模块实例ID不一致`)
        console.log(`     pages表: ${JSON.stringify(instanceIds)}`)
        console.log(`     page_modules表: ${JSON.stringify(actualInstanceIds)}`)
        inconsistentPages++
      }
    })
    
    if (inconsistentPages === 0) {
      console.log(`  ✅ 所有页面的模块实例ID一致`)
    } else {
      console.log(`  ❌ 发现 ${inconsistentPages} 个不一致的页面`)
    }
    
    console.log('\n5. 检查索引...')
    
    const indexes = db.prepare(`
      SELECT name, tbl_name FROM sqlite_master
      WHERE type='index' AND name NOT LIKE 'sqlite_%'
      ORDER BY tbl_name, name
    `).all() as any[]
    
    console.log(`  📇 共有 ${indexes.length} 个索引`)
    indexes.forEach(idx => {
      console.log(`    - ${idx.name} (${idx.tbl_name})`)
    })
    
    console.log('\n6. 检查数据库文件...')
    
    const dbStats = fs.statSync(DATABASE_PATH)
    console.log(`  📁 文件大小: ${(dbStats.size / 1024).toFixed(2)} KB`)
    
    const walPath = DATABASE_PATH + '-wal'
    const shmPath = DATABASE_PATH + '-shm'
    
    if (fs.existsSync(walPath)) {
      const walStats = fs.statSync(walPath)
      console.log(`  📄 WAL文件: ${(walStats.size / 1024).toFixed(2)} KB`)
    }
    
    if (fs.existsSync(shmPath)) {
      const shmStats = fs.statSync(shmPath)
      console.log(`  📄 SHM文件: ${(shmStats.size / 1024).toFixed(2)} KB`)
    }
    
    console.log('\n=== 验证完成 ===')
    
    const hasErrors = orphanedModules.count > 0 || missingModules > 0 || inconsistentPages > 0
    
    if (hasErrors) {
      console.log('\n⚠️  数据库存在问题，建议修复')
      process.exit(1)
    } else {
      console.log('\n✅ 数据库状态良好')
      process.exit(0)
    }
    
  } finally {
    db.close()
  }
}

if (require.main === module) {
  verifyDatabase()
}

export { verifyDatabase }
