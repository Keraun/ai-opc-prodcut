import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const accountConfigPath = path.join(process.cwd(), "config/json/account.json")
    const accountConfig = JSON.parse(fs.readFileSync(accountConfigPath, "utf-8"))

    const admin = accountConfig.admins?.find((admin: any) => admin.username === username)

    if (admin && admin.password === password) {
      return NextResponse.json({
        success: true,
        mustChangePassword: admin.mustChangePassword,
        user: {
          username: admin.username,
          remark: admin.remark,
          mustChangePassword: admin.mustChangePassword
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "用户名或密码错误"
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "登录失败"
    }, { status: 500 })
  }
}
