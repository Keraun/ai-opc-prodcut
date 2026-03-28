export interface FeishuConfig {
  appId: string
  appSecret: string
  appToken?: string
  tableId?: string
}

export interface Field {
  field_name: string
  type: number
  property?: {
    [key: string]: any
  }
}

export interface TableInfo {
  table_id: string
  name: string
  fields?: Field[]
}

export interface RecordData {
  fields: {
    [key: string]: any
  }
}

export interface FeishuAPIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: any
}

const FEISHU_BASE_URL = "https://open.feishu.cn/open-apis"

export class FeishuAPI {
  private appId: string
  private appSecret: string
  private appToken?: string
  private accessToken?: string

  constructor(config: FeishuConfig) {
    this.appId = config.appId
    this.appSecret = config.appSecret
    this.appToken = config.appToken
  }

  private buildUrl(path: string): string {
    return `${FEISHU_BASE_URL}${path}`
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<FeishuAPIResponse<T>> {
    try {
      const isFormData = options.body instanceof FormData
      const headers: Record<string, string> = { ...options.headers as Record<string, string> }
      
      if (!isFormData) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(url, {
        headers,
        ...options,
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {
          success: response.ok,
          message: response.ok ? '操作成功' : `请求失败: ${response.status}`,
        }
      }

      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          message: `请求失败: ${response.status}`,
          error: data
        }
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
        message: '网络请求失败',
        error: String(error)
      }
    }
  }

  private async authenticatedRequest<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<FeishuAPIResponse<T>> {
    const accessToken = await this.getAccessToken()
    const url = this.buildUrl(path)
    
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
      "Authorization": `Bearer ${accessToken}`
    }

    return this.request<T>(url, {
      ...options,
      headers
    })
  }

  private handleFeishuResponse<T>(
    response: FeishuAPIResponse<any>,
    dataPath: (data: any) => T,
    errorMessage: string
  ): FeishuAPIResponse<T> {
    if (!response.success) {
      return {
        success: false,
        message: errorMessage,
        error: response.error
      }
    }

    try {
      return {
        success: true,
        data: dataPath(response.data)
      }
    } catch (error) {
      return {
        success: false,
        message: errorMessage,
        error: error
      }
    }
  }

  private wrapError<T>(
    fn: () => Promise<FeishuAPIResponse<T>>,
    errorMessage: string
  ): Promise<FeishuAPIResponse<T>> {
    return fn().catch(error => ({
      success: false,
      message: errorMessage,
      error: String(error)
    }))
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken
    }

    const result = await this.request<{ app_access_token: string }>(
      this.buildUrl("/auth/v3/app_access_token/internal"),
      {
        method: "POST",
        body: JSON.stringify({
          app_id: this.appId,
          app_secret: this.appSecret
        })
      }
    )

    if (!result.success || !result.data?.app_access_token) {
      throw new Error(`获取飞书访问令牌失败: ${result.message || JSON.stringify(result.error)}`)
    }

    this.accessToken = result.data.app_access_token
    return this.accessToken!
  }

  async createBase(name: string): Promise<FeishuAPIResponse<{ app_token: string; app: any }>> {
    return this.wrapError(async () => {
      const result = await this.authenticatedRequest<any>("/bitable/v1/apps", {
        method: "POST",
        body: JSON.stringify({ name })
      })

      return this.handleFeishuResponse(
        result,
        (data) => ({
          app_token: data?.data?.app?.app_token,
          app: data?.data?.app
        }),
        "创建多维表格失败"
      )
    }, "创建多维表格失败")
  }

  async getBaseInfo(appToken?: string): Promise<FeishuAPIResponse<any>> {
    return this.wrapError(async () => {
      const token = appToken || this.appToken
      if (!token) {
        return {
          success: false,
          message: "缺少 app_token"
        }
      }

      const result = await this.authenticatedRequest<any>(`/bitable/v1/apps/${token}`)

      return this.handleFeishuResponse(
        result,
        (data) => data?.data?.app,
        "获取多维表格信息失败"
      )
    }, "获取多维表格信息失败")
  }

  async createTable(
    appToken: string,
    tableName: string,
    fields: Field[]
  ): Promise<FeishuAPIResponse<TableInfo>> {
    return this.wrapError(async () => {
      const result = await this.authenticatedRequest<any>(`/bitable/v1/apps/${appToken}/tables`, {
        method: "POST",
        body: JSON.stringify({
          table: {
            name: tableName,
            fields
          }
        })
      })

      return this.handleFeishuResponse(
        result,
        (data) => data?.data?.table,
        "创建表格失败"
      )
    }, "创建表格失败")
  }

  async getTables(appToken?: string): Promise<FeishuAPIResponse<TableInfo[]>> {
    return this.wrapError(async () => {
      const token = appToken || this.appToken
      if (!token) {
        return {
          success: false,
          message: "缺少 app_token"
        }
      }

      const result = await this.authenticatedRequest<any>(`/bitable/v1/apps/${token}/tables`)

      return this.handleFeishuResponse(
        result,
        (data) => data?.data?.items || [],
        "获取表格列表失败"
      )
    }, "获取表格列表失败")
  }

  async getTableFields(appToken: string, tableId: string): Promise<FeishuAPIResponse<Field[]>> {
    return this.wrapError(async () => {
      const result = await this.authenticatedRequest<any>(`/bitable/v1/apps/${appToken}/tables/${tableId}/fields`)

      return this.handleFeishuResponse(
        result,
        (data) => data?.data?.items || [],
        "获取表格字段失败"
      )
    }, "获取表格字段失败")
  }

  async addRecord(
    appToken: string,
    tableId: string,
    recordData: RecordData
  ): Promise<FeishuAPIResponse<any>> {
    return this.wrapError(async () => {
      const result = await this.authenticatedRequest<any>(`/bitable/v1/apps/${appToken}/tables/${tableId}/records`, {
        method: "POST",
        body: JSON.stringify(recordData)
      })

      return this.handleFeishuResponse(
        result,
        (data) => data?.data?.record,
        "添加记录失败"
      )
    }, "添加记录失败")
  }

  async getRecords(
    appToken: string,
    tableId: string,
    options?: {
      viewId?: string
      fieldNames?: string[]
      filter?: string
      sort?: any[]
      pageToken?: string
      pageSize?: number
    }
  ): Promise<FeishuAPIResponse<{ records: any[]; hasMore: boolean; pageToken?: string }>> {
    return this.wrapError(async () => {
      const params = new URLSearchParams()
      if (options?.viewId) params.append('view_id', options.viewId)
      if (options?.fieldNames) params.append('field_names', JSON.stringify(options.fieldNames))
      if (options?.filter) params.append('filter', options.filter)
      if (options?.sort) params.append('sort', JSON.stringify(options.sort))
      if (options?.pageToken) params.append('page_token', options.pageToken)
      if (options?.pageSize) params.append('page_size', String(options.pageSize))

      const path = `/bitable/v1/apps/${appToken}/tables/${tableId}/records?${params.toString()}`
      const result = await this.authenticatedRequest<any>(path)

      return this.handleFeishuResponse(
        result,
        (data) => ({
          records: data?.data?.items || [],
          hasMore: data?.data?.has_more || false,
          pageToken: data?.data?.page_token
        }),
        "获取记录失败"
      )
    }, "获取记录失败")
  }

  async updateRecord(
    appToken: string,
    tableId: string,
    recordId: string,
    recordData: RecordData
  ): Promise<FeishuAPIResponse<any>> {
    return this.wrapError(async () => {
      const result = await this.authenticatedRequest<any>(`/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`, {
        method: "PUT",
        body: JSON.stringify(recordData)
      })

      return this.handleFeishuResponse(
        result,
        (data) => data?.data?.record,
        "更新记录失败"
      )
    }, "更新记录失败")
  }

  async deleteRecord(
    appToken: string,
    tableId: string,
    recordId: string
  ): Promise<FeishuAPIResponse<void>> {
    return this.wrapError(async () => {
      const result = await this.authenticatedRequest<void>(`/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`, {
        method: "DELETE"
      })

      if (!result.success) {
        return {
          success: false,
          message: "删除记录失败",
          error: result.error
        }
      }

      return {
        success: true
      }
    }, "删除记录失败")
  }
}

export function createFeishuAPI(config: FeishuConfig): FeishuAPI {
  return new FeishuAPI(config)
}
