import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'app.db')

function getDatabase(): Database.Database {
  return new Database(DATABASE_PATH)
}

function extractOriginalModuleId(moduleInstanceId: string): string {
  const parts = moduleInstanceId.split('-')
  
  if (parts.length >= 3) {
    const lastTwoParts = parts.slice(-2)
    if (/^\d+$/.test(lastTwoParts[0]) && /^\d+$/.test(lastTwoParts[1])) {
      return parts.slice(0, -2).join('-')
    }
  }
  
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1]
    if (/^\d+$/.test(lastPart)) {
      return parts.slice(0, -1).join('-')
    }
  }
  
  return moduleInstanceId
}

function analyzeModuleIdIssue(): void {
  const db = getDatabase()
  
  try {
    console.log('=== 分析 module_id 数据问题 ===\n')
    
    const pageModules = db.prepare('SELECT * FROM page_modules LIMIT 5').all() as any[]
    
    console.log('📋 page_modules 表数据样例:')
    pageModules.forEach(m => {
      console.log(`\n  实例ID: ${m.module_instance_id}`)
      console.log(`  模块ID: ${m.module_id}`)
      console.log(`  模块名: ${m.module_name}`)
      
      const originalModuleId = extractOriginalModuleId(m.module_instance_id)
      
      console.log(`  分析:`)
      console.log(`    - 原始模块ID应该是: ${originalModuleId}`)
      console.log(`    - 当前存储的module_id: ${m.module_id}`)
      console.log(`    - 是否匹配: ${m.module_id === originalModuleId ? '✅' : '❌'}`)
    })
    
    const moduleRegistry = db.prepare('SELECT module_id, module_name FROM module_registry').all() as any[]
    
    console.log('\n\n🔧 module_registry 表数据:')
    moduleRegistry.forEach(m => {
      console.log(`  - ${m.module_id} (${m.module_name})`)
    })
    
    console.log('\n\n💡 问题分析:')
    console.log('  1. page_modules.module_id 存储的是带时间戳的ID')
    console.log('  2. module_registry.module_id 存储的是原始模块ID')
    console.log('  3. 两者无法匹配，导致外键关联失败')
    
    console.log('\n📝 解决方案:')
    console.log('  1. 修改 page_modules.module_id，提取原始模块ID')
    console.log('  2. 例如: site-root-1774642127716-1774642692903 → site-root')
    
  } finally {
    db.close()
  }
}

function fixModuleIdData(): void {
  const db = getDatabase()
  
  try {
    console.log('\n=== 修复 module_id 数据 ===\n')
    
    db.exec('BEGIN TRANSACTION')
    
    const pageModules = db.prepare('SELECT module_instance_id, module_id, module_name FROM page_modules').all() as any[]
    
    console.log(`📊 需要修复 ${pageModules.length} 条记录\n`)
    
    const updateStmt = db.prepare('UPDATE page_modules SET module_id = ?, module_name = ? WHERE module_instance_id = ?')
    
    let fixedCount = 0
    
    pageModules.forEach(m => {
      const originalModuleId = extractOriginalModuleId(m.module_instance_id)
      
      if (m.module_id !== originalModuleId) {
        updateStmt.run(originalModuleId, originalModuleId, m.module_instance_id)
        console.log(`  ✓ 修复: ${m.module_id} → ${originalModuleId}`)
        fixedCount++
      }
    })
    
    db.exec('COMMIT')
    
    console.log(`\n✅ 修复完成，共修复 ${fixedCount} 条记录`)
    
    console.log('\n=== 验证修复结果 ===\n')
    
    const moduleIds = db.prepare('SELECT DISTINCT module_id FROM page_modules').all() as any[]
    console.log('📋 page_modules 中唯一的 module_id:')
    moduleIds.forEach(m => console.log(`  - ${m.module_id}`))
    
    const registryIds = db.prepare('SELECT module_id FROM module_registry').all() as any[]
    const registrySet = new Set(registryIds.map(r => r.module_id))
    
    console.log('\n🔗 检查关联关系:')
    let allMatch = true
    moduleIds.forEach(m => {
      if (registrySet.has(m.module_id)) {
        console.log(`  ✅ ${m.module_id} - 在 module_registry 中存在`)
      } else {
        console.log(`  ❌ ${m.module_id} - 在 module_registry 中不存在`)
        allMatch = false
      }
    })
    
    if (allMatch) {
      console.log('\n🎉 所有模块ID都已正确关联！')
    } else {
      console.log('\n⚠️  仍有部分模块ID未关联，请检查')
    }
    
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('❌ 修复失败:', error)
    throw error
  } finally {
    db.close()
  }
}

if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--fix')) {
    analyzeModuleIdIssue()
    fixModuleIdData()
  } else {
    analyzeModuleIdIssue()
  }
}

export { analyzeModuleIdIssue, fixModuleIdData, extractOriginalModuleId }
