import { NextRequest, NextResponse } from "next/server"
import { readConfig } from "@/lib/config-manager"
import { createFeishuAPI } from "@/lib/feishu-api"

export async function GET() {
  try {
    const feishuConfig = readConfig('feishu-app')

    if (!feishuConfig.appId || !feishuConfig.appSecret || !feishuConfig.appToken || !feishuConfig.tableId) {
      return NextResponse.json(
        { success: false, message: "飞书配置未完成" },
        { status: 400 }
      )
    }

    const feishuAPI = createFeishuAPI({
      appId: feishuConfig.appId,
      appSecret: feishuConfig.appSecret,
      appToken: feishuConfig.appToken
    })

    const result = await feishuAPI.getTableFields(feishuConfig.appToken, feishuConfig.tableId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "获取飞书表格字段失败", error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data || [],
      message: "获取飞书表格字段成功"
    })
  } catch (error) {
    console.error("获取飞书表格字段失败:", error)
    return NextResponse.json(
      { success: false, message: "获取飞书表格字段失败", error: String(error) },
      { status: 500 }
    )
  }
}
