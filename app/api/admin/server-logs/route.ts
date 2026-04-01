import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"
import { checkAdminAuth, successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-utils"

const LOG_FILE = join(process.cwd(), "logs", "server.log")

export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse()
    }

    // 读取日志文件
    if (!existsSync(LOG_FILE)) {
      return successResponse({ logs: [] })
    }

    const logContent = readFileSync(LOG_FILE, "utf-8")
    const logs = logContent
      .trim()
      .split("\n")
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line)
        } catch {
          return { raw: line }
        }
      })
      .reverse() // 最新的在前面

    return successResponse({ logs })
  } catch (error) {
    console.error("Failed to read server logs:", error)
    return errorResponse("读取日志失败", 500)
  }
}
