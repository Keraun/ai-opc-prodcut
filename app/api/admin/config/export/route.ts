import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs'
import { wrapAuthApiHandler, successResponse, badRequestResponse } from '@/lib/api-utils'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DB_PATH = path.join(DATABASE_DIR, 'app.db')

export async function GET(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const dbExists = fs.existsSync(DB_PATH)
    
    if (!dbExists) {
      return badRequestResponse('数据库文件不存在')
    }
    
    const dbBuffer = fs.readFileSync(DB_PATH)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    return new Response(dbBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=app-database-${timestamp}.db`
      }
    })
  })
}
