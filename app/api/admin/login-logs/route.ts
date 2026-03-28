import fs from "fs"
import path from "path"
import { successResponse, errorResponse } from "@/lib/api-utils"

export async function GET() {
  try {
    const loginLogsPath = path.join(process.cwd(), "config/json/system-login-logs.json")
    const loginLogs = JSON.parse(fs.readFileSync(loginLogsPath, "utf-8"))
    
    return successResponse(loginLogs)
  } catch (error) {
    console.error('获取登入记录失败:', error)
    return errorResponse("获取登入记录失败")
  }
}
