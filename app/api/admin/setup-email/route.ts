import { NextRequest } from "next/server"
import { readConfig, writeConfig } from "@/lib/config-manager"
import {
  successResponse,
  errorResponse,
  badRequestResponse,
  wrapAuthApiHandler,
  setCookie,
  getClientIP,
  formatDateTime,
  generateRandomToken
} from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async (authResult) => {
    const body = await request.json()
    const { email } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequestResponse("请输入有效的邮箱地址")
    }

    const accountConfig = readConfig('account')
    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    const adminIndex = admins.findIndex((admin: any) => admin.username === authResult.username)

    if (adminIndex === -1) {
      return errorResponse("用户不存在", 404)
    }

    const admin = admins[adminIndex]

    admins[adminIndex].email = email

    const currentIP = getClientIP(request)
    const currentTime = formatDateTime()

    const lastLoginTime = admin.current_login_time || admin.last_login_time || ''
    const lastLoginIP = admin.current_login_ip || admin.last_login_ip || ''

    admins[adminIndex].last_login_time = lastLoginTime
    admins[adminIndex].last_login_ip = lastLoginIP
    admins[adminIndex].current_login_ip = currentIP
    admins[adminIndex].current_login_time = currentTime

    let showSuperAdminToken = false
    let superAdminToken = ''

    const tokenConfig = readConfig('token') || { superAdminToken: '' }

    if (!tokenConfig.superAdminToken) {
      superAdminToken = generateRandomToken(12)
      tokenConfig.superAdminToken = superAdminToken
      showSuperAdminToken = true
      writeConfig('token', tokenConfig)
    } else {
      superAdminToken = tokenConfig.superAdminToken
    }

    writeConfig('account', admins)

    const updatedUserData = {
      username: admin.username,
      remark: admin.remark,
      mustChangePassword: admin.must_change_password,
      lastLoginTime: lastLoginTime,
      lastLoginIP: lastLoginIP,
      currentLoginIP: currentIP
    }

    await setCookie('adminUser', JSON.stringify(updatedUserData))

    return successResponse({
      showSuperAdminToken,
      superAdminToken: showSuperAdminToken ? superAdminToken : undefined
    })
  })
}
