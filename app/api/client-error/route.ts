import { appendFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

const LOG_DIR = join(process.cwd(), "logs")
const LOG_FILE = join(LOG_DIR, "client-error.log")

function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true })
  }
}

function getTimestamp(): string {
  return new Date().toISOString()
}

function isClientErrorLogEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CLIENT_ERROR_LOG_ENABLED === 'true'
}

export async function POST(request: NextRequest) {
  if (!isClientErrorLogEnabled()) {
    return NextResponse.json({ success: true, message: '客户端错误日志已禁用' })
  }

  try {
    const errorData = await request.json()

    ensureLogDir()

    const logEntry = {
      timestamp: getTimestamp(),
      level: "ERROR",
      source: "client",
      ...errorData,
    }

    const logLine = JSON.stringify(logEntry) + "\n"
    appendFileSync(LOG_FILE, logLine)

    console.log("[ClientError] 前端错误已记录:", errorData.message || errorData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ClientError] 记录前端错误失败:", error)
    return NextResponse.json({ success: false, error: "记录失败" }, { status: 500 })
  }
}
