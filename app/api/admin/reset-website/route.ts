import { NextRequest, NextResponse } from "next/server"
import { resetAllToTemplates } from "@/lib/config-manager"
import { logOperation } from "@/lib/operation-logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username) {
      return NextResponse.json({ success: false, message: "用户名不能为空" }, { status: 400 })
    }

    resetAllToTemplates()

    await logOperation(
      username,
      "reset_website",
      "一键还原网站配置",
      "将所有配置还原到模版文件状态"
    )

    return NextResponse.json({ success: true, message: "网站配置已成功还原到初始状态" })
  } catch (error) {
    console.error("还原网站配置失败:", error)
    return NextResponse.json({ success: false, message: "还原网站配置失败" }, { status: 500 })
  }
}