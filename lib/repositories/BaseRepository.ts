import { jsonDb } from '../json-database'

export abstract class BaseRepository<T> {
  constructor(
    protected tableName: string,
    protected primaryKey: string = 'id'
  ) {}

  protected abstract mapRowToEntity(row: any): T
  protected abstract mapEntityToRow(entity: Partial<T>): Record<string, any>

  create(entity: Partial<T>): T {
    const row = this.mapEntityToRow(entity)
    const inserted = jsonDb.insert(this.tableName, row)
    return this.mapRowToEntity(inserted)
  }

  findById(id: number): T | null {
    const row = jsonDb.findOne(this.tableName, { [this.primaryKey]: id })
    return row ? this.mapRowToEntity(row) : null
  }

  findAll(): T[] {
    const rows = jsonDb.getAll(this.tableName)
    return rows.map((row: any) => this.mapRowToEntity(row))
  }

  findByField(field: string, value: any): T | null {
    const row = jsonDb.findOne(this.tableName, { [field]: value })
    return row ? this.mapRowToEntity(row) : null
  }

  findWhere(conditions: Record<string, any>): T[] {
    const rows = jsonDb.find(this.tableName, conditions)
    return rows.map((row: any) => this.mapRowToEntity(row))
  }

  update(id: number, entity: Partial<T>): boolean {
    const row = this.mapEntityToRow(entity)
    const result = jsonDb.update(this.tableName, id, row)
    return result !== null
  }

  delete(id: number): boolean {
    return jsonDb.delete(this.tableName, id)
  }

  deleteWhere(conditions: Record<string, any>): boolean {
    return jsonDb.delete(this.tableName, conditions)
  }

  count(): number {
    return jsonDb.getAll(this.tableName).length
  }

  clear(): void {
    jsonDb.clearTable(this.tableName)
  }
}
