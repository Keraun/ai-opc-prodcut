import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, oldPassword, newPassword } = body

    const accountConfigPath = path.join(process.cwd(), "config/json/account.json")
    const accountConfig = JSON.parse(fs.readFileSync(accountConfigPath, "utf-8"))

    const adminIndex = accountConfig.admins?.findIndex((admin: any) => admin.username === username)

    if (adminIndex === -1 || adminIndex === undefined) {
      return NextResponse.json({
        success: false,
        message: "用户不存在"
      }, { status: 400 })
    }

    if (oldPassword !== accountConfig.admins[adminIndex].password) {
      return NextResponse.json({
        success: false,
        message: "原密码错误"
      }, { status: 400 })
    }

    accountConfig.admins[adminIndex].password = newPassword
    accountConfig.admins[adminIndex].mustChangePassword = false

    fs.writeFileSync(accountConfigPath, JSON.stringify(accountConfig, null, 2))

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
