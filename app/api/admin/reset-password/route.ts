import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"
import { successResponse, errorResponse, badRequestResponse, unauthorizedResponse, notFoundResponse } from "@/lib/api-utils"

function getVerificationCodesPath(): string {
  return path.join(process.cwd(), "config/json/system-verification-codes.json")
}

function loadVerificationCodes(): Record<string, { code: string; expiresAt: number }> {
  const filePath = getVerificationCodesPath()
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Load verification codes error:", error)
  }
  return {}
}

function saveVerificationCodes(codes: Record<string, { code: string; expiresAt: number }>) {
  const filePath = getVerificationCodesPath()
  fs.writeFileSync(filePath, JSON.stringify(codes, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, superAdminToken, username, email, verificationCode, newPassword } = body

    if (!newPassword) {
      return badRequestResponse("请输入新密码")
    }

    if (newPassword.length < 8) {
      return badRequestResponse("密码长度至少为8位")
    }

    const accountConfigPath = path.join(process.cwd(), "config/json/runtime/account.json")
    const accountConfig = JSON.parse(fs.readFileSync(accountConfigPath, "utf-8"))

    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    let adminIndex = -1

    if (method === "token") {
      if (!superAdminToken || !username) {
        return badRequestResponse("缺少必要参数")
      }

      const tokenConfigPath = path.join(process.cwd(), "config/json/system-token.json")
      const tokenConfig = JSON.parse(fs.readFileSync(tokenConfigPath, "utf-8"))

      if (!tokenConfig.superAdminToken || tokenConfig.superAdminToken !== superAdminToken) {
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

      const verificationCodes = loadVerificationCodes()
      const storedData = verificationCodes[email]
      
      if (!storedData) {
        return unauthorizedResponse("验证码已过期，请重新获取")
      }

      if (Date.now() > storedData.expiresAt) {
        delete verificationCodes[email]
        saveVerificationCodes(verificationCodes)
        return unauthorizedResponse("验证码已过期，请重新获取")
      }

      if (storedData.code !== verificationCode) {
        return unauthorizedResponse("验证码错误")
      }

      adminIndex = admins.findIndex((admin: any) => admin.email === email)

      if (adminIndex === -1) {
        return notFoundResponse("该邮箱未绑定任何管理员账号")
      }

      delete verificationCodes[email]
      saveVerificationCodes(verificationCodes)
    } else {
      return badRequestResponse("无效的重置方式")
    }

    admins[adminIndex].password = newPassword
    admins[adminIndex].mustChangePassword = false

    fs.writeFileSync(accountConfigPath, JSON.stringify(admins, null, 2))

    const responseData: any = {
      username: method === "email" ? admins[adminIndex].username : undefined
    }

    return successResponse(responseData, "密码修改成功")
  } catch (error) {
    console.error("Reset password error:", error)
    return errorResponse("密码修改失败")
  }
}
