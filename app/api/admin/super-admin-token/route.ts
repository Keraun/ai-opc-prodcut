import { NextRequest } from "next/server"
import { jsonDb } from "@/lib/json-database"
import { readConfig } from "@/lib/config-manager"
import { successResponse, badRequestResponse, unauthorizedResponse, wrapAuthApiHandler } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async (authResult) => {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return badRequestResponse('密码不能为空')
    }

    const accountConfig = readConfig('account')
    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    const currentUser = authResult.username
    const admin = admins.find((a: any) => a.username === currentUser)

    if (!admin) {
      return unauthorizedResponse('用户不存在')
    }

    if (admin.password !== password) {
      return unauthorizedResponse('密码错误')
    }

    jsonDb.reloadTable('system_config')
    
    const tokenConfig = jsonDb.findOne('system_config', { config_key: 'super_admin_token' })
    
    if (!tokenConfig || !tokenConfig.config_value) {
      return unauthorizedResponse('超级管理员口令未设置')
    }

    const superAdminToken = tokenConfig.config_value

    return successResponse({ token: superAdminToken })
  })
}
