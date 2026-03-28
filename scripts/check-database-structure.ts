#!/usr/bin/env tsx
import { getDatabase, initializeDatabase } from '../lib/database'
import fs from 'fs'
import path from 'path'

console.log('=== 检查并更新数据库表结构 ===\n')

const db = getDatabase()

try {
  console.log('1. 查看当前数据库表...')
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[]
  console.log('   当前表:', tables.map(t => t.name))

  console.log('\n2. 检查 system_config 表结构...')
  const systemConfigSchema = db.prepare("PRAGMA table_info(system_config)").all() as any[]
  console.log('   system_config 字段:', systemConfigSchema.map(f => f.name))

  console.log('\n3. 检查 theme_config 表结构...')
  try {
    const themeConfigSchema = db.prepare("PRAGMA table_info(theme_config)").all() as any[]
    console.log('   theme_config 字段:', themeConfigSchema.map(f => f.name))
    
    if (!themeConfigSchema.some(f => f.name === 'is_current')) {
      console.log('\n   ⚠️  theme_config 表缺少 is_current 字段！需要迁移')
    } else {
      console.log('   ✓ theme_config 表结构正确，包含 is_current 字段')
    }
  } catch (e) {
    console.log('   theme_config 表不存在')
  }

  console.log('\n4. 检查 theme_config 数据...')
  try {
    const themes = db.prepare('SELECT theme_id, theme_name, is_current FROM theme_config').all() as any[]
    console.log('   主题数量:', themes.length)
    themes.forEach(t => {
      const currentMark = t.is_current === 1 ? ' (当前主题)' : ''
      console.log(`   - ${t.theme_id}: ${t.theme_name}${currentMark}`)
    })
  } catch (e) {
    console.log('   检查失败:', e)
  }

  console.log('\n=== 检查完成 ===')

} catch (error) {
  console.error('错误:', error)
  throw error
} finally {
  db.close()
}
