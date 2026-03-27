import path from 'path'
import fs from 'fs'
import Database from 'better-sqlite3'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'app.db')
const BACKUP_DIR = path.join(DATABASE_DIR, 'backup')

export interface BackupInfo {
  filename: string
  path: string
  size: number
  createdAt: Date
  formattedSize: string
}

export function ensureBackupDir(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }
}

export function getBackupFiles(): BackupInfo[] {
  ensureBackupDir()
  
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('app-backup-') && f.endsWith('.db'))
    .sort()
    .reverse()
  
  return files.map(filename => {
    const filePath = path.join(BACKUP_DIR, filename)
    const stats = fs.statSync(filePath)
    
    return {
      filename,
      path: filePath,
      size: stats.size,
      createdAt: stats.birthtime,
      formattedSize: formatFileSize(stats.size)
    }
  })
}

export function getLatestBackup(): BackupInfo | null {
  const backups = getBackupFiles()
  return backups.length > 0 ? backups[0] : null
}

export function createBackup(suffix: string = ''): BackupInfo {
  ensureBackupDir()
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = suffix 
    ? `app-backup-${timestamp}-${suffix}.db`
    : `app-backup-${timestamp}.db`
  const backupPath = path.join(BACKUP_DIR, filename)
  
  if (fs.existsSync(DATABASE_PATH)) {
    fs.copyFileSync(DATABASE_PATH, backupPath)
  } else {
    const db = new Database(backupPath)
    db.close()
  }
  
  const stats = fs.statSync(backupPath)
  return {
    filename,
    path: backupPath,
    size: stats.size,
    createdAt: stats.birthtime,
    formattedSize: formatFileSize(stats.size)
  }
}

export function restoreBackup(backupFilename: string): { 
  success: boolean
  message: string
  backupCreated?: BackupInfo
} {
  ensureBackupDir()
  
  const backupPath = path.join(BACKUP_DIR, backupFilename)
  
  if (!fs.existsSync(backupPath)) {
    return {
      success: false,
      message: `备份文件不存在: ${backupFilename}`
    }
  }
  
  let backupCreated: BackupInfo | undefined
  if (fs.existsSync(DATABASE_PATH)) {
    backupCreated = createBackup('before-restore')
  }
  
  try {
    if (fs.existsSync(DATABASE_PATH)) {
      fs.unlinkSync(DATABASE_PATH)
    }
    
    const shmPath = DATABASE_PATH + '-shm'
    const walPath = DATABASE_PATH + '-wal'
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath)
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath)
    
    fs.copyFileSync(backupPath, DATABASE_PATH)
    
    const db = new Database(DATABASE_PATH)
    db.pragma('journal_mode = WAL')
    db.close()
    
    return {
      success: true,
      message: `成功从备份 ${backupFilename} 还原数据库`,
      backupCreated
    }
  } catch (error) {
    return {
      success: false,
      message: `还原失败: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

export function restoreLatestBackup(): { 
  success: boolean
  message: string
  backupCreated?: BackupInfo
  restoredFrom?: string
} {
  const latestBackup = getLatestBackup()
  
  if (!latestBackup) {
    return {
      success: false,
      message: '没有找到可用的备份文件'
    }
  }
  
  const result = restoreBackup(latestBackup.filename)
  
  return {
    ...result,
    restoredFrom: latestBackup.filename
  }
}

export function deleteBackup(backupFilename: string): boolean {
  const backupPath = path.join(BACKUP_DIR, backupFilename)
  
  if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath)
    return true
  }
  
  return false
}

export function validateDatabase(): { 
  valid: boolean
  tables?: string[]
  error?: string 
} {
  try {
    if (!fs.existsSync(DATABASE_PATH)) {
      return {
        valid: false,
        error: '数据库文件不存在'
      }
    }
    
    const db = new Database(DATABASE_PATH)
    
    try {
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `).all() as { name: string }[]
      
      const tableNames = tables.map(t => t.name)
      
      const requiredTables = [
        'accounts',
        'system_config',
        'system_logs',
        'theme_config',
        'pages',
        'module_registry',
        'page_modules'
      ]
      
      const missingTables = requiredTables.filter(t => !tableNames.includes(t))
      
      if (missingTables.length > 0) {
        return {
          valid: false,
          tables: tableNames,
          error: `缺少必要的表: ${missingTables.join(', ')}`
        }
      }
      
      return {
        valid: true,
        tables: tableNames
      }
    } finally {
      db.close()
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
