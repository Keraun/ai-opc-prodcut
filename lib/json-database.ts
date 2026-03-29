import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'database', 'runtime')

interface JsonDatabaseOptions {
  pretty?: boolean
}

class JsonDatabase {
  private data: Record<string, any> = {}
  private fileMap: Record<string, string> = {
    accounts: 'accounts.json',
    system_config: 'system_config.json',
    system_logs: 'system_logs.json',
    theme_config: 'theme_config.json',
    pages: 'pages.json',
    module_registry: 'module_registry.json',
    page_modules: 'page_modules.json',
    articles: 'articles.json',
    products: 'products.json'
  }
  private options: JsonDatabaseOptions

  constructor(options: JsonDatabaseOptions = {}) {
    this.options = { pretty: true, ...options }
    this.ensureDataDir()
    this.loadAllData()
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  }

  private loadAllData() {
    for (const [table, file] of Object.entries(this.fileMap)) {
      const filePath = path.join(DATA_DIR, file)
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8')
          this.data[table] = JSON.parse(content)
        } catch (error) {
          console.error(`Error loading ${table} data:`, error)
          this.data[table] = []
        }
      } else {
        this.data[table] = []
      }
    }
  }

  reload() {
    this.loadAllData()
  }

  reloadTable(table: string) {
    const filePath = path.join(DATA_DIR, this.fileMap[table])
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        this.data[table] = JSON.parse(content)
      } catch (error) {
        console.error(`Error reloading ${table} data:`, error)
      }
    }
  }

  private saveTable(table: string) {
    const filePath = path.join(DATA_DIR, this.fileMap[table])
    const content = this.options.pretty 
      ? JSON.stringify(this.data[table], null, 2)
      : JSON.stringify(this.data[table])
    
    fs.writeFileSync(filePath, content, 'utf-8')
  }

  // CRUD operations
  insert(table: string, data: any) {
    if (!this.data[table]) {
      this.data[table] = []
    }
    
    const newItem = { ...data, id: this.generateId(table) }
    this.data[table].push(newItem)
    this.saveTable(table)
    return newItem
  }

  update(table: string, id: any, data: any) {
    const index = this.data[table].findIndex((item: any) => item.id === id)
    if (index !== -1) {
      this.data[table][index] = { ...this.data[table][index], ...data }
      this.saveTable(table)
      return this.data[table][index]
    }
    return null
  }

  delete(table: string, query: any) {
    const initialLength = this.data[table].length
    if (typeof query === 'object' && query !== null) {
      this.data[table] = this.data[table].filter((item: any) => {
        for (const [key, value] of Object.entries(query)) {
          if (item[key] !== value) {
            return true
          }
        }
        return false
      })
    } else {
      // 支持通过 id 删除
      this.data[table] = this.data[table].filter((item: any) => item.id !== query)
    }
    if (this.data[table].length !== initialLength) {
      this.saveTable(table)
      return true
    }
    return false
  }

  find(table: string, query: any = {}) {
    return this.data[table].filter((item: any) => {
      for (const [key, value] of Object.entries(query)) {
        if (item[key] !== value) {
          return false
        }
      }
      return true
    })
  }

  findOne(table: string, query: any = {}) {
    return this.data[table].find((item: any) => {
      for (const [key, value] of Object.entries(query)) {
        if (item[key] !== value) {
          return false
        }
      }
      return true
    }) || null
  }

  getAll(table: string) {
    return this.data[table]
  }

  private generateId(table: string) {
    const items = this.data[table]
    if (items.length === 0) {
      return 1
    }
    return Math.max(...items.map((item: any) => item.id)) + 1
  }

  // Batch operations
  insertBatch(table: string, items: any[]) {
    if (!this.data[table]) {
      this.data[table] = []
    }
    
    const newItems = items.map(item => ({
      ...item,
      id: this.generateId(table)
    }))
    
    this.data[table].push(...newItems)
    this.saveTable(table)
    return newItems
  }

  // Utility methods
  clearTable(table: string) {
    this.data[table] = []
    this.saveTable(table)
  }

  // For migration
  importData(table: string, data: any[]) {
    this.data[table] = data
    this.saveTable(table)
  }
}

export const jsonDb = new JsonDatabase()
export default JsonDatabase