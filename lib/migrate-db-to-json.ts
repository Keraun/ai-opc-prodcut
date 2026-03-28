import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const DATABASE_PATH = path.join(process.cwd(), 'database', 'app.db')
const DATA_DIR = path.join(process.cwd(), 'data')

interface TableInfo {
  name: string
  columns: string[]
}

function getTableInfo(db: Database.Database): TableInfo[] {
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ).all() as { name: string }[]

  return tables.map(table => {
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all() as {
      name: string
    }[]
    return {
      name: table.name,
      columns: columns.map(col => col.name)
    }
  })
}

function migrateTable(db: Database.Database, tableName: string) {
  console.log(`Migrating table: ${tableName}`)
  
  const data = db.prepare(`SELECT * FROM ${tableName}`).all()
  const filePath = path.join(DATA_DIR, `${tableName}.json`)
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`Migrated ${data.length} records from ${tableName} to ${filePath}`)
}

export function migrateDbToJson() {
  console.log('Starting migration from SQLite to JSON files...')
  
  // 确保数据目录存在
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  
  const db = new Database(DATABASE_PATH)
  
  try {
    const tables = getTableInfo(db)
    console.log(`Found ${tables.length} tables:`, tables.map(t => t.name))
    
    // 迁移所有表
    tables.forEach(table => {
      migrateTable(db, table.name)
    })
    
    console.log('Migration completed successfully!')
    
    // 验证迁移结果
    console.log('\nVerifying migration results:')
    tables.forEach(table => {
      const filePath = path.join(DATA_DIR, `${table.name}.json`)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(content)
        console.log(`${table.name}.json: ${data.length} records`)
      } else {
        console.log(`${table.name}.json: NOT FOUND`)
      }
    })
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    db.close()
  }
}

if (require.main === module) {
  migrateDbToJson()
}