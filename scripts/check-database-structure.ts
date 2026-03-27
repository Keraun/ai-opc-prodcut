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

  console.log('\n2. 检查 site_config 表结构...')
  const siteConfigSchema = db.prepare("PRAGMA table_info(site_config)").all() as any[]
  console.log('   site_config 字段:', siteConfigSchema.map(f => f.name))

  console.log('\n3. 检查 theme_config 表结构...')
  try {
    const themeConfigSchema = db.prepare("PRAGMA table_info(theme_config)").all() as any[]
    console.log('   theme_config 字段:', themeConfigSchema.map(f => f.name))
    
    if (themeConfigSchema.some(f => f.name === 'current_theme')) {
      console.log('\n   ⚠️  检测到旧的 theme_config 表结构！需要迁移')
    }
  } catch (e) {
    console.log('   theme_config 表不存在')
  }

  console.log('\n4. 检查 site_config 中的 current_theme...')
  try {
    const currentTheme = db.prepare("SELECT * FROM site_config WHERE config_key = 'current_theme'").get()
    if (currentTheme) {
      console.log('   ✓ current_theme 存在:', currentTheme)
    } else {
      console.log('   ⚠️  current_theme 不存在')
    }
  } catch (e) {
    console.log('   检查失败:', e)
  }

  console.log('\n5. 检查 theme_config 数据...')
  try {
    const themes = db.prepare('SELECT * FROM theme_config').all() as any[]
    console.log('   主题数量:', themes.length)
    themes.forEach(t => console.log('   -', t.theme_id, ':', t.theme_name))
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
