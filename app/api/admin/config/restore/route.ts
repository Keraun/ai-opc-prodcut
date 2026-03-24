import { NextRequest, NextResponse } from "next/server"
import { restoreVersion, getPreviousVersion } from "@/lib/version-manager"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, filename } = body

    if (!type) {
      return NextResponse.json({
        success: false,
        message: "缺少配置类型参数"
      }, { status: 400 })
    }

    let targetFilename = filename

    if (!targetFilename) {
      const { info } = getPreviousVersion(type)
      
      if (!info) {
        return NextResponse.json({
          success: false,
          message: "没有找到上一版本"
        }, { status: 404 })
      }
      
      targetFilename = info.filename
    }

    const success = restoreVersion(type, targetFilename)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "版本还原成功"
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "版本还原失败"
      }, { status: 500 })
    }

  } catch (error) {
    console.error("还原版本失败:", error)
    return NextResponse.json({
      success: false,
      message: "还原版本失败"
    }, { status: 500 })
  }
}
