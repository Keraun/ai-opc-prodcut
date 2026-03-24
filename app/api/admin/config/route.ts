import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const configDir = path.join(process.cwd(), "config/json")
    
    const siteConfig = JSON.parse(fs.readFileSync(path.join(configDir, "site.json"), "utf-8"))
    const commonConfig = JSON.parse(fs.readFileSync(path.join(configDir, "common.json"), "utf-8"))
    const pagesConfig = JSON.parse(fs.readFileSync(path.join(configDir, "pages.json"), "utf-8"))
    const customConfig = JSON.parse(fs.readFileSync(path.join(configDir, "custom.json"), "utf-8"))

    return NextResponse.json({
      site: siteConfig,
      common: commonConfig,
      pages: pagesConfig,
      custom: customConfig
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "获取配置失败"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    const configPath = path.join(process.cwd(), `config/json/${type}.json`)
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2))

    return NextResponse.json({
      success: true,
      message: "配置保存成功"
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "配置保存失败"
    }, { status: 500 })
  }
}
