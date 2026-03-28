import { NextRequest } from "next/server"
import fs from "fs"
import path from "path"
import { sendEmail, generateVerificationCodeEmail } from "@/lib/email"
import { successResponse, errorResponse, badRequestResponse, notFoundResponse } from "@/lib/api-utils"

function generateVerificationCode(): string {
  return Math.random().toString().slice(2, 8)
}

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
    const { email } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequestResponse("请输入有效的邮箱地址")
    }

    const accountConfigPath = path.join(process.cwd(), "config/json/runtime/account.json")
    const accountConfig = JSON.parse(fs.readFileSync(accountConfigPath, "utf-8"))

    const admins = Array.isArray(accountConfig) ? accountConfig : accountConfig.admins || []

    const admin = admins.find((admin: any) => admin.email === email)

    if (!admin) {
      return notFoundResponse("该邮箱未绑定任何管理员账号")
    }

    const code = generateVerificationCode()
    const expiresAt = Date.now() + 5 * 60 * 1000

    const verificationCodes = loadVerificationCodes()
    verificationCodes[email] = { code, expiresAt }
    saveVerificationCodes(verificationCodes)

    const emailHtml = generateVerificationCodeEmail(code)
    const emailSent = await sendEmail({
      to: email,
      subject: "【】密码重置验证码",
      html: emailHtml
    })

    if (!emailSent) {
      console.log(`[Email Verification Code - Fallback] Email: ${email}, Code: ${code}`)
      return successResponse({
        _debug_code: process.env.NODE_ENV === 'development' ? code : undefined
      }, "验证码已生成，但邮件发送失败。请联系管理员或查看服务器日志获取验证码。")
    }

    return successResponse(null, "验证码已发送到您的邮箱，请注意查收")
  } catch (error) {
    console.error("Send reset code error:", error)
    return errorResponse("验证码发送失败")
  }
}
