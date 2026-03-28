import type { Account } from './types'
import { request } from './request'

export async function getAccounts(): Promise<{ success: boolean; accounts?: any[] }> {
  try {
    const result = await request<any[]>('/api/admin/accounts')
    return { success: result.success, accounts: result.data }
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return { success: false }
  }
}

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
