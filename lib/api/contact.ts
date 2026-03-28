import { request } from './request'

/**
 * 提交联系表单
 * @param formData - 表单数据（包含姓名、邮箱、消息等字段）
 * @returns 提交结果，包含 success 和 message
 */
export async function submitContactForm(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const result = await request<void>('/api/contact', {
      method: 'POST',
      body: formData
    })
    
    return {
      success: result.success,
      message: result.message || (result.success ? '提交成功' : '提交失败')
    }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return { success: false, message: '提交失败，请稍后重试' }
  }
}
