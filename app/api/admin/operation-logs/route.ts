import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const operationLogsPath = path.join(process.cwd(), "config/json/system-operation-logs.json")
    const operationLogs = JSON.parse(fs.readFileSync(operationLogsPath, "utf-8"))
    
    return NextResponse.json(operationLogs)
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "获取操作记录失败"
    }, { status: 500 })
  }
}
