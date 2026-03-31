import { NextRequest, NextResponse } from "next/server"
import { readConfig } from "@/lib/config-manager"
import { jsonDb } from "@/lib/json-database"
import { 
  successResponse, 
  errorResponse, 
  badRequestResponse 
} from "@/lib/api-utils"
import { parseUserAgent, getClientIp, detectLLMModel } from "@/lib/device-utils"
import { notificationService } from "@/lib/notification-service"

export async function POST(request: NextRequest) {
  try {
    let name, phone, wechat, email, preference, message, llmModel
    
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      const body = await request.json()
      name = body.name
      phone = body.phone
      wechat = body.wechat
      email = body.email
      preference = body.preference
      message = body.message
      llmModel = body.llmModel
    } else {
      const formData = await request.formData()
      name = formData.get('name')
      phone = formData.get('phone')
      wechat = formData.get('wechat')
      email = formData.get('email')
      preference = formData.get('contactPreference')
      message = formData.get('message')
      llmModel = formData.get('llmModel')
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
    const referer = request.headers.get('referer') || ''
    const deviceInfo = parseUserAgent(userAgent)
    const ip = getClientIp(request)
    
    // 自动检测 LLM 模型（如果前端没有提供）
    const detectedLLMModel = llmModel || detectLLMModel(referer, userAgent)
    
    const messageData = {
      name: String(name || ''),
      phone: String(phone || ''),
      wechat: String(wechat || ''),
      email: String(email || ''),
      preference: String(preference || ''),
      message: String(message || ''),
      llmModel: String(detectedLLMModel || ''),
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

    // 生成详情链接
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const tokenConfig = readConfig('token') || { superAdminToken: '' }
    const superAdminToken = tokenConfig.superAdminToken || ''
    const detailLink = `${baseUrl}/admin/dashboard/messages/${savedMessage.id}?token=${superAdminToken}`

    // 发送通知
    try {
      await notificationService.sendNotifications({
        name: String(name || ''),
        phone: String(phone || ''),
        wechat: String(wechat || ''),
        email: String(email || ''),
        message: String(message || ''),
        preference: String(preference || ''),
        llmModel: String(detectedLLMModel || ''),
        ip,
        region: '',
        os: deviceInfo.os,
        osVersion: deviceInfo.osVersion,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        deviceModel: deviceInfo.deviceModel,
        detail_link: detailLink,
        created_at: new Date().toISOString()
      })
    } catch (notificationError) {
      console.warn('发送通知失败:', notificationError)
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
