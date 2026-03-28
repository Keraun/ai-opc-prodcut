import { request } from './request'

/**
 * 获取所有文章列表
 * @returns 文章数组，失败时返回空数组
 */
export async function getArticles(): Promise<any[]> {
  try {
    const result = await request<any[]>('/api/articles')
    return result.success && result.data ? result.data : []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

/**
 * 创建新文章
 * @param data - 文章数据
 * @returns 创建结果，包含 success、article 和 message
 */
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

/**
 * 更新文章
 * @param data - 文章更新数据（需包含 id 字段）
 * @returns 更新结果，包含 success、article 和 message
 */
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

/**
 * 删除文章
 * @param id - 文章 ID
 * @returns 删除结果，包含 success 和 message
 */
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

/**
 * 根据 ID 获取文章详情
 * @param id - 文章 ID
 * @returns 文章数据对象，失败时返回 null
 */
export async function getArticleById(id: string): Promise<any | null> {
  try {
    const result = await request<any>(`/api/articles?id=${id}`)
    return result.success && result.data ? result.data : null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}
