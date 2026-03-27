#!/usr/bin/env tsx
import { getDatabase } from '../lib/database'

console.log('=== 迁移 site_config 表到 system_config 表 ===\n')

const db = getDatabase()

try {
  console.log('1. 检查是否需要迁移...')
  
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[]
  const hasSiteConfig = tables.some(t => t.name === 'site_config')
  
  if (!hasSiteConfig) {
    console.log('   ✓ site_config 表不存在，无需迁移')
    console.log('\n=== 迁移完成 ===')
    db.close()
    process.exit(0)
  }
  
  console.log('   发现 site_config 表，开始迁移\n')
  
  db.exec('BEGIN TRANSACTION')
  
  console.log('2. 读取 site_config 数据...')
  const siteConfigs = db.prepare('SELECT * FROM site_config').all() as any[]
  console.log(`   共读取 ${siteConfigs.length} 条配置\n`)
  
  console.log('3. 合并配置...')
  const mergedConfig: any = {}
  let currentTheme: string | null = null
  
  for (const config of siteConfigs) {
    if (config.config_key === 'current_theme') {
      currentTheme = config.config_value
      console.log(`   - currentTheme: ${currentTheme}`)
    } else {
      try {
        mergedConfig[config.config_key] = JSON.parse(config.config_value)
      } catch {
        mergedConfig[config.config_key] = config.config_value
      }
      console.log(`   - ${config.config_key}`)
    }
  }
  
  if (currentTheme) {
    mergedConfig.currentTheme = currentTheme
  }
  
  console.log('\n4. 备份旧的 site_config 表...')
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_config_backup (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT UNIQUE NOT NULL,
      config_value TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    )
  `)
  db.exec('INSERT INTO site_config_backup SELECT * FROM site_config')
  console.log('   ✓ 已备份到 site_config_backup 表\n')
  
  console.log('5. 删除旧的 site_config 表...')
  db.exec('DROP TABLE site_config')
  console.log('   ✓ 已删除旧表\n')
  
  console.log('6. 写入合并后的配置到 system_config 表...')
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO system_config (config_key, config_value)
    VALUES (?, ?)
  `)
  stmt.run('site_config', JSON.stringify(mergedConfig))
  console.log('   ✓ 已写入 site_config 配置\n')
  
  console.log('7. 更新 super_admin_token 为字符串格式...')
  const tokenConfig = db.prepare("SELECT config_value FROM system_config WHERE config_key = 'super_admin_token'").get() as any
  if (tokenConfig) {
    try {
      const parsed = JSON.parse(tokenConfig.config_value)
      if (parsed.superAdminToken !== undefined) {
        stmt.run('super_admin_token', parsed.superAdminToken || '')
        console.log('   ✓ 已更新 super_admin_token 格式\n')
      }
    } catch {
      console.log('   ℹ️  super_admin_token 已经是字符串格式\n')
    }
  }
  
  db.exec('COMMIT')
  
  console.log('=== 迁移完成 ===')
  console.log('✅ site_config 表已成功合并到 system_config 表')
  console.log('✅ 备份保留在 site_config_backup 表中')
  
} catch (error) {
  db.exec('ROLLBACK')
  console.error('\n❌ 迁移失败:', error)
  throw error
} finally {
  db.close()
}
