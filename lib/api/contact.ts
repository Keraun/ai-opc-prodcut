import { request } from './request'

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
