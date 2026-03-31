import { BaseRepository } from './BaseRepository'
import { safeJsonParse, safeJsonStringify } from '../json-utils'

export interface Account {
  id?: number
  username: string
  password: string
  email?: string | null
  remark?: string | null
  mustChangePassword: boolean
  lastLoginTime?: string | null
  lastLoginIP?: string | null
  currentLoginIP?: string | null
  currentLoginTime?: string | null
  createdAt?: string
  updatedAt?: string
}

export class AccountRepository extends BaseRepository<Account> {
  constructor() {
    super('accounts', 'id')
  }

  protected mapRowToEntity(row: any): Account {
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      email: row.email,
      remark: row.remark,
      mustChangePassword: Boolean(row.must_change_password),
      lastLoginTime: row.last_login_time,
      lastLoginIP: row.last_login_ip,
      currentLoginIP: row.current_login_ip,
      currentLoginTime: row.current_login_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<Account>): Record<string, any> {
    return {
      username: entity.username,
      password: entity.password,
      email: entity.email || null,
      remark: entity.remark || null,
      must_change_password: Boolean(entity.mustChangePassword),
      last_login_time: entity.lastLoginTime || null,
      last_login_ip: entity.lastLoginIP || null,
      current_login_ip: entity.currentLoginIP || null,
      current_login_time: entity.currentLoginTime || null
    }
  }

  findByUsername(username: string): Account | null {
    return this.findByField('username', username)
  }

  updateLoginInfo(username: string, ip: string, time: string): boolean {
    const account = this.findByUsername(username)
    if (account) {
      return this.update(account.id!, {
        lastLoginIP: account.currentLoginIP,
        lastLoginTime: account.currentLoginTime,
        currentLoginIP: ip,
        currentLoginTime: time
      })
    }
    return false
  }
}
