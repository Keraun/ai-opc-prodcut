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

function analyzeDatabase(): void {
  const db = getDatabase()
  
  try {
    console.log('=== 数据库结构分析 ===\n')
    
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as any[]
    
    console.log(`📊 数据表总数: ${tables.length}\n`)
    
    for (const table of tables) {
      const tableName = table.name
      
      const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[]
      const rowCount = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as any
      const indexList = db.prepare(`PRAGMA index_list(${tableName})`).all() as any[]
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📋 表名: ${tableName}`)
      console.log(`📊 记录数: ${rowCount.count}`)
      console.log(`🔢 字段数: ${tableInfo.length}`)
      console.log(`📇 索引数: ${indexList.length}`)
      
      console.log('\n字段详情:')
      tableInfo.forEach((col: any) => {
        const type = col.type || 'TEXT'
        const pk = col.pk ? ' [PK]' : ''
        const notnull = col.notnull ? ' NOT NULL' : ''
        const defaultVal = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''
        console.log(`  - ${col.name}: ${type}${pk}${notnull}${defaultVal}`)
      })
      
      if (indexList.length > 0) {
        console.log('\n索引:')
        indexList.forEach((idx: any) => {
          console.log(`  - ${idx.name}`)
        })
      }
      
      if (rowCount.count > 0 && rowCount.count <= 5) {
        console.log('\n数据样例:')
        const samples = db.prepare(`SELECT * FROM ${tableName} LIMIT 3`).all() as any[]
        samples.forEach((sample: any, idx: number) => {
          console.log(`  记录 ${idx + 1}:`, JSON.stringify(sample, null, 2).split('\n').join('\n  '))
        })
      }
    }
    
    console.log('\n\n=== 数据完整性检查 ===\n')
    
    if (tables.some(t => t.name === 'pages')) {
      console.log('📄 页面数据检查:')
      const pages = db.prepare('SELECT * FROM pages').all() as any[]
      console.log(`  总页面数: ${pages.length}`)
      
      const systemPages = pages.filter(p => p.is_system === 1)
      const customPages = pages.filter(p => p.is_system === 0)
      console.log(`  系统页面: ${systemPages.length}`)
      console.log(`  自定义页面: ${customPages.length}`)
      
      const draftPages = pages.filter(p => p.status === 'draft')
      const publishedPages = pages.filter(p => p.status === 'published')
      console.log(`  草稿页面: ${draftPages.length}`)
      console.log(`  已发布页面: ${publishedPages.length}`)
    }
    
    if (tables.some(t => t.name === 'page_modules')) {
      console.log('\n📦 模块实例数据检查:')
      const pageModules = db.prepare('SELECT * FROM page_modules').all() as any[]
      console.log(`  总模块实例数: ${pageModules.length}`)
      
      const modulesWithData = pageModules.filter(m => m.data)
      const modulesWithoutData = pageModules.filter(m => !m.data)
      console.log(`  有自定义数据: ${modulesWithData.length}`)
      console.log(`  使用默认数据: ${modulesWithoutData.length}`)
      
      const orphanedModules = db.prepare(`
        SELECT pm.* FROM page_modules pm
        LEFT JOIN pages p ON pm.page_id = p.page_id
        WHERE p.page_id IS NULL
      `).all() as any[]
      
      if (orphanedModules.length > 0) {
        console.log(`  ⚠️  孤立模块实例: ${orphanedModules.length}`)
        orphanedModules.forEach((m: any) => {
          console.log(`    - ${m.module_instance_id} (引用不存在的页面: ${m.page_id})`)
        })
      } else {
        console.log(`  ✅ 无孤立模块实例`)
      }
    }
    
    if (tables.some(t => t.name === 'module_registry')) {
      console.log('\n🔧 模块注册表检查:')
      const moduleRegistry = db.prepare('SELECT * FROM module_registry').all() as any[]
      console.log(`  已注册模块数: ${moduleRegistry.length}`)
      
      const modulesWithSchema = moduleRegistry.filter(m => m.schema)
      const modulesWithoutSchema = moduleRegistry.filter(m => !m.schema)
      console.log(`  有Schema定义: ${modulesWithSchema.length}`)
      console.log(`  无Schema定义: ${modulesWithoutSchema.length}`)
      
      if (tables.some(t => t.name === 'page_modules')) {
        const unusedModules = db.prepare(`
          SELECT mr.module_id FROM module_registry mr
          WHERE mr.module_id NOT IN (
            SELECT DISTINCT module_id FROM page_modules
          )
        `).all() as any[]
        
        if (unusedModules.length > 0) {
          console.log(`  ⚠️  未使用的模块: ${unusedModules.length}`)
          unusedModules.forEach((m: any) => {
            console.log(`    - ${m.module_id}`)
          })
        } else {
          console.log(`  ✅ 所有模块都在使用中`)
        }
      }
    }
    
    if (tables.some(t => t.name === 'system_logs')) {
      console.log('\n📝 系统日志检查:')
      const logs = db.prepare('SELECT * FROM system_logs').all() as any[]
      console.log(`  总日志数: ${logs.length}`)
      
      if (logs.length > 0) {
        const oldestLog = logs[logs.length - 1]
        const newestLog = logs[0]
        console.log(`  最早日志: ${oldestLog.timestamp || oldestLog.created_at}`)
        console.log(`  最新日志: ${newestLog.timestamp || newestLog.created_at}`)
        
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const oldLogs = logs.filter(l => {
          const logDate = new Date(l.timestamp || l.created_at)
          return logDate < thirtyDaysAgo
        })
        
        if (oldLogs.length > 0) {
          console.log(`  ⚠️  30天前的日志: ${oldLogs.length} 条`)
        } else {
          console.log(`  ✅ 所有日志都在30天内`)
        }
      }
    }
    
    if (tables.some(t => t.name === 'accounts')) {
      console.log('\n👤 账号数据检查:')
      const accounts = db.prepare('SELECT * FROM accounts').all() as any[]
      console.log(`  总账号数: ${accounts.length}`)
      
      const accountsWithEmail = accounts.filter(a => a.email)
      const accountsWithoutEmail = accounts.filter(a => !a.email)
      console.log(`  有邮箱: ${accountsWithEmail.length}`)
      console.log(`  无邮箱: ${accountsWithoutEmail.length}`)
      
      const mustChangePassword = accounts.filter(a => a.must_change_password === 1)
      if (mustChangePassword.length > 0) {
        console.log(`  ⚠️  需要修改密码: ${mustChangePassword.length}`)
      }
    }
    
    console.log('\n\n=== 数据库文件信息 ===\n')
    const dbStats = fs.statSync(DATABASE_PATH)
    console.log(`📁 数据库文件: ${DATABASE_PATH}`)
    console.log(`📏 文件大小: ${(dbStats.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`🕐 最后修改: ${dbStats.mtime}`)
    
    const walPath = DATABASE_PATH + '-wal'
    const shmPath = DATABASE_PATH + '-shm'
    
    if (fs.existsSync(walPath)) {
      const walStats = fs.statSync(walPath)
      console.log(`📄 WAL文件大小: ${(walStats.size / 1024).toFixed(2)} KB`)
    }
    
    if (fs.existsSync(shmPath)) {
      const shmStats = fs.statSync(shmPath)
      console.log(`📄 SHM文件大小: ${(shmStats.size / 1024).toFixed(2)} KB`)
    }
    
    console.log('\n=== 分析完成 ===\n')
    
  } finally {
    db.close()
  }
}

if (require.main === module) {
  analyzeDatabase()
}

export { analyzeDatabase }
