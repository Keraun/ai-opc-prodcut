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

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken
    }

    const response = await fetch("https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`获取飞书访问令牌失败: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    if (!data.app_access_token) {
      throw new Error('获取飞书访问令牌失败: 未返回 access_token')
    }
    this.accessToken = data.app_access_token
    return this.accessToken!
  }

  async createBase(name: string): Promise<FeishuAPIResponse<{ app_token: string; app: any }>> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch("https://open.feishu.cn/open-apis/bitable/v1/apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name })
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: "创建多维表格失败",
          error
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: {
          app_token: data.data?.app?.app_token,
          app: data.data?.app
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "创建多维表格失败",
        error: String(error)
      }
    }
  }

  async getBaseInfo(appToken?: string): Promise<FeishuAPIResponse<any>> {
    try {
      const token = appToken || this.appToken
      if (!token) {
        return {
          success: false,
          message: "缺少 app_token"
        }
      }

      const accessToken = await this.getAccessToken()

      const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${token}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: "获取多维表格信息失败",
          error
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data?.app
      }
    } catch (error) {
      return {
        success: false,
        message: "获取多维表格信息失败",
        error: String(error)
      }
    }
  }

  async createTable(
    appToken: string,
    tableName: string,
    fields: Field[]
  ): Promise<FeishuAPIResponse<TableInfo>> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          table: {
            name: tableName,
            fields
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: "创建表格失败",
          error
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data?.table
      }
    } catch (error) {
      return {
        success: false,
        message: "创建表格失败",
        error: String(error)
      }
    }
  }

  async getTables(appToken?: string): Promise<FeishuAPIResponse<TableInfo[]>> {
    try {
      const token = appToken || this.appToken
      if (!token) {
        return {
          success: false,
          message: "缺少 app_token"
        }
      }

      const accessToken = await this.getAccessToken()

      const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${token}/tables`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: "获取表格列表失败",
          error
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data?.items || []
      }
    } catch (error) {
      return {
        success: false,
        message: "获取表格列表失败",
        error: String(error)
      }
    }
  }

  async getTableFields(appToken: string, tableId: string): Promise<FeishuAPIResponse<Field[]>> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: "获取表格字段失败",
          error
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data?.items || []
      }
    } catch (error) {
      return {
        success: false,
        message: "获取表格字段失败",
        error: String(error)
      }
    }
  }

  async addRecord(
    appToken: string,
    tableId: string,
    recordData: RecordData
  ): Promise<FeishuAPIResponse<any>> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(recordData)
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: "添加记录失败",
          error
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data?.record
      }
    } catch (error) {
      return {
        success: false,
        message: "添加记录失败",
        error: String(error)
      }
    }
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
    try {
      const accessToken = await this.getAccessToken()

      const params = new URLSearchParams()
      if (options?.viewId) params.append('view_id', options.viewId)
      if (options?.fieldNames) params.append('field_names', JSON.stringify(options.fieldNames))
      if (options?.filter) params.append('filter', options.filter)
      if (options?.sort) params.append('sort', JSON.stringify(options.sort))
      if (options?.pageToken) params.append('page_token', options.pageToken)
      if (options?.pageSize) params.append('page_size', String(options.pageSize))

      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?${params.toString()}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: "获取记录失败",
          error
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: {
          records: data.data?.items || [],
          hasMore: data.data?.has_more || false,
          pageToken: data.data?.page_token
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "获取记录失败",
        error: String(error)
      }
    }
  }

  async updateRecord(
    appToken: string,
    tableId: string,
    recordId: string,
    recordData: RecordData
  ): Promise<FeishuAPIResponse<any>> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(recordData)
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: "更新记录失败",
          error
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: data.data?.record
      }
    } catch (error) {
      return {
        success: false,
        message: "更新记录失败",
        error: String(error)
      }
    }
  }

  async deleteRecord(
    appToken: string,
    tableId: string,
    recordId: string
  ): Promise<FeishuAPIResponse<void>> {
    try {
      const accessToken = await this.getAccessToken()

      const response = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: "删除记录失败",
          error
        }
      }

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        message: "删除记录失败",
        error: String(error)
      }
    }
  }
}

export function createFeishuAPI(config: FeishuConfig): FeishuAPI {
  return new FeishuAPI(config)
}
