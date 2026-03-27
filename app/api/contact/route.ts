import { NextRequest, NextResponse } from "next/server"
import { readConfig } from "@/lib/config-manager"
import { createFeishuAPI } from "@/lib/feishu-api"
import { 
  successResponse, 
  errorResponse, 
  badRequestResponse 
} from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    let name, phone, wechat, email, preference, message
    
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      const body = await request.json()
      name = body.name
      phone = body.phone
      wechat = body.wechat
      email = body.email
      preference = body.preference
      message = body.message
    } else {
      const formData = await request.formData()
      name = formData.get('name')
      phone = formData.get('phone')
      wechat = formData.get('wechat')
      email = formData.get('email')
      preference = formData.get('contactPreference')
      message = formData.get('message')
    }

    if (!name || !phone || !message) {
      const acceptHeader = request.headers.get('accept') || ''
      const isFormSubmit = !acceptHeader.includes('application/json')
      
      if (isFormSubmit) {
        return NextResponse.redirect(new URL('/?contact=error', request.url))
      }
      return badRequestResponse("请填写必填字段")
    }

    const feishuConfig = readConfig('feishu-app')

    if (!feishuConfig.appId || !feishuConfig.appSecret || !feishuConfig.appToken || !feishuConfig.tableId) {
      const acceptHeader = request.headers.get('accept') || ''
      const isFormSubmit = !acceptHeader.includes('application/json')
      
      if (isFormSubmit) {
        return NextResponse.redirect(new URL('/?contact=error', request.url))
      }
      return errorResponse("飞书配置未完成", 500)
    }

    const feishuAPI = createFeishuAPI({
      appId: feishuConfig.appId,
      appSecret: feishuConfig.appSecret,
      appToken: feishuConfig.appToken
    })

    const result = await feishuAPI.addRecord(feishuConfig.appToken, feishuConfig.tableId, {
      fields: {
        "姓名": name,
        "电话": phone,
        "微信": wechat || "",
        "邮箱": email || "",
        "偏好联系方式": preference || "",
        "留言内容": message,
        "提交时间": new Date().toISOString()
      }
    })

    if (!result.success) {
      console.error("提交数据到飞书表格失败:", result.error)
      throw new Error(`提交数据到飞书表格失败: ${result.message}`)
    }

    const acceptHeader = request.headers.get('accept') || ''
    const isFormSubmit = !acceptHeader.includes('application/json')
    
    if (isFormSubmit) {
      return NextResponse.redirect(new URL('/?contact=success', request.url))
    }

    return successResponse(undefined, "感谢您的留言，我们会尽快与您联系！")
  } catch (error) {
    console.error("提交留言失败:", error)
    
    const acceptHeader = request.headers.get('accept') || ''
    const isFormSubmit = !acceptHeader.includes('application/json')
    
    if (isFormSubmit) {
      return NextResponse.redirect(new URL('/?contact=error', request.url))
    }
    
    return errorResponse("提交留言失败，请稍后重试", 500)
  }
}
