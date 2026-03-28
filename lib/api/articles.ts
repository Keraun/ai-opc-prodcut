import { request } from './request'

export async function getArticles(): Promise<any[]> {
  try {
    const result = await request<any[]>('/api/articles')
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export async function createArticle(data: any): Promise<{ success: boolean; article?: any; message?: string }> {
  try {
    const result = await request<any>('/api/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return { success: result.success, article: result.data, message: result.message }
  } catch (error) {
    console.error('Error creating article:', error)
    return { success: false, message: '创建文章失败' }
  }
}

export async function updateArticle(data: any): Promise<{ success: boolean; article?: any; message?: string }> {
  try {
    const result = await request<any>('/api/articles', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return { success: result.success, article: result.data, message: result.message }
  } catch (error) {
    console.error('Error updating article:', error)
    return { success: false, message: '更新文章失败' }
  }
}

export async function deleteArticle(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await request<void>(`/api/articles?id=${id}`, {
      method: 'DELETE',
    })
    return { success: result.success, message: result.message }
  } catch (error) {
    console.error('Error deleting article:', error)
    return { success: false, message: '删除文章失败' }
  }
}

export async function getArticleById(id: string): Promise<any | null> {
  try {
    const result = await request<any>(`/api/articles?id=${id}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}
