import type { BackupInfo } from './types'
import { request } from './request'

/**
 * 导入数据库文件
 * @param file - 数据库文件
 * @returns 导入结果，包含 success、message 和 backupCreated（备份信息）
 */
export async function importDatabase(file: File): Promise<{
  success: boolean
  message?: string
  backupCreated?: BackupInfo
}> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await request<{
      message: string
      backupCreated: BackupInfo
    }>('/api/admin/config/import', {
      method: 'POST',
      body: formData
    })
    return {
      success: result.success,
      message: result.message,
      backupCreated: result.data?.backupCreated
    }
  } catch (error) {
    console.error('Error importing database:', error)
    return { success: false, message: '数据库导入失败' }
  }
}

/**
 * 一键恢复网站到默认状态
 * @param username - 操作用户名
 * @returns 恢复结果，包含 success、message、backupCreated 和 tables
 */
export async function resetWebsite(username: string): Promise<{
  success: boolean
  message?: string
  backupCreated?: BackupInfo
  tables?: string[]
}> {
  try {
    const result = await request<{
      message: string
      backupCreated: BackupInfo
      tables: string[]
    }>('/api/admin/reset-website', {
      method: 'POST',
      body: JSON.stringify({ username })
    })
    return {
      success: result.success,
      message: result.message,
      backupCreated: result.data?.backupCreated,
      tables: result.data?.tables
    }
  } catch (error) {
    console.error('Error resetting website:', error)
    return { success: false, message: '网站恢复失败' }
  }
}

/**
 * 检查默认数据库是否存在
 * @returns 检查结果，包含 success、exists 和 message
 */
export async function checkDefaultDb(): Promise<{
  success: boolean
  exists?: boolean
  message?: string
}> {
  try {
    const result = await request<{ exists: boolean }>('/api/admin/reset-website?action=check-default')
    return {
      success: result.success,
      exists: result.data?.exists,
      message: result.message
    }
  } catch (error) {
    console.error('Error checking default db:', error)
    return { success: false, message: '检查默认数据库失败' }
  }
}

/**
 * 验证数据库完整性
 * @returns 验证结果，包含 success、valid、tables 和 message
 */
export async function validateDatabase(): Promise<{
  success: boolean
  valid?: boolean
  message?: string
  tables?: string[]
}> {
  try {
    const result = await request<{ valid: boolean; tables: string[] }>('/api/admin/reset-website?action=validate')
    return {
      success: result.success,
      valid: result.data?.valid,
      tables: result.data?.tables,
      message: result.message
    }
  } catch (error) {
    console.error('Error validating database:', error)
    return { success: false, message: '验证数据库失败' }
  }
}
