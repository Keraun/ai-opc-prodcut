import { readConfig } from "@/lib/config-manager"
import { createFeishuAPI } from "@/lib/feishu-api"
import { successResponse, errorResponse, badRequestResponse } from "@/lib/api-utils"

export async function GET() {
  try {
    const feishuConfig = readConfig('feishu-app')

    if (!feishuConfig.appId || !feishuConfig.appSecret || !feishuConfig.appToken || !feishuConfig.tableId) {
      return badRequestResponse("飞书配置未完成")
    }

    const feishuAPI = createFeishuAPI({
      appId: feishuConfig.appId,
      appSecret: feishuConfig.appSecret,
      appToken: feishuConfig.appToken
    })

    const result = await feishuAPI.getTableFields(feishuConfig.appToken, feishuConfig.tableId)

    if (!result.success) {
      return errorResponse(result.message || "获取飞书表格字段失败")
    }

    return successResponse(result.data || [], "获取飞书表格字段成功")
  } catch (error) {
    console.error("获取飞书表格字段失败:", error)
    return errorResponse("获取飞书表格字段失败")
  }
}
