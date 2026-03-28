import { readConfig, writeConfig } from "@/lib/config-manager"
import { createFeishuAPI, Field } from "@/lib/feishu-api"
import { successResponse, errorResponse, badRequestResponse } from "@/lib/api-utils"

function extractAppToken(baseLink: string): string {
  if (!baseLink) return ''
  
  const patterns = [
    /\/base\/([a-zA-Z0-9_-]+)/,
    /base\/([a-zA-Z0-9_-]+)/,
    /([a-zA-Z0-9_-]{20,})/
  ]
  
  for (const pattern of patterns) {
    const match = baseLink.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return baseLink
}

export async function POST() {
  try {
    const feishuConfig = readConfig('feishu-app')

    if (!feishuConfig.appId || !feishuConfig.appSecret || !feishuConfig.baseLink) {
      return badRequestResponse("飞书配置未完成，请填写App ID、App Secret和飞书多维表格链接")
    }

    const appToken = extractAppToken(feishuConfig.baseLink)
    console.log("提取的appToken:", appToken)
    
    if (!appToken) {
      return badRequestResponse("无法从链接中提取app_token")
    }

    const feishuAPI = createFeishuAPI({
      appId: feishuConfig.appId,
      appSecret: feishuConfig.appSecret,
      appToken
    })

    const defaultFields: Field[] = [
      {
        field_name: "姓名",
        type: 1,
        property: {}
      },
      {
        field_name: "电话",
        type: 1,
        property: {}
      },
      {
        field_name: "微信",
        type: 1,
        property: {}
      },
      {
        field_name: "邮箱",
        type: 1,
        property: {}
      },
      {
        field_name: "留言内容",
        type: 1,
        property: {}
      }
    ]

    console.log("创建表格字段:", JSON.stringify(defaultFields, null, 2))

    const result = await feishuAPI.createTable(appToken, "留言表", defaultFields)

    if (!result.success) {
      console.error("创建飞书表格失败:", result.error)
      return errorResponse(result.message || "创建飞书表格失败")
    }

    const tableId = result.data?.table_id

    if (!tableId) {
      return errorResponse("创建飞书表格成功，但未返回表格ID")
    }

    const tableLink = `https://example.feishu.cn/base/${appToken}/table/${tableId}`

    feishuConfig.appToken = appToken
    feishuConfig.tableId = tableId
    feishuConfig.tableLink = tableLink
    writeConfig('feishu-app', feishuConfig)

    return successResponse({
      tableId: tableId,
      tableLink: tableLink,
      table: result.data
    }, "飞书表格创建成功")
  } catch (error) {
    console.error("创建飞书表格失败:", error)
    return errorResponse("创建飞书表格失败")
  }
}
