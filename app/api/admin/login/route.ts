import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const customConfigPath = path.join(process.cwd(), "config/json/custom.json")
    const customConfig = JSON.parse(fs.readFileSync(customConfigPath, "utf-8"))

    if (username === customConfig.admin.username && password === customConfig.admin.password) {
      return NextResponse.json({
        success: true,
        mustChangePassword: customConfig.admin.mustChangePassword
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
