import { NextRequest } from "next/server"
import { readConfig, writeConfig } from "@/lib/config-manager"
import {
  successResponse,
  errorResponse,
  setCookie,
  parseJsonCookie,
  getClientIP,
  formatDateTime,
  generateRandomToken
} from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const accountConfig = readConfig('account')
    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    const adminIndex = admins.findIndex((admin: any) => admin.username === username)

    if (adminIndex === -1) {
      return errorResponse("用户名不存在", 401)
    }

    const admin = admins[adminIndex]

    if (admin.password !== password) {
      return errorResponse("密码错误", 401)
    }

    const requireEmailSetup = !admin.email

    if (requireEmailSetup) {
      const userData = {
        username: admin.username,
        remark: admin.remark,
        mustChangePassword: admin.mustChangePassword
      }
      
      await setCookie('adminUser', JSON.stringify(userData))

      return successResponse({
        requireEmailSetup: true,
        user: userData
      })
    }

    const currentIP = getClientIP(request)
    const currentTime = formatDateTime()

    const lastLoginTime = admin.currentLoginTime || admin.lastLoginTime || ''
    const lastLoginIP = admin.currentLoginIP || admin.lastLoginIP || ''

    admins[adminIndex].lastLoginTime = lastLoginTime
    admins[adminIndex].lastLoginIP = lastLoginIP
    admins[adminIndex].currentLoginIP = currentIP
    admins[adminIndex].currentLoginTime = currentTime

    let showSuperAdminToken = false
    let superAdminToken = ''

    let tokenConfig = readConfig('token') || { superAdminToken: '' }

    if (!tokenConfig.superAdminToken) {
      superAdminToken = generateRandomToken(12)
      tokenConfig.superAdminToken = superAdminToken
      showSuperAdminToken = true
      writeConfig('token', tokenConfig)
    } else {
      superAdminToken = tokenConfig.superAdminToken
    }

    writeConfig('account', admins)

    const userData = {
      username: admin.username,
      remark: admin.remark,
      mustChangePassword: admin.mustChangePassword,
      lastLoginTime: lastLoginTime,
      lastLoginIP: lastLoginIP,
      currentLoginIP: currentIP
    }
    
    await setCookie('adminUser', JSON.stringify(userData))

    return successResponse({
      mustChangePassword: admin.mustChangePassword,
      user: userData,
      showSuperAdminToken,
      superAdminToken: showSuperAdminToken ? superAdminToken : undefined
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse("登录失败", 500)
  }
}
