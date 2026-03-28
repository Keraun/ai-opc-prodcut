import { request } from './request'

export async function getFeishuSchema(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const result = await request<any[]>('/api/feishu/schema')
    return { success: result.success, data: result.data, message: result.message }
  } catch (error) {
    console.error('Error fetching feishu schema:', error)
    return { success: false, message: '获取表格字段失败' }
  }
}

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
