import { BaseRepository } from './BaseRepository'
import { safeJsonParse } from '../json-utils'
import { formatDateTime } from '../api-utils'

export interface Account {
  id?: number
  username: string
  password: string
  email?: string | null
  remark?: string | null
  mustChangePassword?: boolean
  lastLoginTime?: string | null
  lastLoginIp?: string | null
  currentLoginIp?: string | null
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
      mustChangePassword: row.must_change_password === 1,
      lastLoginTime: row.last_login_time,
      lastLoginIp: row.last_login_ip,
      currentLoginIp: row.current_login_ip,
      currentLoginTime: row.current_login_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  protected mapEntityToRow(entity: Partial<Account>): Record<string, any> {
    return {
      username: entity.username,
      password: entity.password,
      email: entity.email ?? null,
      remark: entity.remark ?? null,
      must_change_password: entity.mustChangePassword ? 1 : 0,
      last_login_time: entity.lastLoginTime ?? null,
      last_login_ip: entity.lastLoginIp ?? null,
      current_login_ip: entity.currentLoginIp ?? null,
      current_login_time: entity.currentLoginTime ?? null
    }
  }

  findByUsername(username: string): Account | null {
    return this.findByField('username', username)
  }

  updateLoginInfo(username: string, ip: string): boolean {
    const account = this.findByUsername(username)
    if (!account) return false

    const now = formatDateTime()
    return this.update(account.id!, {
      lastLoginTime: account.currentLoginTime,
      lastLoginIp: account.currentLoginIp,
      currentLoginIp: ip,
      currentLoginTime: now
    })
  }

  findAll(): Account[] {
    return super.findAll()
  }

  deleteAll(): void {
    this.withDatabase(db => {
      db.exec('DELETE FROM accounts')
    })
  }

  bulkCreate(accounts: Account[]): void {
    this.withDatabase(db => {
      db.exec('DELETE FROM accounts')
      
      const stmt = db.prepare(`
        INSERT INTO accounts 
        (username, password, email, remark, must_change_password, last_login_time, last_login_ip, current_login_ip, current_login_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (const account of accounts) {
        stmt.run(
          account.username,
          account.password,
          account.email || null,
          account.remark || null,
          account.mustChangePassword ? 1 : 0,
          account.lastLoginTime || null,
          account.lastLoginIp || null,
          account.currentLoginIp || null,
          account.currentLoginTime || null
        )
      }
    })
  }
}
