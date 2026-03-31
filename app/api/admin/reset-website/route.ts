import { NextRequest, NextResponse } from "next/server"
import { 
  wrapAuthApiHandler, 
  successResponse, 
  badRequestResponse, 
  errorResponse,
  withAuth
} from "@/lib/api-utils"
import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    try {
      const body = await request.json()
      const { username } = body

      if (!username) {
        return badRequestResponse('缺少用户名参数')
      }

      const initDatabaseZipPath = path.join(process.cwd(), 'database', 'init_database.zip')
      const runtimeDir = path.join(process.cwd(), 'database', 'runtime')

      if (!fs.existsSync(initDatabaseZipPath)) {
        return badRequestResponse('初始化数据库文件不存在')
      }

      if (!fs.existsSync(runtimeDir)) {
        fs.mkdirSync(runtimeDir, { recursive: true })
      }

      const zip = new AdmZip(initDatabaseZipPath)
      zip.extractAllTo(runtimeDir, true)

      console.log(`网站配置已由用户 ${username} 还原到初始状态`)

      return successResponse(undefined, '网站配置已成功还原到初始状态')
    } catch (error) {
      console.error('还原网站配置失败:', error)
      return errorResponse('还原网站配置失败')
    }
  })
}

export async function GET(request: NextRequest) {
  return withAuth(async () => {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'check-default') {
      const initDatabaseZipPath = path.join(process.cwd(), 'database', 'init_database.zip')
      const exists = fs.existsSync(initDatabaseZipPath)
      return successResponse({ exists })
    }

    if (action === 'validate') {
      const runtimeDir = path.join(process.cwd(), 'database', 'runtime')
      const tables = [
        'accounts.json',
        'articles.json',
        'messages.json',
        'module_registry.json',
        'page_list.json',
        'page_modules.json',
        'pages.json',
        'products.json',
        'push_records.json',
        'system_config.json',
        'theme_config.json',
        'verification_codes.json'
      ]

      const valid = tables.every(table => 
        fs.existsSync(path.join(runtimeDir, table))
      )

      return successResponse({ valid, tables })
    }

    return badRequestResponse('无效的操作')
  })
}
