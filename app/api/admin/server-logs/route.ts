import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"
import { checkAdminAuth, successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-utils"

const SERVER_LOG_FILE = join(process.cwd(), "logs", "server.log")
const CLIENT_LOG_FILE = join(process.cwd(), "logs", "client-error.log")

function readLogsFromFile(filePath: string, source: string) {
  if (!existsSync(filePath)) {
    return []
  }
  const logContent = readFileSync(filePath, "utf-8")
  return logContent
    .trim()
    .split("\n")
    .filter(line => line.trim())
    .map(line => {
      try {
        const parsed = JSON.parse(line)
        return { ...parsed, source: parsed.source || source }
      } catch {
        return { raw: line, source }
      }
    })
}

export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse()
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'

    let logs: any[] = []

    if (type === 'all' || type === 'server') {
      const serverLogs = readLogsFromFile(SERVER_LOG_FILE, 'server')
      logs = logs.concat(serverLogs)
    }

    if (type === 'all' || type === 'client') {
      const clientLogs = readLogsFromFile(CLIENT_LOG_FILE, 'client')
      logs = logs.concat(clientLogs)
    }

    logs.sort((a, b) => {
      const timeA = a.timestamp || a.raw || ''
      const timeB = b.timestamp || b.raw || ''
      return timeB.localeCompare(timeA)
    })

    return successResponse({ logs })
  } catch (error) {
    console.error("Failed to read logs:", error)
    return errorResponse("读取日志失败", 500)
  }
}
