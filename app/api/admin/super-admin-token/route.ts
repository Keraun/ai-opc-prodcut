import { NextRequest } from "next/server"
import { jsonDb } from "@/lib/json-database"
import { successResponse, badRequestResponse, unauthorizedResponse, wrapAuthApiHandler } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async (authResult) => {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return badRequestResponse('密码不能为空')
    }

    jsonDb.reloadTable('accounts')
    jsonDb.reloadTable('system_config')
    
    const admin = jsonDb.findOne('accounts', { username: authResult.username })
    
    if (!admin) {
      return unauthorizedResponse('用户不存在')
    }

    if (admin.password !== password) {
      return unauthorizedResponse('密码错误')
    }

    const tokenConfig = jsonDb.findOne('system_config', { config_key: 'super_admin_token' })
    
    let superAdminToken = tokenConfig?.config_value || ''
    
    if (!superAdminToken) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      superAdminToken = result
      
      if (tokenConfig) {
        jsonDb.update('system_config', tokenConfig.id, {
          config_value: superAdminToken,
          updated_at: new Date().toISOString()
        })
      } else {
        jsonDb.insert('system_config', {
          config_key: 'super_admin_token',
          config_value: superAdminToken,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    }

    return successResponse({ token: superAdminToken })
  })
}
