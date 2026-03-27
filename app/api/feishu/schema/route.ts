import { NextRequest, NextResponse } from "next/server"
import { readConfig } from "@/lib/config-manager"

export async function GET() {
  try {
    const feishuConfig = readConfig('feishu-app')

    if (!feishuConfig.appId || !feishuConfig.appSecret || !feishuConfig.tableId) {
      return NextResponse.json(
        { success: false, message: "飞书配置未完成" },
        { status: 400 }
      )
    }

    const tokenResponse = await fetch("https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        app_id: feishuConfig.appId,
        app_secret: feishuConfig.appSecret
      })
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json()
      console.error("获取飞书访问令牌失败:", tokenError)
      return NextResponse.json(
        { success: false, message: "获取飞书访问令牌失败", error: tokenError },
        { status: 500 }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.app_access_token

    const tableResponse = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${feishuConfig.appId}/tables/${feishuConfig.tableId}/fields`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    })

    if (!tableResponse.ok) {
      const tableError = await tableResponse.json()
      console.error("获取飞书表格字段失败:", tableError)
      return NextResponse.json(
        { success: false, message: "获取飞书表格字段失败", error: tableError },
        { status: 500 }
      )
    }

    const tableData = await tableResponse.json()

    return NextResponse.json({
      success: true,
      data: tableData.data?.items || [],
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
