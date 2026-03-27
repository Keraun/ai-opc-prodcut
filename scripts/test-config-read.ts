#!/usr/bin/env tsx
import { getDatabase } from '../lib/database'
import { readConfig } from '../lib/config-manager'

console.log('=== 测试配置读取 ===\n')

try {
  console.log('1. 测试读取 site 配置...')
  const siteConfig = readConfig('site')
  console.log('   ✓ site 配置读取成功，包含 keys:', Object.keys(siteConfig))
  
  console.log('\n2. 测试读取 theme 配置...')
  const themeConfig = readConfig('theme')
  console.log('   ✓ theme 配置读取成功')
  console.log('   - 当前主题:', themeConfig.currentTheme)
  console.log('   - 主题数量:', Object.keys(themeConfig.themes).length)
  
  console.log('\n=== 所有测试通过 ===')
} catch (error) {
  console.error('❌ 测试失败:', error)
  throw error
}
