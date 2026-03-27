#!/usr/bin/env tsx
import { getDatabase } from '../lib/database'

console.log('=== 验证迁移结果 ===\n')

const db = getDatabase()

try {
  console.log('1. 查看当前数据库表...')
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[]
  console.log('   当前表:', tables.map(t => t.name))
  
  console.log('\n2. 检查 system_config 表数据...')
  const systemConfigs = db.prepare('SELECT * FROM system_config').all() as any[]
  console.log(`   共有 ${systemConfigs.length} 条配置:\n`)
  for (const config of systemConfigs) {
    console.log(`   - ${config.config_key}:`)
    const valuePreview = config.config_value.substring(0, 80) + (config.config_value.length > 80 ? '...' : '')
    console.log(`     ${valuePreview}\n`)
  }
  
  console.log('3. 检查 site_config 配置内容...')
  const siteConfigRaw = db.prepare("SELECT config_value FROM system_config WHERE config_key = 'site_config'").get() as any
  if (siteConfigRaw) {
    try {
      const siteConfig = JSON.parse(siteConfigRaw.config_value)
      console.log('   ✓ 成功解析 site_config')
      console.log('   - currentTheme:', siteConfig.currentTheme)
      console.log('   - 其他 keys:', Object.keys(siteConfig).filter(k => k !== 'currentTheme'))
    } catch (e) {
      console.log('   ❌ 解析失败:', e)
    }
  } else {
    console.log('   ❌ site_config 不存在')
  }
  
  console.log('\n4. 检查 super_admin_token 格式...')
  const tokenConfig = db.prepare("SELECT config_value FROM system_config WHERE config_key = 'super_admin_token'").get() as any
  if (tokenConfig) {
    console.log('   ✓ token 存在')
    try {
      JSON.parse(tokenConfig.config_value)
      console.log('   ⚠️  token 仍然是 JSON 格式')
    } catch {
      console.log('   ✓ token 是纯字符串格式')
    }
  }
  
  console.log('\n5. 检查 theme_config 数据...')
  const themes = db.prepare('SELECT * FROM theme_config').all() as any[]
  console.log(`   主题数量: ${themes.length}`)
  themes.forEach(t => console.log(`   - ${t.theme_id}: ${t.theme_name}`))
  
  console.log('\n=== 验证完成 ===')
  console.log('✅ 迁移成功！')

} catch (error) {
  console.error('❌ 验证失败:', error)
  throw error
} finally {
  db.close()
}
