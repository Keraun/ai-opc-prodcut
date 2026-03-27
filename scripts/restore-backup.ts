import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'app.db')
const BACKUP_DIR = path.join(DATABASE_DIR, 'backup')

function getDatabase(): Database.Database {
  return new Database(DATABASE_PATH)
}

function restoreLatestBackup(): void {
  console.log('=== 恢复数据库备份 ===\n')
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('❌ 备份目录不存在')
    return
  }
  
  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('app-backup-') && f.endsWith('.db'))
    .sort()
    .reverse()
  
  if (backupFiles.length === 0) {
    console.error('❌ 未找到备份文件')
    return
  }
  
  const latestBackup = path.join(BACKUP_DIR, backupFiles[0])
  console.log(`📦 找到最新备份: ${backupFiles[0]}`)
  
  const db = getDatabase()
  db.close()
  
  fs.copyFileSync(latestBackup, DATABASE_PATH)
  console.log('✅ 数据库已恢复')
  
  const db2 = getDatabase()
  try {
    const moduleRegistry = db2.prepare('SELECT COUNT(*) as count FROM module_registry').get() as any
    console.log(`\n📊 恢复后的数据:`)
    console.log(`  module_registry 记录数: ${moduleRegistry.count}`)
    
    const pageModules = db2.prepare('SELECT COUNT(*) as count FROM page_modules').get() as any
    console.log(`  page_modules 记录数: ${pageModules.count}`)
  } finally {
    db2.close()
  }
}

if (require.main === module) {
  restoreLatestBackup()
}

export { restoreLatestBackup }
