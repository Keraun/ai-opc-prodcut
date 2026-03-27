import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs'
import { wrapAuthApiHandler, successResponse, badRequestResponse } from '@/lib/api-utils'
import { createBackup } from '@/lib/backup-utils'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DB_PATH = path.join(DATABASE_DIR, 'app.db')

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return badRequestResponse('请上传数据库文件')
    }

    if (!file.name.endsWith('.db')) {
      return badRequestResponse('只支持 .db 数据库文件')
    }

    let backupCreated
    if (fs.existsSync(DB_PATH)) {
      backupCreated = createBackup('before-import')
    }

    try {
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      
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
      
      fs.writeFileSync(DB_PATH, fileBuffer)
      
      return successResponse({
        message: '数据库导入成功',
        backupCreated
      }, '数据库导入成功')
    } catch (error) {
      return badRequestResponse(`数据库导入失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })
}
