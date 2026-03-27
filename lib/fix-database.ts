import { getDatabase } from './database'

export function fixPageModulesData(): void {
  const db = getDatabase()
  
  try {
    db.exec('BEGIN TRANSACTION')
    
    console.log('开始修复 page_modules 数据...')
    
    const pages = db.prepare('SELECT page_id, module_instance_ids FROM pages').all() as any[]
    
    db.exec('DELETE FROM page_modules')
    console.log('已清空 page_modules 表')
    
    const insertStmt = db.prepare(`
      INSERT INTO page_modules (module_instance_id, page_id, module_id, module_name, module_order, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    const updatePageStmt = db.prepare(`
      UPDATE pages SET module_instance_ids = ? WHERE page_id = ?
    `)
    
    let totalModules = 0
    
    for (const page of pages) {
      const pageId = page.page_id
      let oldModuleInstanceIds: string[] = []
      
      try {
        oldModuleInstanceIds = JSON.parse(page.module_instance_ids || '[]')
      } catch (e) {
        console.error(`解析页面 ${pageId} 的 module_instance_ids 字段失败:`, e)
        continue
      }
      
      console.log(`处理页面 ${pageId}，模块数量: ${oldModuleInstanceIds.length}`)
      
      const newModuleInstanceIds: string[] = []
      
      for (let i = 0; i < oldModuleInstanceIds.length; i++) {
        const oldInstanceId = oldModuleInstanceIds[i]
        const moduleId = oldInstanceId.split('-').slice(0, -1).join('-')
        const moduleName = moduleId
        const timestamp = Date.now() + (totalModules * 1000) + i
        const newModuleInstanceId = `${moduleId}-${timestamp}`
        
        newModuleInstanceIds.push(newModuleInstanceId)
        
        insertStmt.run(
          newModuleInstanceId,
          pageId,
          moduleId,
          moduleName,
          i,
          null
        )
        totalModules++
      }
      
      updatePageStmt.run(JSON.stringify(newModuleInstanceIds), pageId)
      console.log(`  更新页面 ${pageId} 的模块实例ID`)
    }
    
    db.exec('COMMIT')
    console.log(`修复完成！共插入 ${totalModules} 条模块实例记录`)
    
    const count = db.prepare('SELECT COUNT(*) as count FROM page_modules').get() as any
    console.log(`当前 page_modules 表记录数: ${count.count}`)
    
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('修复失败:', error)
    throw error
  } finally {
    db.close()
  }
}

export function cleanOrphanedData(): void {
  const db = getDatabase()
  
  try {
    console.log('开始清理孤立数据...')
    
    const orphanedModules = db.prepare(`
      SELECT pm.module_instance_id 
      FROM page_modules pm 
      LEFT JOIN pages p ON pm.page_id = p.page_id 
      WHERE p.page_id IS NULL
    `).all() as any[]
    
    if (orphanedModules.length > 0) {
      console.log(`发现 ${orphanedModules.length} 条孤立的模块实例记录`)
      
      for (const orphan of orphanedModules) {
        db.prepare('DELETE FROM page_modules WHERE module_instance_id = ?').run(orphan.module_instance_id)
      }
      console.log('已清理孤立的模块实例记录')
    } else {
      console.log('没有发现孤立的模块实例记录')
    }
    
    const orphanedRegistry = db.prepare(`
      SELECT mr.module_id 
      FROM module_registry mr 
      WHERE mr.module_id NOT IN (
        SELECT DISTINCT module_id FROM page_modules
      )
    `).all() as any[]
    
    if (orphanedRegistry.length > 0) {
      console.log(`发现 ${orphanedRegistry.length} 个未使用的模块注册记录（保留不删除）`)
    }
    
    console.log('清理完成！')
    
  } finally {
    db.close()
  }
}

export function verifyDataIntegrity(): void {
  const db = getDatabase()
  
  try {
    console.log('\n=== 数据完整性验证 ===\n')
    
    const pages = db.prepare('SELECT page_id, name, module_instance_ids FROM pages').all() as any[]
    console.log(`页面总数: ${pages.length}`)
    
    for (const page of pages) {
      const moduleInstanceIds: string[] = JSON.parse(page.module_instance_ids || '[]')
      const dbModules = db.prepare(`
        SELECT module_instance_id, module_id, module_order 
        FROM page_modules 
        WHERE page_id = ? 
        ORDER BY module_order
      `).all(page.page_id) as any[]
      
      const dbInstanceIds = dbModules.map(m => m.module_instance_id)
      
      const missing = moduleInstanceIds.filter(id => !dbInstanceIds.includes(id))
      const extra = dbInstanceIds.filter(id => !moduleInstanceIds.includes(id))
      
      if (missing.length > 0 || extra.length > 0) {
        console.log(`\n页面 ${page.page_id} (${page.name}) 数据不一致:`)
        if (missing.length > 0) {
          console.log(`  缺失的模块实例: ${missing.join(', ')}`)
        }
        if (extra.length > 0) {
          console.log(`  多余的模块实例: ${extra.join(', ')}`)
        }
      } else {
        console.log(`✓ 页面 ${page.page_id} (${page.name}) 数据一致，共 ${moduleInstanceIds.length} 个模块`)
      }
    }
    
    const moduleRegistry = db.prepare('SELECT COUNT(*) as count FROM module_registry').get() as any
    console.log(`\n模块注册表记录数: ${moduleRegistry.count}`)
    
    const pageModules = db.prepare('SELECT COUNT(*) as count FROM page_modules').get() as any
    console.log(`页面模块实例记录数: ${pageModules.count}`)
    
    console.log('\n=== 验证完成 ===\n')
    
  } finally {
    db.close()
  }
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (command === 'fix') {
    fixPageModulesData()
  } else if (command === 'clean') {
    cleanOrphanedData()
  } else if (command === 'verify') {
    verifyDataIntegrity()
  } else if (command === 'all') {
    fixPageModulesData()
    cleanOrphanedData()
    verifyDataIntegrity()
  } else {
    console.log('用法:')
    console.log('  ts-node lib/fix-database.ts fix     - 修复 page_modules 数据')
    console.log('  ts-node lib/fix-database.ts clean   - 清理孤立数据')
    console.log('  ts-node lib/fix-database.ts verify  - 验证数据完整性')
    console.log('  ts-node lib/fix-database.ts all     - 执行所有操作')
  }
}
