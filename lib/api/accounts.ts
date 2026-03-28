import type { Account } from './types'
import { request } from './request'

/**
 * 获取所有账号列表
 * @returns 账号列表结果，包含 success 和 accounts
 */
export async function getAccounts(): Promise<{ success: boolean; accounts?: any[] }> {
  try {
    const result = await request<any[]>('/api/admin/accounts')
    return { success: result.success, accounts: result.data }
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return { success: false }
  }
}

/**
 * 添加新账号
 * @param account - 账号信息
 * @param account.username - 用户名
 * @param account.password - 密码
 * @param account.email - 邮箱地址
 * @param account.remark - 备注（可选）
 * @returns 添加结果，包含 success 和 message
 */
export async function addAccount(account: Account): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>('/api/admin/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error adding account:', error)
    return { success: false, message: '添加账号失败' }
  }
}

/**
 * 删除账号
 * @param username - 要删除的用户名
 * @returns 删除结果，包含 success 和 message
 */
export async function deleteAccount(username: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>(`/api/admin/accounts/${username}`, {
      method: 'DELETE',
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error deleting account:', error)
    return { success: false, message: '删除账号失败' }
  }
}

/**
 * 更新账号信息
 * @param username - 要更新的用户名
 * @param data - 更新数据
 * @param data.password - 新密码（可选）
 * @param data.email - 邮箱地址
 * @param data.remark - 备注（可选）
 * @returns 更新结果，包含 success 和 message
 */
export async function updateAccount(username: string, data: {
  password?: string
  email: string
  remark?: string
}): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>(`/api/admin/accounts/${username}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error updating account:', error)
    return { success: false, message: '修改账号失败' }
  }
}
