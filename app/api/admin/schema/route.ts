import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const schemaMap: Record<string, string> = {
  'article': 'article-schema.json',
  'site': 'site-config-schema.json',
  'navigation': 'navigation-schema.json',
  'homeBanner': 'home-banner-schema.json',
  'common': 'site-config-schema.json',
  'seo': 'site-config-schema.json',
  'footer': 'site-config-schema.json',
  'home': 'site-config-schema.json',
  'homeOrder': 'site-config-schema.json',
  'homePartners': 'site-config-schema.json',
  'homeProducts': 'site-config-schema.json',
  'homeServices': 'site-config-schema.json',
  'homePricing': 'site-config-schema.json',
  'homeAbout': 'site-config-schema.json',
  'homeContact': 'site-config-schema.json',
  'products': 'site-config-schema.json',
  'otherPages': 'site-config-schema.json',
  'custom': 'site-config-schema.json',
  'theme': 'site-config-schema.json'
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
