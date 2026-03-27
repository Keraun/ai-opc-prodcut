import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'app.db')
const BACKUP_DIR = path.join(DATABASE_DIR, 'backup')

function getDatabase(): Database.Database {
  return new Database(DATABASE_PATH)
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

function migrateThemeConfig(): void {
  const db = getDatabase()
  
  try {
    console.log('=== 开始迁移 theme_config 表 ===\n')
    
    const oldThemeConfig = db.prepare('SELECT * FROM theme_config').get() as any
    
    if (!oldThemeConfig) {
      console.log('⚠️  未找到 theme_config 数据')
      return
    }
    
    console.log('📦 当前 theme_config 数据:')
    console.log(`  current_theme: ${oldThemeConfig.current_theme}`)
    console.log(`  themes_config: ${oldThemeConfig.themes_config.substring(0, 100)}...`)
    
    db.exec('BEGIN TRANSACTION')
    
    console.log('\n1. 将 current_theme 移到 site_config 表...')
    
    const existingCurrentTheme = db.prepare(`
      SELECT * FROM site_config WHERE config_key = 'current_theme'
    `).get() as any
    
    if (existingCurrentTheme) {
      db.prepare(`
        UPDATE site_config 
        SET config_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE config_key = 'current_theme'
      `).run(oldThemeConfig.current_theme)
      console.log('  ✓ 更新 site_config.current_theme')
    } else {
      db.prepare(`
        INSERT INTO site_config (config_key, config_value)
        VALUES ('current_theme', ?)
      `).run(oldThemeConfig.current_theme)
      console.log('  ✓ 插入 site_config.current_theme')
    }
    
    console.log('\n2. 备份旧的 theme_config 表...')
    db.exec(`
      CREATE TABLE IF NOT EXISTS theme_config_backup (
        id INTEGER PRIMARY KEY,
        current_theme TEXT NOT NULL,
        themes_config TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
      )
    `)
    
    db.exec(`INSERT INTO theme_config_backup SELECT * FROM theme_config`)
    console.log('  ✓ 已备份到 theme_config_backup 表')
    
    console.log('\n3. 删除旧的 theme_config 表...')
    db.exec('DROP TABLE theme_config')
    console.log('  ✓ 已删除旧表')
    
    console.log('\n4. 创建新的 theme_config 表...')
    db.exec(`
      CREATE TABLE theme_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme_id TEXT UNIQUE NOT NULL,
        theme_name TEXT NOT NULL,
        theme_config TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('  ✓ 新表创建成功')
    
    console.log('\n5. 迁移主题数据...')
    const themesData = JSON.parse(oldThemeConfig.themes_config)
    
    const insertTheme = db.prepare(`
      INSERT INTO theme_config (theme_id, theme_name, theme_config)
      VALUES (?, ?, ?)
    `)
    
    let themeCount = 0
    for (const [themeId, themeData] of Object.entries(themesData)) {
      const theme = themeData as any
      insertTheme.run(
        themeId,
        theme.name || themeId,
        JSON.stringify(theme)
      )
      console.log(`  ✓ 迁移主题: ${themeId} (${theme.name})`)
      themeCount++
    }
    
    console.log(`\n  共迁移 ${themeCount} 个主题`)
    
    db.exec('COMMIT')
    
    console.log('\n=== 迁移完成 ===')
    
    console.log('\n验证新表结构:')
    const newThemeConfig = db.prepare('SELECT * FROM theme_config').all() as any[]
    console.log(`  新 theme_config 表记录数: ${newThemeConfig.length}`)
    
    const currentTheme = db.prepare(`
      SELECT * FROM site_config WHERE config_key = 'current_theme'
    `).get() as any
    console.log(`  site_config.current_theme: ${currentTheme?.config_value}`)
    
    console.log('\n新 theme_config 表数据:')
    newThemeConfig.forEach(theme => {
      console.log(`  - ${theme.theme_id}: ${theme.theme_name}`)
    })
    
  } catch (error) {
    db.exec('ROLLBACK')
    console.error('\n❌ 迁移失败:', error)
    throw error
  } finally {
    db.close()
  }
}

function verifyMigration(): void {
  const db = getDatabase()
  
  try {
    console.log('\n=== 验证迁移结果 ===\n')
    
    console.log('1. 检查 theme_config 表结构...')
    const tableInfo = db.prepare('PRAGMA table_info(theme_config)').all() as any[]
    console.log('  字段:')
    tableInfo.forEach(col => {
      console.log(`    - ${col.name}: ${col.type}${col.pk ? ' [PK]' : ''}${col.notnull ? ' NOT NULL' : ''}`)
    })
    
    console.log('\n2. 检查 site_config 表...')
    const siteConfig = db.prepare('SELECT * FROM site_config ORDER BY config_key').all() as any[]
    console.log(`  记录数: ${siteConfig.length}`)
    siteConfig.forEach(config => {
      console.log(`    - ${config.config_key}: ${config.config_value.substring(0, 50)}...`)
    })
    
    console.log('\n3. 检查 theme_config 数据...')
    const themes = db.prepare('SELECT theme_id, theme_name FROM theme_config').all() as any[]
    console.log(`  主题数: ${themes.length}`)
    themes.forEach(theme => {
      console.log(`    - ${theme.theme_id}: ${theme.theme_name}`)
    })
    
    console.log('\n✅ 验证完成')
    
  } finally {
    db.close()
  }
}

if (require.main === module) {
  console.log('📦 备份数据库...')
  backupDatabase()
  
  migrateThemeConfig()
  verifyMigration()
}

export { migrateThemeConfig, verifyMigration }
