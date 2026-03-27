import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import readline from 'readline'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'app.db')
const BACKUP_DIR = path.join(DATABASE_DIR, 'backup')

interface CleanupOptions {
  cleanOrphanedData: boolean
  cleanExpiredLogs: boolean
  cleanUnusedModules: boolean
  cleanDuplicateConfig: boolean
  optimizeTables: boolean
  dropUnusedTables: string[]
}

function getDatabase(): Database.Database {
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, { recursive: true })
  }
  
  const db = new Database(DATABASE_PATH)
  db.pragma('journal_mode = WAL')
  
  return db
}

function backupDatabase(): string {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(BACKUP_DIR, `app-backup-${timestamp}.db`)
  
  fs.copyFileSync(DATABASE_PATH, backupPath)
  console.log(`✅ 数据库已备份到: ${backupPath}`)
  
  return backupPath
}

function cleanOrphanedData(db: Database.Database): number {
  console.log('\n🔍 检查孤立数据...')
  
  let cleanedCount = 0
  
  const orphanedModules = db.prepare(`
    SELECT pm.module_instance_id FROM page_modules pm
    LEFT JOIN pages p ON pm.page_id = p.page_id
    WHERE p.page_id IS NULL
  `).all() as any[]
  
  if (orphanedModules.length > 0) {
    console.log(`  发现 ${orphanedModules.length} 个孤立模块实例`)
    
    const deleteStmt = db.prepare('DELETE FROM page_modules WHERE module_instance_id = ?')
    orphanedModules.forEach((m: any) => {
      deleteStmt.run(m.module_instance_id)
      console.log(`  ✓ 删除孤立模块: ${m.module_instance_id}`)
      cleanedCount++
    })
  } else {
    console.log('  ✓ 未发现孤立模块实例')
  }
  
  const orphanedPageModules = db.prepare(`
    SELECT p.page_id FROM pages p
    LEFT JOIN page_modules pm ON p.page_id = pm.page_id
    WHERE pm.page_id IS NULL AND p.module_instance_ids != '[]'
  `).all() as any[]
  
  if (orphanedPageModules.length > 0) {
    console.log(`  发现 ${orphanedPageModules.length} 个页面有模块ID但无实际模块数据`)
    
    const updateStmt = db.prepare('UPDATE pages SET module_instance_ids = ? WHERE page_id = ?')
    orphanedPageModules.forEach((p: any) => {
      updateStmt.run('[]', p.page_id)
      console.log(`  ✓ 清理页面模块ID: ${p.page_id}`)
      cleanedCount++
    })
  }
  
  return cleanedCount
}

function cleanExpiredLogs(db: Database.Database, daysToKeep: number = 30): number {
  console.log(`\n🔍 清理 ${daysToKeep} 天前的日志...`)
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  const cutoffStr = cutoffDate.toISOString()
  
  const oldLogs = db.prepare(`
    SELECT COUNT(*) as count FROM system_logs
    WHERE created_at < ? OR timestamp < ?
  `).get(cutoffStr, cutoffStr) as any
  
  if (oldLogs.count > 0) {
    const result = db.prepare(`
      DELETE FROM system_logs
      WHERE created_at < ? OR timestamp < ?
    `).run(cutoffStr, cutoffStr)
    
    console.log(`  ✓ 删除了 ${result.changes} 条过期日志`)
    return result.changes
  } else {
    console.log('  ✓ 未发现过期日志')
    return 0
  }
}

function cleanUnusedModules(db: Database.Database): number {
  console.log('\n🔍 检查未使用的模块...')
  
  const unusedModules = db.prepare(`
    SELECT mr.module_id, mr.module_name FROM module_registry mr
    WHERE mr.module_id NOT IN (
      SELECT DISTINCT module_id FROM page_modules
    )
  `).all() as any[]
  
  if (unusedModules.length > 0) {
    console.log(`  发现 ${unusedModules.length} 个未使用的模块:`)
    unusedModules.forEach((m: any) => {
      console.log(`    - ${m.module_id} (${m.module_name})`)
    })
    
    const deleteStmt = db.prepare('DELETE FROM module_registry WHERE module_id = ?')
    let deletedCount = 0
    
    unusedModules.forEach((m: any) => {
      const result = deleteStmt.run(m.module_id)
      if (result.changes > 0) {
        console.log(`  ✓ 删除未使用模块: ${m.module_id}`)
        deletedCount++
      }
    })
    
    return deletedCount
  } else {
    console.log('  ✓ 所有模块都在使用中')
    return 0
  }
}

function cleanDuplicateConfig(db: Database.Database): number {
  console.log('\n🔍 检查重复配置...')
  
  let cleanedCount = 0
  
  const duplicateSiteConfig = db.prepare(`
    SELECT config_key, COUNT(*) as count
    FROM site_config
    GROUP BY config_key
    HAVING count > 1
  `).all() as any[]
  
  if (duplicateSiteConfig.length > 0) {
    console.log(`  发现 ${duplicateSiteConfig.length} 个重复的站点配置`)
    
    duplicateSiteConfig.forEach((dup: any) => {
      const configs = db.prepare(`
        SELECT id FROM site_config
        WHERE config_key = ?
        ORDER BY updated_at DESC
      `).all(dup.config_key) as any[]
      
      if (configs.length > 1) {
        const idsToDelete = configs.slice(1).map(c => c.id)
        const deleteStmt = db.prepare(`DELETE FROM site_config WHERE id IN (${idsToDelete.map(() => '?').join(',')})`)
        deleteStmt.run(...idsToDelete)
        console.log(`  ✓ 删除重复配置: ${dup.config_key} (${idsToDelete.length} 条)`)
        cleanedCount += idsToDelete.length
      }
    })
  } else {
    console.log('  ✓ 未发现重复的站点配置')
  }
  
  const duplicateSystemConfig = db.prepare(`
    SELECT config_key, COUNT(*) as count
    FROM system_config
    GROUP BY config_key
    HAVING count > 1
  `).all() as any[]
  
  if (duplicateSystemConfig.length > 0) {
    console.log(`  发现 ${duplicateSystemConfig.length} 个重复的系统配置`)
    
    duplicateSystemConfig.forEach((dup: any) => {
      const configs = db.prepare(`
        SELECT id FROM system_config
        WHERE config_key = ?
        ORDER BY updated_at DESC
      `).all(dup.config_key) as any[]
      
      if (configs.length > 1) {
        const idsToDelete = configs.slice(1).map(c => c.id)
        const deleteStmt = db.prepare(`DELETE FROM system_config WHERE id IN (${idsToDelete.map(() => '?').join(',')})`)
        deleteStmt.run(...idsToDelete)
        console.log(`  ✓ 删除重复配置: ${dup.config_key} (${idsToDelete.length} 条)`)
        cleanedCount += idsToDelete.length
      }
    })
  } else {
    console.log('  ✓ 未发现重复的系统配置')
  }
  
  return cleanedCount
}

function optimizeTables(db: Database.Database): void {
  console.log('\n🔧 优化表结构...')
  
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
      CREATE INDEX IF NOT EXISTS idx_page_modules_page_id ON page_modules(page_id);
      CREATE INDEX IF NOT EXISTS idx_page_modules_module_id ON page_modules(module_id);
      CREATE INDEX IF NOT EXISTS idx_module_registry_module_id ON module_registry(module_id);
    `)
    
    console.log('  ✓ 创建索引成功')
    console.log('  ℹ️  数据库压缩将在事务提交后执行')
    
  } catch (error) {
    console.error('  ✗ 优化失败:', error)
  }
}

function dropTable(db: Database.Database, tableName: string): boolean {
  console.log(`\n🗑️  删除表: ${tableName}...`)
  
  try {
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name=?
    `).get(tableName)
    
    if (tableExists) {
      db.exec(`DROP TABLE IF EXISTS ${tableName}`)
      console.log(`  ✓ 表 ${tableName} 已删除`)
      return true
    } else {
      console.log(`  ⚠️  表 ${tableName} 不存在`)
      return false
    }
  } catch (error) {
    console.error(`  ✗ 删除失败:`, error)
    return false
  }
}

function fixMissingTimestamp(db: Database.Database): number {
  console.log('\n🔧 修复缺失的时间戳...')
  
  const logsWithoutTimestamp = db.prepare(`
    SELECT id, created_at FROM system_logs
    WHERE timestamp IS NULL
  `).all() as any[]
  
  if (logsWithoutTimestamp.length > 0) {
    const updateStmt = db.prepare('UPDATE system_logs SET timestamp = ? WHERE id = ?')
    
    logsWithoutTimestamp.forEach((log: any) => {
      updateStmt.run(log.created_at, log.id)
    })
    
    console.log(`  ✓ 修复了 ${logsWithoutTimestamp.length} 条日志的时间戳`)
    return logsWithoutTimestamp.length
  } else {
    console.log('  ✓ 所有日志都有时间戳')
    return 0
  }
}

async function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase())
    })
  })
}

async function interactiveCleanup(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  try {
    console.log('=== 数据库清理工具 ===\n')
    
    console.log('📋 可用的清理选项:\n')
    console.log('  1. 清理孤立数据（删除引用不存在页面的模块实例）')
    console.log('  2. 清理过期日志（删除30天前的系统日志）')
    console.log('  3. 清理未使用模块（删除未被任何页面使用的模块）')
    console.log('  4. 清理重复配置（删除重复的站点/系统配置）')
    console.log('  5. 优化表结构（创建索引、压缩数据库）')
    console.log('  6. 修复缺失时间戳（为日志添加缺失的timestamp）')
    console.log('  7. 删除废弃表（选择要删除的表）')
    console.log('  8. 执行所有清理操作')
    console.log('  0. 退出\n')
    
    const choice = await askQuestion(rl, '请选择操作 (0-8): ')
    
    if (choice === '0') {
      console.log('\n👋 已退出')
      return
    }
    
    const db = getDatabase()
    
    try {
      console.log('\n📦 开始备份数据库...')
      backupDatabase()
      
      db.exec('BEGIN TRANSACTION')
      
      let totalCleaned = 0
      
      switch (choice) {
        case '1':
          totalCleaned = cleanOrphanedData(db)
          break
        case '2':
          totalCleaned = cleanExpiredLogs(db)
          break
        case '3':
          totalCleaned = cleanUnusedModules(db)
          break
        case '4':
          totalCleaned = cleanDuplicateConfig(db)
          break
        case '5':
          optimizeTables(db)
          break
        case '6':
          totalCleaned = fixMissingTimestamp(db)
          break
        case '7':
          const tables = db.prepare(`
            SELECT name FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
          `).all() as any[]
          
          console.log('\n📋 可删除的表:')
          tables.forEach((t: any, idx: number) => {
            console.log(`  ${idx + 1}. ${t.name}`)
          })
          
          const tableChoice = await askQuestion(rl, '\n输入要删除的表名（多个表用逗号分隔）: ')
          const tablesToDelete = tableChoice.split(',').map(t => t.trim()).filter(t => t)
          
          tablesToDelete.forEach(tableName => {
            if (dropTable(db, tableName)) {
              totalCleaned++
            }
          })
          break
        case '8':
          console.log('\n🚀 执行所有清理操作...\n')
          totalCleaned += cleanOrphanedData(db)
          totalCleaned += cleanExpiredLogs(db)
          totalCleaned += cleanUnusedModules(db)
          totalCleaned += cleanDuplicateConfig(db)
          totalCleaned += fixMissingTimestamp(db)
          optimizeTables(db)
          break
        default:
          console.log('\n❌ 无效的选择')
          return
      }
      
      db.exec('COMMIT')
      
      console.log(`\n✅ 清理完成！共处理 ${totalCleaned} 条数据`)
      
    } catch (error) {
      db.exec('ROLLBACK')
      console.error('\n❌ 清理失败，已回滚:', error)
      throw error
    } finally {
      db.close()
    }
    
  } finally {
    rl.close()
  }
}

function autoCleanup(options: CleanupOptions): void {
  console.log('=== 自动数据库清理 ===\n')
  
  console.log('📦 开始备份数据库...')
  backupDatabase()
  
  const db = getDatabase()
  
  try {
    db.exec('BEGIN TRANSACTION')
    
    let totalCleaned = 0
    
    if (options.cleanOrphanedData) {
      totalCleaned += cleanOrphanedData(db)
    }
    
    if (options.cleanExpiredLogs) {
      totalCleaned += cleanExpiredLogs(db)
    }
    
    if (options.cleanUnusedModules) {
      totalCleaned += cleanUnusedModules(db)
    }
    
    if (options.cleanDuplicateConfig) {
      totalCleaned += cleanDuplicateConfig(db)
    }
    
    if (options.optimizeTables) {
      optimizeTables(db)
    }
    
    options.dropUnusedTables.forEach(tableName => {
      if (dropTable(db, tableName)) {
        totalCleaned++
      }
    })
    
    db.exec('COMMIT')
    
    if (options.optimizeTables) {
      console.log('\n🔧 执行数据库压缩和优化...')
      try {
        db.exec('VACUUM')
        console.log('  ✓ 数据库压缩完成')
        
        db.exec('ANALYZE')
        console.log('  ✓ 查询优化分析完成')
      } catch (error) {
        console.error('  ✗ 压缩失败:', error)
      }
    }
    
    console.log(`\n✅ 清理完成！共处理 ${totalCleaned} 条数据`)
    
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('\n❌ 清理失败，已回滚:', error)
    throw error
  } finally {
    db.close()
  }
}

if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--auto')) {
    const options: CleanupOptions = {
      cleanOrphanedData: true,
      cleanExpiredLogs: true,
      cleanUnusedModules: true,
      cleanDuplicateConfig: true,
      optimizeTables: true,
      dropUnusedTables: []
    }
    
    autoCleanup(options)
  } else {
    interactiveCleanup()
  }
}

export {
  cleanOrphanedData,
  cleanExpiredLogs,
  cleanUnusedModules,
  cleanDuplicateConfig,
  optimizeTables,
  dropTable,
  fixMissingTimestamp,
  backupDatabase
}
