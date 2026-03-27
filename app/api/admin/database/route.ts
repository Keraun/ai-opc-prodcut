import { NextRequest } from 'next/server'
import { 
  wrapAuthApiHandler, 
  successResponse, 
  badRequestResponse 
} from '@/lib/api-utils'
import { createBackup, getBackupFiles, deleteBackup } from '@/lib/backup-utils'
import { exportToJson, migrateFromJson } from '@/lib/migrate'

export async function POST(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const body = await request.json()
    const { action } = body

    if (action === 'export') {
      exportToJson()
      return successResponse(undefined, '数据库导出成功，备份文件保存在 database/backup 目录')
    }
    
    if (action === 'migrate') {
      const useTemplates = body.useTemplates || false
      migrateFromJson(useTemplates)
      return successResponse(undefined, useTemplates ? '从模板迁移数据成功' : '从运行时数据迁移成功')
    }

    if (action === 'backup') {
      const suffix = body.suffix || ''
      const backupInfo = createBackup(suffix)
      return successResponse({
        backup: backupInfo
      }, '数据库备份成功')
    }

    if (action === 'list-backups') {
      const backups = getBackupFiles()
      return successResponse({
        backups,
        total: backups.length
      })
    }

    if (action === 'delete-backup') {
      const { filename } = body
      if (!filename) {
        return badRequestResponse('备份文件名不能为空')
      }
      
      const deleted = deleteBackup(filename)
      if (deleted) {
        return successResponse(undefined, '备份文件删除成功')
      } else {
        return badRequestResponse('备份文件不存在或删除失败')
      }
    }

    return badRequestResponse('无效的操作，支持: export, migrate, backup, list-backups, delete-backup')
  })
}

export async function GET(request: NextRequest) {
  return wrapAuthApiHandler(async () => {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'export') {
      exportToJson()
      return successResponse(undefined, '数据库导出成功，备份文件保存在 database/backup 目录')
    }

    if (action === 'list-backups') {
      const backups = getBackupFiles()
      return successResponse({
        backups,
        total: backups.length
      })
    }

    return badRequestResponse('无效的操作，支持: export, list-backups')
  })
}
