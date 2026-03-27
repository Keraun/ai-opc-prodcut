import { getDatabase } from '../lib/database'

console.log('=== 检查页面模块数据 ===\n')

const db = getDatabase()

try {
  const pages = db.prepare('SELECT page_id, name FROM pages').all() as any[]
  console.log(`找到 ${pages.length} 个页面:\n`)
  
  for (const page of pages) {
    console.log(`📄 页面: ${page.name} (${page.page_id})`)
    
    const pageModules = db.prepare(`
      SELECT pm.*, mr.default_data
      FROM page_modules pm 
      LEFT JOIN module_registry mr ON pm.module_id = mr.module_id
      WHERE pm.page_id = ?
      ORDER BY pm.module_order
    `).all(page.page_id) as any[]
    
    console.log(`   模块数量: ${pageModules.length}`)
    
    for (const pm of pageModules) {
      console.log(`\n   ├─ 模块: ${pm.module_name} (${pm.module_id})`)
      console.log(`   │  实例ID: ${pm.module_instance_id}`)
      
      if (pm.data) {
        try {
          const data = JSON.parse(pm.data)
          console.log(`   │  数据:`, JSON.stringify(data, null, 6))
        } catch (e) {
          console.log(`   │  数据解析失败: ${pm.data}`)
        }
      } else {
        console.log(`   │  数据: (空)`)
      }
      
      if (pm.default_data) {
        try {
          const defaultData = JSON.parse(pm.default_data)
          console.log(`   │  默认数据:`, JSON.stringify(defaultData, null, 8))
        } catch (e) {
          console.log(`   │  默认数据解析失败: ${pm.default_data}`)
        }
      }
    }
    console.log('\n' + '='.repeat(60) + '\n')
  }
} finally {
  db.close()
}
