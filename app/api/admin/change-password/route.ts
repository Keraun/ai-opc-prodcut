import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { oldPassword, newPassword } = body

    const customConfigPath = path.join(process.cwd(), "config/json/custom.json")
    const customConfig = JSON.parse(fs.readFileSync(customConfigPath, "utf-8"))

    if (oldPassword !== customConfig.admin.password) {
      return NextResponse.json({
        success: false,
        message: "原密码错误"
      }, { status: 400 })
    }

    customConfig.admin.password = newPassword
    customConfig.admin.mustChangePassword = false

    fs.writeFileSync(customConfigPath, JSON.stringify(customConfig, null, 2))

    return NextResponse.json({
      success: true,
      message: "密码修改成功"
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "密码修改失败"
    }, { status: 500 })
  }
}
