import { NextRequest } from "next/server"
import { readConfig, writeConfig } from "@/lib/config-manager"
import {
  successResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  notFoundResponse
} from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, superAdminToken, token, username, email, verificationCode, newPassword } = body
    const finalSuperAdminToken = superAdminToken || token

    if (!newPassword) {
      return badRequestResponse("请输入新密码")
    }

    if (newPassword.length < 8) {
      return badRequestResponse("密码长度至少为8位")
    }

    const accountConfig = readConfig('account')
    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    let adminIndex = -1

    if (method === "token") {
      if (!finalSuperAdminToken || !username) {
        return badRequestResponse("缺少必要参数")
      }

      const tokenConfig = readConfig('token') || { superAdminToken: '' }

      if (!tokenConfig.superAdminToken || tokenConfig.superAdminToken !== finalSuperAdminToken) {
        return unauthorizedResponse("输入的超级管理员口令不正确")
      }

      adminIndex = admins.findIndex((admin: any) => admin.username === username)

      if (adminIndex === -1) {
        return notFoundResponse("用户不存在")
      }
    } else if (method === "email") {
      if (!email || !verificationCode) {
        return badRequestResponse("缺少必要参数")
      }

      const verificationCodesConfig = readConfig('verificationCodes') || {}
      const storedData = verificationCodesConfig[email]
      
      if (!storedData) {
        return unauthorizedResponse("验证码已过期，请重新获取")
      }

      if (Date.now() > storedData.expiresAt) {
        delete verificationCodesConfig[email]
        writeConfig('verificationCodes', verificationCodesConfig)
        return unauthorizedResponse("验证码已过期，请重新获取")
      }

      if (storedData.code !== verificationCode) {
        return unauthorizedResponse("验证码错误")
      }

      adminIndex = admins.findIndex((admin: any) => admin.email === email)

      if (adminIndex === -1) {
        return notFoundResponse("该邮箱未绑定任何管理员账号")
      }

      delete verificationCodesConfig[email]
      writeConfig('verificationCodes', verificationCodesConfig)
    } else {
      return badRequestResponse("无效的重置方式")
    }

    admins[adminIndex].password = newPassword
    admins[adminIndex].must_change_password = false

    writeConfig('account', admins)

    const responseData: any = {
      username: method === "email" ? admins[adminIndex].username : undefined
    }

    return successResponse(responseData, "密码修改成功")
  } catch (error) {
    console.error("Reset password error:", error)
    return errorResponse("密码修改失败")
  }
}
