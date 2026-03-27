import { getDatabase } from '../lib/database'

console.log('=== 测试页面模块 API 数据结构 ===\n')

const db = getDatabase()

try {
  const page = db.prepare('SELECT * FROM pages WHERE page_id = ?').get('home') as any
  
  if (page) {
    console.log('📄 页面数据:')
    console.log(page)
    
    const pageModules = db.prepare(`
      SELECT pm.*, mr.default_data
      FROM page_modules pm 
      LEFT JOIN module_registry mr ON pm.module_id = mr.module_id
      WHERE pm.page_id = ?
      ORDER BY pm.module_order
    `).all('home') as any[]
    
    console.log(`\n📦 页面模块数量: ${pageModules.length}`)
    
    for (const pm of pageModules) {
      console.log(`\n   ├─ 模块: ${pm.module_name} (${pm.module_id})`)
      console.log(`   │  实例ID: ${pm.module_instance_id}`)
      
      if (pm.data) {
        try {
          const data = JSON.parse(pm.data)
          console.log(`   │  数据:`, JSON.stringify(data, null, 4))
        } catch (e) {
          console.log(`   │  数据解析失败: ${pm.data}`)
        }
      } else {
        console.log(`   │  数据: (空)`)
      }
    }
    
    console.log('\n' + '='.repeat(60))
    
    console.log('\n🔍 模拟 API 返回的数据结构:')
    const modules: any[] = pageModules.map((pm: any) => {
      const moduleData = pm.data 
        ? JSON.parse(pm.data) 
        : (pm.default_data ? JSON.parse(pm.default_data) : {})
      
      return {
        moduleName: pm.module_name,
        moduleId: pm.module_id,
        moduleInstanceId: pm.module_instance_id,
        data: moduleData
      }
    })
    
    console.log('\nmodules:', JSON.stringify(modules, null, 2))
  } else {
    console.log('未找到页面 site-root')
  }
  
} finally {
  db.close()
}
