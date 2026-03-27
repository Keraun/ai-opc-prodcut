import { BaseRepository } from './BaseRepository'
import { safeJsonParse, safeJsonStringify } from '../json-utils'

export interface SystemConfig {
  id?: number
  configKey: string
  configValue: any
  createdAt?: string
  updatedAt?: string
}

export class SystemConfigRepository extends BaseRepository<SystemConfig> {
  constructor() {
    super('system_config', 'id')
  }

  protected mapRowToEntity(row: any): SystemConfig {
    return {
      id: row.id,
      configKey: row.config_key,
      configValue: safeJsonParse(row.config_value, {}),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<SystemConfig>): Record<string, any> {
    return {
      config_key: entity.configKey,
      config_value: typeof entity.configValue === 'string' 
        ? entity.configValue 
        : safeJsonStringify(entity.configValue)
    }
  }

  findByKey(configKey: string): SystemConfig | null {
    return this.findByField('config_key', configKey)
  }

  getValue<T>(configKey: string, defaultValue: T): T {
    const config = this.findByKey(configKey)
    return config ? (config.configValue as T) : defaultValue
  }

  setValue(configKey: string, value: any): boolean {
    const existing = this.findByKey(configKey)
    if (existing) {
      return this.update(existing.id!, { configKey, configValue: value })
    } else {
      this.create({ configKey, configValue: value })
      return true
    }
  }

  deleteByKey(configKey: string): boolean {
    const config = this.findByKey(configKey)
    return config ? this.delete(config.id!) : false
  }
}
