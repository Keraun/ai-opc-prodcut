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
        mustChangePassword: admin.must_change_password
      }
      
      await setCookie('adminUser', JSON.stringify(userData))

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

    let showSuperAdminToken = false
    let superAdminToken = ''

    jsonDb.reloadTable('system_config')
    
    let tokenConfig = jsonDb.findOne('system_config', { config_key: 'super_admin_token' })

    if (!tokenConfig || !tokenConfig.config_value || tokenConfig.config_value.trim() === '') {
      superAdminToken = generateRandomToken(12)
      
      if (!tokenConfig) {
        jsonDb.insert('system_config', {
          config_key: 'super_admin_token',
          config_value: superAdminToken,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      } else {
        jsonDb.update('system_config', 
          tokenConfig.id,
          { 
            config_value: superAdminToken,
            updated_at: new Date().toISOString()
          }
        )
      }
      
      showSuperAdminToken = true
    } else {
      superAdminToken = tokenConfig.config_value
    }

    writeConfig('account', admins)

    const userData = {
      username: admin.username,
      remark: admin.remark,
      mustChangePassword: admin.must_change_password,
      lastLoginTime: lastLoginTime,
      lastLoginIP: lastLoginIP,
      currentLoginIP: currentIP
    }
    
    await setCookie('adminUser', JSON.stringify(userData))

    return successResponse({
      mustChangePassword: admin.must_change_password,
      user: userData,
      showSuperAdminToken,
      superAdminToken: showSuperAdminToken ? superAdminToken : undefined
    })
  })
}
