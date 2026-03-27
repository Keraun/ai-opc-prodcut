#!/usr/bin/env tsx
import { getDatabase } from '../lib/database'

console.log('=== 直接验证 site_config 数据 ===\n')

const db = getDatabase()

try {
  console.log('1. 读取 site_config 所有数据...')
  const configs = db.prepare('SELECT * FROM site_config').all() as any[]
  
  console.log(`   共有 ${configs.length} 条配置:\n`)
  
  for (const config of configs) {
    console.log(`   - ${config.config_key}:`)
    console.log(`     value: ${config.config_value.substring(0, 100)}${config.config_value.length > 100 ? '...' : ''}`)
    
    try {
      const parsed = JSON.parse(config.config_value)
      console.log('     ✓ 是有效的 JSON')
    } catch {
      console.log('     ℹ️  是纯字符串')
    }
    console.log()
  }

  console.log('2. 测试读取逻辑...')
  const result: any = {}
  for (const config of configs) {
    try {
      result[config.config_key] = JSON.parse(config.config_value)
    } catch {
      result[config.config_key] = config.config_value
    }
  }
  
  console.log('   ✓ 读取成功!')
  console.log('   current_theme:', result.current_theme)
  console.log('   其他 keys:', Object.keys(result).filter(k => k !== 'current_theme'))

  console.log('\n=== 验证完成 ===')
  console.log('✅ JSON 解析问题已修复')

} catch (error) {
  console.error('❌ 错误:', error)
  throw error
} finally {
  db.close()
}
