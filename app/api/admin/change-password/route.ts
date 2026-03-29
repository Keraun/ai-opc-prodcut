import { NextRequest } from "next/server"
import { jsonDb } from "@/lib/json-database"
import { successResponse, badRequestResponse, unauthorizedResponse, notFoundResponse, wrapAuthApiHandler } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async (authResult) => {
    const body = await request.json()
    const { username, oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return badRequestResponse('参数错误')
    }

    if (newPassword.length < 6) {
      return badRequestResponse('新密码长度不能少于6位')
    }

    const targetUsername = username || authResult.username

    jsonDb.reloadTable('accounts')
    
    const admin = jsonDb.findOne('accounts', { username: targetUsername })

    if (!admin) {
      return notFoundResponse('用户不存在')
    }

    if (admin.password !== oldPassword) {
      return unauthorizedResponse('旧密码错误')
    }

    jsonDb.update('accounts', admin.id, {
      password: newPassword,
      must_change_password: 0,
      updated_at: new Date().toISOString()
    })

    const updatedAdmin = jsonDb.findOne('accounts', { username: targetUsername })
    
    const user = {
      username: updatedAdmin.username,
      remark: updatedAdmin.remark,
      mustChangePassword: false,
      lastLoginTime: updatedAdmin.last_login_time,
      lastLoginIP: updatedAdmin.last_login_ip,
      currentLoginIP: updatedAdmin.current_login_ip
    }

    return successResponse({ user }, '密码修改成功')
  })
}
