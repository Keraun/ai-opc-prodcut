import { NextRequest, NextResponse } from "next/server"
import { readConfig, writeConfig } from "@/lib/config-manager"

interface Field {
  field_name: string
  type: number
  property: {
    [key: string]: any
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const feishuConfig = readConfig('feishu-app')

    if (!feishuConfig.appId || !feishuConfig.appSecret || !feishuConfig.baseLink) {
      return NextResponse.json(
        { success: false, message: "飞书配置未完成，请填写App ID、App Secret和飞书多维表格链接" },
        { status: 400 }
      )
    }

    const appToken = extractAppToken(feishuConfig.baseLink)
    console.log("提取的appToken:", appToken)
    
    if (!appToken) {
      return NextResponse.json(
        { success: false, message: "无法从链接中提取app_token" },
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

    const requestBody = {
      table: {
        name: "留言表",
        fields: defaultFields
      }
    }

    console.log("创建表格请求URL:", `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables`)
    console.log("创建表格请求体:", JSON.stringify(requestBody, null, 2))

    const createTableResponse = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log("创建表格响应状态:", createTableResponse.status)

    if (!createTableResponse.ok) {
      const createError = await createTableResponse.json()
      console.error("创建飞书表格失败:", createError)
      console.error("错误详情:", JSON.stringify(createError, null, 2))
      return NextResponse.json(
        { success: false, message: "创建飞书表格失败", error: createError },
        { status: 500 }
      )
    }

    const createTableData = await createTableResponse.json()
    const tableId = createTableData.data?.table?.table_id

    if (!tableId) {
      return NextResponse.json(
        { success: false, message: "创建飞书表格成功，但未返回表格ID" },
        { status: 500 }
      )
    }

    const tableLink = `https://example.feishu.cn/base/${appToken}/table/${tableId}`

    feishuConfig.appToken = appToken
    feishuConfig.tableId = tableId
    feishuConfig.tableLink = tableLink
    writeConfig('feishu-app', feishuConfig)

    return NextResponse.json({
      success: true,
      message: "飞书表格创建成功",
      data: {
        tableId: tableId,
        tableLink: tableLink,
        table: createTableData.data?.table
      }
    })
  } catch (error) {
    console.error("创建飞书表格失败:", error)
    return NextResponse.json(
      { success: false, message: "创建飞书表格失败", error: String(error) },
      { status: 500 }
    )
  }
}
