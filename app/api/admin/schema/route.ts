import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
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
