import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const loginLogsPath = path.join(process.cwd(), "config/json/login-logs.json")
    const loginLogs = JSON.parse(fs.readFileSync(loginLogsPath, "utf-8"))
    
    return NextResponse.json(loginLogs)
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "获取登入记录失败"
    }, { status: 500 })
  }
}
