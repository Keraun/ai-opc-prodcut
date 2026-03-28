import { BaseRepository } from './BaseRepository'
import { safeJsonParse, safeJsonStringify } from '../json-utils'

export interface SystemLog {
  id?: number
  logId: number
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
      log_id: entity.logId,
      username: entity.username || null,
      type: entity.type,
      description: entity.description || null,
      ip: entity.ip || null,
      timestamp: entity.timestamp || null,
      details: entity.details ? safeJsonStringify(entity.details) : null
    }
  }

  createLog(type: string, description: string, username?: string, ip?: string, details?: any): SystemLog {
    const logId = Date.now()
    return this.create({
      logId,
      type,
      description,
      username,
      ip,
      timestamp: new Date().toISOString(),
      details
    })
  }

  getLogsByType(type: string): SystemLog[] {
    return this.findWhere({ type })
  }

  getLogsByUsername(username: string): SystemLog[] {
    return this.findWhere({ username })
  }
}
