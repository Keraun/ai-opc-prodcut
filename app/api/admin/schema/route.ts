import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const schemaMap: Record<string, string> = {
  'article': 'article-schema.json',
  'site': 'site-config-schema.json',
  'navigation': 'navigation-schema.json',
  'homeBanner': 'home-banner-schema.json'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type && schemaMap[type]) {
      const schemaPath = path.join(process.cwd(), "config/json/templates", schemaMap[type])
      if (fs.existsSync(schemaPath)) {
        const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"))
        return NextResponse.json(schema)
      }
    }

    if (type === 'article') {
      const schemaPath = path.join(process.cwd(), "config/json/templates/article-schema.json")
      const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"))
      return NextResponse.json(schema)
    }

    const schemaPath = path.join(process.cwd(), "config/json/schema.json")
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"))

    return NextResponse.json(schema)
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "获取配置说明失败"
    }, { status: 500 })
  }
}
