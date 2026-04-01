import { NextRequest } from "next/server"
import { readConfig, writeConfig } from "@/lib/config-manager"
import { jsonDb } from "@/lib/json-database"
import {
  successResponse,
  errorResponse,
  badRequestResponse,
  wrapApiHandler,
  setCookie,
  getClientIP,
  formatDateTime,
  generateRandomToken,
  checkAdminAuth
} from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  return wrapApiHandler(async () => {
    const body = await request.json()
    const { email, username } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequestResponse("请输入有效的邮箱地址")
    }

    const authResult = await checkAdminAuth()
    
    let targetUsername: string
    
    if (authResult.isAuthenticated) {
      targetUsername = authResult.username!
    } else if (username) {
      targetUsername = username
    } else {
      return errorResponse("未登录", 401)
    }

    const accountConfig = readConfig('account')
    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    const adminIndex = admins.findIndex((admin: any) => admin.username === targetUsername)

    if (adminIndex === -1) {
      return errorResponse("用户不存在", 404)
    }

    const admin = admins[adminIndex]
    
    if (!authResult.isAuthenticated && admin.email) {
      return errorResponse("未登录", 401)
    }

    admins[adminIndex].email = email

    const currentIP = getClientIP(request)
    const currentTime = formatDateTime()

    const lastLoginTime = admin.current_login_time || admin.last_login_time || ''
    const lastLoginIP = admin.current_login_ip || admin.last_login_ip || ''

    admins[adminIndex].last_login_time = lastLoginTime
    admins[adminIndex].last_login_ip = lastLoginIP
    admins[adminIndex].current_login_ip = currentIP
    admins[adminIndex].current_login_time = currentTime



    writeConfig('account', admins)

    const updatedUserData = {
      username: admin.username,
      remark: admin.remark,
      mustChangePassword: admin.must_change_password,
      lastLoginTime: lastLoginTime,
      lastLoginIP: lastLoginIP,
      currentLoginIP: currentIP
    }

    console.log('[Setup Email] Setting cookie:', updatedUserData)
    await setCookie('adminUser', JSON.stringify(updatedUserData))
    console.log('[Setup Email] Cookie set successfully')

    return successResponse({})
  })
}
