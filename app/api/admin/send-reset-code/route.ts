import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

function generateVerificationCode(): string {
  return Math.random().toString().slice(2, 8)
}

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
    const { email } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({
        success: false,
        message: "请输入有效的邮箱地址"
      }, { status: 400 })
    }

    const accountConfigPath = path.join(process.cwd(), "config/json/account.json")
    const accountConfig = JSON.parse(fs.readFileSync(accountConfigPath, "utf-8"))

    const admin = accountConfig.admins?.find((admin: any) => admin.email === email)

    if (!admin) {
      return NextResponse.json({
        success: false,
        message: "该邮箱未绑定任何管理员账号"
      }, { status: 404 })
    }

    const code = generateVerificationCode()
    const expiresAt = Date.now() + 5 * 60 * 1000

    const verificationCodes = loadVerificationCodes()
    verificationCodes[email] = { code, expiresAt }
    saveVerificationCodes(verificationCodes)

    console.log(`[Email Verification Code] Email: ${email}, Code: ${code}`)

    return NextResponse.json({
      success: true,
      message: "验证码已发送到您的邮箱",
      _debug_code: code
    })
  } catch (error) {
    console.error("Send reset code error:", error)
    return NextResponse.json({
      success: false,
      message: "验证码发送失败"
    }, { status: 500 })
  }
}
