import { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { readConfig, writeConfig } from "@/lib/config-manager"
import { successResponse, errorResponse, badRequestResponse, unauthorizedResponse, notFoundResponse } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminUserCookie = cookieStore.get('adminUser')
    
    if (!adminUserCookie) {
      return unauthorizedResponse()
    }

    const adminUser = JSON.parse(adminUserCookie.value)
    const body = await request.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return badRequestResponse('参数错误')
    }

    if (newPassword.length < 6) {
      return badRequestResponse('新密码长度不能少于6位')
    }

    const accountConfig = readConfig('account')

    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    const adminIndex = admins.findIndex(
      (admin: any) => admin.username === adminUser.username
    )

    if (adminIndex === -1) {
      return notFoundResponse('用户不存在')
    }

    const admin = admins[adminIndex]

    if (admin.password !== oldPassword) {
      return unauthorizedResponse('旧密码错误')
    }

    admins[adminIndex].password = newPassword
    admins[adminIndex].mustChangePassword = false

    writeConfig('account', admins)

    cookieStore.delete('adminUser')

    return successResponse(null, '密码修改成功')
  } catch (error) {
    console.error('修改密码失败:', error)
    return errorResponse('修改密码失败')
  }
}
