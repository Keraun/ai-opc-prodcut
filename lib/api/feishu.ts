import { request } from './request'

/**
 * 获取飞书表格的 Schema 字段信息
 * @returns 获取结果，包含 success、data（字段数组）和 message
 */
export async function getFeishuSchema(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const result = await request<any[]>('/api/feishu/schema')
    return { success: result.success, data: result.data, message: result.message }
  } catch (error) {
    console.error('Error fetching feishu schema:', error)
    return { success: false, message: '获取表格字段失败' }
  }
}

/**
 * 创建飞书数据表
 * @returns 创建结果，包含 success、data（tableId 和 tableLink）和 message
 */
export async function createFeishuTable(): Promise<{
  success: boolean
  data?: { tableId: string; tableLink: string }
  message?: string
}> {
  try {
    const result = await request<{ tableId: string; tableLink: string }>('/api/feishu/create-table', {
      method: 'POST',
    })
    return { success: result.success, data: result.data, message: result.message }
  } catch (error) {
    console.error('Error creating feishu table:', error)
    return { success: false, message: '生成飞书数据表失败' }
  }
}
