import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { readConfig, writeConfig } from "@/lib/config-manager"
import { logOperation } from "@/lib/operation-logger"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')
    
    if (!adminUserCookie) {
      return NextResponse.json({
        success: false,
        message: '未登录'
      }, { status: 401 })
    }

    const adminUser = JSON.parse(adminUserCookie.value)
    const body = await request.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: '参数错误'
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        message: '新密码长度不能少于6位'
      }, { status: 400 })
    }

    const accountConfig = readConfig('account')

    // 兼容两种格式：数组格式和 { admins: [...] } 对象格式
    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    const adminIndex = admins.findIndex(
      (admin: any) => admin.username === adminUser.username
    )

    if (adminIndex === -1) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 })
    }

    const admin = admins[adminIndex]

    if (admin.password !== oldPassword) {
      return NextResponse.json({
        success: false,
        message: '旧密码错误'
      }, { status: 401 })
    }

    admins[adminIndex].password = newPassword
    admins[adminIndex].mustChangePassword = false

    writeConfig('account', admins)

    const currentIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    
    logOperation(admin.username, 'change_password', '修改密码', currentIP)

    cookieStore.delete('adminUser')

    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '修改密码失败'
    }, { status: 500 })
  }
}
