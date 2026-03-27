import { NextRequest, NextResponse } from "next/server"
import { readConfig, writeConfig } from "@/lib/config-manager"

interface Field {
  field_name: string
  type: number
  property: {
    [key: string]: any
  }
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
        field_name: "偏好联系方式",
        type: 3,
        property: {
          options: [
            { name: "电话" },
            { name: "微信" },
            { name: "邮箱" }
          ]
        }
      },
      {
        field_name: "留言内容",
        type: 1,
        property: {}
      },
      {
        field_name: "提交时间",
        type: 5,
        property: {
          formatter: "yyyy-MM-dd HH:mm:ss",
          time_format: "HH:mm:ss",
          date_format: "yyyy-MM-dd"
        }
      }
    ]

    const requestBody = {
      table: {
        name: "留言表",
        fields: defaultFields
      }
    }

    console.log("创建表格请求URL:", `https://open.feishu.cn/open-apis/bitable/v1/apps/${feishuConfig.baseLink}/tables`)
    console.log("创建表格请求体:", JSON.stringify(requestBody, null, 2))

    const createTableResponse = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${feishuConfig.baseLink}/tables`, {
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

    const appToken = feishuConfig.baseLink
    const tableLink = `https://example.feishu.cn/base/${appToken}/table/${tableId}`

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
