import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, wechat, email, preference, message } = body

    // Validate required fields
    if (!name || !phone || !message) {
      return NextResponse.json(
        { success: false, message: "请填写必填字段" },
        { status: 400 }
      )
    }

    // Read Feishu configuration from site config
    const configDir = path.join(process.cwd(), "config/json")
    const siteConfig = JSON.parse(fs.readFileSync(path.join(configDir, "site-config.json"), "utf-8"))
    const feishuConfig = siteConfig.feishu || {}

    // Check if Feishu is configured
    if (!feishuConfig.appId || !feishuConfig.appSecret || !feishuConfig.tableId || !feishuConfig.viewId) {
      return NextResponse.json(
        { success: false, message: "飞书配置未完成" },
        { status: 500 }
      )
    }

    // Get Feishu access token
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
      throw new Error("获取飞书访问令牌失败")
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.app_access_token

    // Submit data to Feishu table
    const tableResponse = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${feishuConfig.appId}/tables/${feishuConfig.tableId}/records`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              "姓名": name,
              "电话": phone,
              "微信": wechat || "",
              "邮箱": email || "",
              "偏好联系方式": preference || "",
              "留言内容": message,
              "提交时间": new Date().toISOString()
            }
          }
        ]
      })
    })

    if (!tableResponse.ok) {
      throw new Error("提交数据到飞书表格失败")
    }

    return NextResponse.json({
      success: true,
      message: "感谢您的留言，我们会尽快与您联系！"
    })
  } catch (error) {
    console.error("提交留言失败:", error)
    return NextResponse.json(
      { success: false, message: "提交留言失败，请稍后重试" },
      { status: 500 }
    )
  }
}
