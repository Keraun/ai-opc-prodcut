import { BaseRepository } from './BaseRepository'
import { safeJsonParse } from '../json-utils'

export interface SystemLog {
  id?: number
  logId?: number | null
  username?: string | null
  type: string
  description?: string | null
  ip?: string | null
  timestamp?: string | null
  details?: any | null
  createdAt?: string
}

export class SystemLogRepository extends BaseRepository<SystemLog> {
  constructor() {
    super('system_logs', 'id')
  }

  protected mapRowToEntity(row: any): SystemLog {
    return {
      id: row.id,
      logId: row.log_id,
      username: row.username,
      type: row.type,
      description: row.description,
      ip: row.ip,
      timestamp: row.timestamp,
      details: safeJsonParse(row.details, null),
      createdAt: row.created_at
    }
  }

  protected mapEntityToRow(entity: Partial<SystemLog>): Record<string, any> {
    return {
      log_id: entity.logId ?? null,
      username: entity.username ?? null,
      type: entity.type,
      description: entity.description ?? null,
      ip: entity.ip ?? null,
      timestamp: entity.timestamp ?? null,
      details: entity.details ? JSON.stringify(entity.details) : null
    }
  }

  findAllOrdered(limit?: number): SystemLog[] {
    return this.withDatabase(db => {
      let query = 'SELECT * FROM system_logs ORDER BY id DESC'
      if (limit) {
        query += ` LIMIT ${limit}`
      }
      const rows = db.prepare(query).all()
      return rows.map((row: any) => this.mapRowToEntity(row))
    })
  }

  findByType(type: string): SystemLog[] {
    return this.findAllByField('type', type)
  }

  findByUsername(username: string): SystemLog[] {
    return this.findAllByField('username', username)
  }

  deleteAll(): void {
    this.withDatabase(db => {
      db.exec('DELETE FROM system_logs')
    })
  }

  bulkInsert(logs: SystemLog[]): void {
    this.withDatabase(db => {
      db.exec('DELETE FROM system_logs')
      
      const stmt = db.prepare(`
        INSERT INTO system_logs 
        (log_id, username, type, description, ip, timestamp, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const log of logs) {
        stmt.run(
          log.logId ?? null,
          log.username ?? null,
          log.type,
          log.description ?? null,
          log.ip ?? null,
          log.timestamp ?? null,
          log.details ? JSON.stringify(log.details) : null
        )
      }
    })
  }
}
