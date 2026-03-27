import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'app.db')

function getDatabase(): Database.Database {
  const db = new Database(DATABASE_PATH)
  db.pragma('journal_mode = WAL')
  return db
}

function checkModuleRelationships(): void {
  const db = getDatabase()
  
  try {
    console.log('=== 模块关系检查 ===\n')
    
    const pageModules = db.prepare('SELECT * FROM page_modules').all() as any[]
    console.log(`📦 page_modules 表中的模块实例: ${pageModules.length}\n`)
    
    const moduleIdsInUse = new Set(pageModules.map(m => m.module_id))
    console.log(`📊 正在使用的模块ID:`)
    moduleIdsInUse.forEach(id => console.log(`  - ${id}`))
    
    console.log(`\n📋 page_modules 中的记录详情:`)
    pageModules.forEach(m => {
      console.log(`  实例ID: ${m.module_instance_id}`)
      console.log(`    页面ID: ${m.page_id}`)
      console.log(`    模块ID: ${m.module_id}`)
      console.log(`    模块名: ${m.module_name}`)
      console.log(`    有数据: ${m.data ? '是' : '否'}`)
      console.log('')
    })
    
    const pages = db.prepare('SELECT page_id, name, module_instance_ids FROM pages').all() as any[]
    console.log(`\n📄 pages 表中的页面: ${pages.length}\n`)
    
    pages.forEach(p => {
      const instanceIds = JSON.parse(p.module_instance_ids || '[]')
      console.log(`  页面: ${p.name} (${p.page_id})`)
      console.log(`    模块实例ID: ${JSON.stringify(instanceIds)}`)
      console.log('')
    })
    
    const moduleRegistry = db.prepare('SELECT * FROM module_registry').all() as any[]
    console.log(`\n🔧 module_registry 表中的模块: ${moduleRegistry.length}\n`)
    
    if (moduleRegistry.length === 0) {
      console.log(`  ⚠️  module_registry 表为空！`)
      console.log(`  这意味着所有模块注册信息都被删除了！`)
      console.log(`\n  建议：需要重新注册这些模块`)
    } else {
      moduleRegistry.forEach(m => {
        console.log(`  - ${m.module_id} (${m.module_name})`)
      })
    }
    
    console.log(`\n=== 数据一致性检查 ===\n`)
    
    const missingModules: string[] = []
    moduleIdsInUse.forEach(moduleId => {
      const registry = moduleRegistry.find(r => r.module_id === moduleId)
      if (!registry) {
        missingModules.push(moduleId)
      }
    })
    
    if (missingModules.length > 0) {
      console.log(`⚠️  以下模块正在使用但注册表中不存在:`)
      missingModules.forEach(id => console.log(`  - ${id}`))
      console.log(`\n  这会导致前端无法获取模块的默认数据和Schema！`)
    } else {
      console.log(`✅ 所有正在使用的模块都在注册表中`)
    }
    
  } finally {
    db.close()
  }
}

if (require.main === module) {
  checkModuleRelationships()
}

export { checkModuleRelationships }
