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

    jsonDb.reloadTable('system_config')
    
    const tokenConfig = jsonDb.findOne('system_config', { config_key: 'super_admin_token' })
    
    if (!tokenConfig || !tokenConfig.config_value) {
      return unauthorizedResponse('超级管理员口令未设置')
    }

    if (tokenConfig.config_value !== password) {
      return unauthorizedResponse('密码错误')
    }

    const superAdminToken = tokenConfig.config_value

    return successResponse({ token: superAdminToken })
  })
}
