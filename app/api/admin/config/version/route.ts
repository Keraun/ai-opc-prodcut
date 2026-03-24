import { NextRequest, NextResponse } from "next/server"
import { getVersionHistory, getPreviousVersion, getVersionData, getLatestVersion } from "@/lib/version-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configType = searchParams.get("type")
    const action = searchParams.get("action")

    if (!configType) {
      return NextResponse.json({
        success: false,
        message: "缺少配置类型参数"
      }, { status: 400 })
    }

    if (action === "latest") {
      const { info, data } = getLatestVersion(configType)
      
      return NextResponse.json({
        success: true,
        version: info,
        data: data
      })
    }

    if (action === "previous") {
      const { info, data } = getPreviousVersion(configType)
      
      if (!info || !data) {
        return NextResponse.json({
          success: false,
          message: "没有找到上一版本"
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        version: info,
        data: data
      })
    }

    if (action === "history") {
      const history = getVersionHistory(configType)
      return NextResponse.json({
        success: true,
        history: history
      })
    }

    if (action === "version") {
      const filename = searchParams.get("filename")
      
      if (!filename) {
        return NextResponse.json({
          success: false,
          message: "缺少版本文件名参数"
        }, { status: 400 })
      }

      const data = getVersionData(configType, filename)
      
      if (!data) {
        return NextResponse.json({
          success: false,
          message: "版本不存在"
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: data
      })
    }

    return NextResponse.json({
      success: false,
      message: "无效的操作"
    }, { status: 400 })

  } catch (error) {
    console.error("获取版本信息失败:", error)
    return NextResponse.json({
      success: false,
      message: "获取版本信息失败"
    }, { status: 500 })
  }
}
