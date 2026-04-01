import type { ApiResponse, PageConfig, Product, Article, SiteConfig } from './types'

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    return { success: false, message: '请求失败' }
  }
}

export async function getPageConfig(pageId: string): Promise<ApiResponse<PageConfig>> {
  return request<PageConfig>(`/api/client/page-config?pageId=${pageId}`)
}

export async function getProducts(category?: string): Promise<ApiResponse<Product[]>> {
  const url = category 
    ? `/api/client/products?category=${encodeURIComponent(category)}`
    : '/api/client/products'
  return request<Product[]>(url)
}

export async function getProductById(id: number): Promise<ApiResponse<Product>> {
  return request<Product>(`/api/client/products?id=${id}`)
}

export async function getArticles(): Promise<ApiResponse<Article[]>> {
  return request<Article[]>('/api/client/articles')
}

export async function getArticleBySlug(slug: string): Promise<ApiResponse<Article>> {
  return request<Article>(`/api/client/articles?slug=${encodeURIComponent(slug)}`)
}

export async function getArticleById(id: number): Promise<ApiResponse<Article>> {
  return request<Article>(`/api/client/articles?id=${id}`)
}

export async function getConfig(type?: string): Promise<ApiResponse<SiteConfig>> {
  const url = type 
    ? `/api/client/config?type=${encodeURIComponent(type)}`
    : '/api/client/config'
  return request<SiteConfig>(url)
}

export async function getProductCategories(): Promise<ApiResponse<string[]>> {
  return request<string[]>('/api/client/product-categories')
}

export async function getThemeConfig(): Promise<ApiResponse<any>> {
  return request<any>('/api/client/themes')
}
