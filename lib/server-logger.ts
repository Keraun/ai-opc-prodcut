import "server-only"
import { writeFileSync, existsSync, mkdirSync, appendFileSync, readFileSync } from "fs"
import { join } from "path"

const LOG_DIR = join(process.cwd(), "logs")
const LOG_FILE = join(LOG_DIR, "server.log")
const LOG_CONFIG_FILE = join(LOG_DIR, ".log-enabled")

// 确保日志目录存在
function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true })
  }
}

// 获取当前时间字符串
function getTimestamp(): string {
  return new Date().toISOString()
}

// 检查日志是否启用
function isLogEnabled(): boolean {
  try {
    // 优先检查环境变量
    if (process.env.SERVER_LOG_ENABLED === "true") {
      return true
    }
    if (process.env.SERVER_LOG_ENABLED === "false") {
      return false
    }
    // 其次检查配置文件
    if (existsSync(LOG_CONFIG_FILE)) {
      const content = readFileSync(LOG_CONFIG_FILE, "utf-8").trim()
      return content === "true"
    }
  } catch {
    // 默认关闭
  }
  return false
}

// 写入日志到文件
function writeToFile(level: string, message: string, meta?: any) {
  if (!isLogEnabled()) return

  try {
    ensureLogDir()
    const logEntry = {
      timestamp: getTimestamp(),
      level,
      message,
      meta: meta || {},
    }
    const logLine = JSON.stringify(logEntry) + "\n"
    appendFileSync(LOG_FILE, logLine)
  } catch (error) {
    console.error("Failed to write log:", error)
  }
}

export const serverLogger = {
  // 检查日志是否启用
  isEnabled: isLogEnabled,

  // 启用日志
  enable: () => {
    try {
      ensureLogDir()
      writeFileSync(LOG_CONFIG_FILE, "true")
      console.log("[ServerLogger] 日志已启用")
    } catch (error) {
      console.error("[ServerLogger] 启用日志失败:", error)
    }
  },

  // 禁用日志
  disable: () => {
    try {
      ensureLogDir()
      writeFileSync(LOG_CONFIG_FILE, "false")
      console.log("[ServerLogger] 日志已禁用")
    } catch (error) {
      console.error("[ServerLogger] 禁用日志失败:", error)
    }
  },

  info: (message: string, meta?: any) => {
    writeToFile("INFO", message, meta)
    if (isLogEnabled()) {
      console.log(`[INFO] ${message}`, meta || "")
    }
  },

  warn: (message: string, meta?: any) => {
    writeToFile("WARN", message, meta)
    if (isLogEnabled()) {
      console.warn(`[WARN] ${message}`, meta || "")
    }
  },

  error: (message: string, meta?: any) => {
    writeToFile("ERROR", message, meta)
    // 错误日志始终输出到控制台
    console.error(`[ERROR] ${message}`, meta || "")
  },

  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === "development" && isLogEnabled()) {
      writeToFile("DEBUG", message, meta)
      console.log(`[DEBUG] ${message}`, meta || "")
    }
  },
}
