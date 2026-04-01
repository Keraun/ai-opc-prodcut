import { NextRequest } from "next/server"
import { readConfig, writeConfig } from "@/lib/config-manager"
import { jsonDb } from "@/lib/json-database"
import {
  successResponse,
  errorResponse,
  wrapApiHandler,
  setCookie,
  getClientIP,
  formatDateTime,
  generateRandomToken
} from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  return wrapApiHandler(async () => {
    const body = await request.json()
    const { username, password } = body

    console.log('[Login] Attempting login for user:', username)

    const accountConfig = readConfig('account')
    console.log('[Login] Account config:', accountConfig)
    const admins = Array.isArray(accountConfig) ? accountConfig : []

    const adminIndex = admins.findIndex((admin: any) => admin.username === username)

    if (adminIndex === -1) {
      console.log('[Login] User not found:', username)
      return errorResponse("用户名不存在", 401)
    }

    const admin = admins[adminIndex]

    if (admin.password !== password) {
      console.log('[Login] Password mismatch for user:', username)
      return errorResponse("密码错误", 401)
    }

    const requireEmailSetup = !admin.email
    console.log('[Login] requireEmailSetup:', requireEmailSetup)

    if (requireEmailSetup) {
      const userData = {
        username: admin.username,
        remark: admin.remark,
        mustChangePassword: admin.must_change_password
      }
      
      console.log('[Login] Setting cookie for email setup:', userData)
      await setCookie('adminUser', JSON.stringify(userData))
      console.log('[Login] Cookie set successfully')

      return successResponse({
        requireEmailSetup: true,
        user: userData
      })
    }

    const currentIP = getClientIP(request)
    const currentTime = formatDateTime()

    const lastLoginTime = admin.current_login_time || admin.last_login_time || ''
    const lastLoginIP = admin.current_login_ip || admin.last_login_ip || ''

    admins[adminIndex].last_login_time = lastLoginTime
    admins[adminIndex].last_login_ip = lastLoginIP
    admins[adminIndex].current_login_ip = currentIP
    admins[adminIndex].current_login_time = currentTime



    writeConfig('account', admins)

    const userData = {
      username: admin.username,
      role: admin.role || 'operator',
      remark: admin.remark,
      mustChangePassword: admin.must_change_password,
      lastLoginTime: lastLoginTime,
      lastLoginIP: lastLoginIP,
      currentLoginIP: currentIP
    }
    
    console.log('[Login] Setting cookie for normal login:', userData)
    await setCookie('adminUser', JSON.stringify(userData))
    console.log('[Login] Cookie set successfully for normal login')

    return successResponse({
      mustChangePassword: admin.must_change_password,
      user: userData
    })
  })
}
