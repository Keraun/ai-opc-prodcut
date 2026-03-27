import { getDatabase } from '../database'
import { safeJsonParse, safeJsonStringify } from '../json-utils'

export abstract class BaseRepository<T extends { id?: string | number }> {
  protected tableName: string
  protected idColumn: string

  constructor(tableName: string, idColumn: string = 'id') {
    this.tableName = tableName
    this.idColumn = idColumn
  }

  protected withDatabase<R>(handler: (db: any) => R): R {
    const db = getDatabase()
    try {
      return handler(db)
    } finally {
      db.close()
    }
  }

  protected mapRowToEntity(row: any): T {
    return row as T
  }

  protected mapEntityToRow(entity: Partial<T>): Record<string, any> {
    const row: Record<string, any> = {}
    for (const [key, value] of Object.entries(entity)) {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null) {
          row[key] = safeJsonStringify(value)
        } else {
          row[key] = value
        }
      }
    }
    return row
  }

  findById(id: string | number): T | null {
    return this.withDatabase(db => {
      const row = db.prepare(`SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = ?`).get(id)
      return row ? this.mapRowToEntity(row) : null
    })
  }

  findAll(): T[] {
    return this.withDatabase(db => {
      const rows = db.prepare(`SELECT * FROM ${this.tableName}`).all()
      return rows.map((row: any) => this.mapRowToEntity(row))
    })
  }

  create(data: Partial<T>): T {
    return this.withDatabase(db => {
      const row = this.mapEntityToRow(data)
      const columns = Object.keys(row)
      const placeholders = columns.map(() => '?').join(', ')
      const values = Object.values(row)
      
      const stmt = db.prepare(`INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`)
      const result = stmt.run(...values)
      
      const newId = result.lastInsertRowid
      return this.findById(newId)!
    })
  }

  update(id: string | number, data: Partial<T>): boolean {
    return this.withDatabase(db => {
      const row = this.mapEntityToRow(data)
      const setClauses = Object.keys(row).map(key => `${key} = ?`).join(', ')
      const values = [...Object.values(row), id]
      
      const stmt = db.prepare(`UPDATE ${this.tableName} SET ${setClauses} WHERE ${this.idColumn} = ?`)
      const result = stmt.run(...values)
      return result.changes > 0
    })
  }

  delete(id: string | number): boolean {
    return this.withDatabase(db => {
      const stmt = db.prepare(`DELETE FROM ${this.tableName} WHERE ${this.idColumn} = ?`)
      const result = stmt.run(id)
      return result.changes > 0
    })
  }

  findByField(fieldName: string, value: any): T | null {
    return this.withDatabase(db => {
      const row = db.prepare(`SELECT * FROM ${this.tableName} WHERE ${fieldName} = ?`).get(value)
      return row ? this.mapRowToEntity(row) : null
    })
  }

  findAllByField(fieldName: string, value: any): T[] {
    return this.withDatabase(db => {
      const rows = db.prepare(`SELECT * FROM ${this.tableName} WHERE ${fieldName} = ?`).all(value)
      return rows.map((row: any) => this.mapRowToEntity(row))
    })
  }
}
