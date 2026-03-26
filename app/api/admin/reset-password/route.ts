import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

function getVerificationCodesPath(): string {
  return path.join(process.cwd(), "config/json/verification-codes.json")
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
      return NextResponse.json({
        success: false,
        message: "请输入新密码"
      }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        message: "密码长度至少为8位"
      }, { status: 400 })
    }

    const accountConfigPath = path.join(process.cwd(), "config/json/runtime/account.json")
    const accountConfig = JSON.parse(fs.readFileSync(accountConfigPath, "utf-8"))

    // 兼容两种格式：数组格式和 { admins: [...] } 对象格式
    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    let adminIndex = -1

    if (method === "token") {
      if (!superAdminToken || !username) {
        return NextResponse.json({
          success: false,
          message: "缺少必要参数"
        }, { status: 400 })
      }

      const tokenConfigPath = path.join(process.cwd(), "config/json/system-token.json")
      const tokenConfig = JSON.parse(fs.readFileSync(tokenConfigPath, "utf-8"))

      if (!tokenConfig.superAdminToken || tokenConfig.superAdminToken !== superAdminToken) {
        return NextResponse.json({
          success: false,
          message: "超级管理员口令错误"
        }, { status: 401 })
      }

      adminIndex = admins.findIndex((admin: any) => admin.username === username)

      if (adminIndex === -1) {
        return NextResponse.json({
          success: false,
          message: "用户不存在"
        }, { status: 404 })
      }
    } else if (method === "email") {
      if (!email || !verificationCode) {
        return NextResponse.json({
          success: false,
          message: "缺少必要参数"
        }, { status: 400 })
      }

      const verificationCodes = loadVerificationCodes()
      const storedData = verificationCodes[email]
      
      if (!storedData) {
        return NextResponse.json({
          success: false,
          message: "验证码已过期，请重新获取"
        }, { status: 401 })
      }

      if (Date.now() > storedData.expiresAt) {
        delete verificationCodes[email]
        saveVerificationCodes(verificationCodes)
        return NextResponse.json({
          success: false,
          message: "验证码已过期，请重新获取"
        }, { status: 401 })
      }

      if (storedData.code !== verificationCode) {
        return NextResponse.json({
          success: false,
          message: "验证码错误"
        }, { status: 401 })
      }

      adminIndex = admins.findIndex((admin: any) => admin.email === email)

      if (adminIndex === -1) {
        return NextResponse.json({
          success: false,
          message: "该邮箱未绑定任何管理员账号"
        }, { status: 404 })
      }

      delete verificationCodes[email]
      saveVerificationCodes(verificationCodes)
    } else {
      return NextResponse.json({
        success: false,
        message: "无效的重置方式"
      }, { status: 400 })
    }

    admins[adminIndex].password = newPassword
    admins[adminIndex].mustChangePassword = false

    fs.writeFileSync(accountConfigPath, JSON.stringify(admins, null, 2))

    const response: any = {
      success: true,
      message: "密码修改成功"
    }

    if (method === "email") {
      response.username = admins[adminIndex].username
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({
      success: false,
      message: "密码修改失败"
    }, { status: 500 })
  }
}
