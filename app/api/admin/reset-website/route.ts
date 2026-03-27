import { NextRequest } from "next/server"
import path from 'path'
import fs from 'fs'
import { 
  wrapAuthApiHandler, 
  successResponse, 
  badRequestResponse,
  errorResponse
} from "@/lib/api-utils"
import { createBackup, validateDatabase } from "@/lib/backup-utils"

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DB_PATH = path.join(DATABASE_DIR, 'app.db')
const DEFAULT_DB_PATH = path.join(DATABASE_DIR, 'default.db')

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const body = await request.json()
    const { username } = body

    if (!username) {
      return badRequestResponse("用户名不能为空")
    }

    const defaultDbExists = fs.existsSync(DEFAULT_DB_PATH)
    if (!defaultDbExists) {
      return badRequestResponse("默认数据库文件 (default.db) 不存在")
    }

    let backupCreated
    if (fs.existsSync(DB_PATH)) {
      backupCreated = createBackup('before-reset')
    }

    try {
      const dbBuffer = fs.readFileSync(DEFAULT_DB_PATH)
      
      const shmPath = DB_PATH + '-shm'
      const walPath = DB_PATH + '-wal'
      
      if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH)
      }
      if (fs.existsSync(shmPath)) {
        fs.unlinkSync(shmPath)
      }
      if (fs.existsSync(walPath)) {
        fs.unlinkSync(walPath)
      }
      
      fs.writeFileSync(DB_PATH, dbBuffer)

      const validation = validateDatabase()
      if (!validation.valid) {
        return errorResponse(`数据库还原成功但验证失败: ${validation.error}`)
      }

      return successResponse({
        message: "网站配置已成功还原到初始状态",
        backupCreated,
        tables: validation.tables
      }, "网站配置已成功还原")
    } catch (error) {
      return errorResponse(`网站配置还原失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })
}

export async function GET(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'validate') {
      const validation = validateDatabase()
      return successResponse(validation)
    }

    if (action === 'check-default') {
      const defaultDbExists = fs.existsSync(DEFAULT_DB_PATH)
      let defaultDbInfo = null
      
      if (defaultDbExists) {
        const stats = fs.statSync(DEFAULT_DB_PATH)
        defaultDbInfo = {
          exists: true,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          modifiedAt: stats.mtime
        }
      }

      return successResponse({
        defaultDb: defaultDbInfo
      })
    }

    return badRequestResponse("无效的操作，支持: validate, check-default")
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
