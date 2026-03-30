import { NextRequest, NextResponse } from "next/server"
import { readConfig } from "@/lib/config-manager"
import { createFeishuAPI } from "@/lib/feishu-api"
import { jsonDb } from "@/lib/json-database"
import { 
  successResponse, 
  errorResponse, 
  badRequestResponse 
} from "@/lib/api-utils"
import { parseUserAgent, getClientIp } from "@/lib/device-utils"

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

    const userAgent = request.headers.get('user-agent') || ''
    const deviceInfo = parseUserAgent(userAgent)
    const ip = getClientIp(request)
    
    const messageData = {
      name: String(name || ''),
      phone: String(phone || ''),
      wechat: String(wechat || ''),
      email: String(email || ''),
      preference: String(preference || ''),
      message: String(message || ''),
      ip,
      region: '',
      os: deviceInfo.os,
      osVersion: deviceInfo.osVersion,
      browser: deviceInfo.browser,
      browserVersion: deviceInfo.browserVersion,
      deviceModel: deviceInfo.deviceModel,
      userAgent,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const savedMessage = jsonDb.insert('messages', messageData)

    const feishuConfig = readConfig('feishu-app')

    if (feishuConfig?.appId && feishuConfig?.appSecret && feishuConfig?.appToken && feishuConfig?.tableId) {
      try {
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
            "提交时间": new Date().toISOString(),
            "IP地址": ip,
            "操作系统": deviceInfo.os,
            "设备机型": deviceInfo.deviceModel,
            "浏览器": deviceInfo.browser
          }
        })

        if (!result.success) {
          console.warn("提交数据到飞书表格失败:", result.error)
        } else {
          jsonDb.update('messages', savedMessage.id, { 
            feishuRecordId: result.data?.record?.record_id,
            updated_at: new Date().toISOString()
          })
        }
      } catch (feishuError) {
        console.warn("飞书同步失败，留言已保存到本地:", feishuError)
      }
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status') || ''

    let messages = jsonDb.getAll('messages')
    
    if (status) {
      messages = messages.filter((msg: any) => msg.status === status)
    }

    messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = messages.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedMessages = messages.slice(startIndex, endIndex)

    return successResponse({
      list: paginatedMessages,
      total,
      page,
      pageSize
    })
  } catch (error) {
    console.error("获取留言列表失败:", error)
    return errorResponse("获取留言列表失败", 500)
  }
}
