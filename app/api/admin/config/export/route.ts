import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import archiver from 'archiver'
import { exportToJson } from '@/lib/migrate'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const DB_PATH = path.join(DATABASE_DIR, 'app.db')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'db'

    if (format === 'db') {
      const dbExists = await fs.access(DB_PATH).then(() => true).catch(() => false)
      
      if (!dbExists) {
        return NextResponse.json({ error: 'Database file not found' }, { status: 404 })
      }
      
      const dbBuffer = await fs.readFile(DB_PATH)
      
      return new NextResponse(dbBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename=app-${new Date().toISOString().split('T')[0]}.db`
        }
      })
    }

    if (format === 'json') {
      exportToJson()
      
      const backupDir = path.join(DATABASE_DIR, 'backup')
      const tempZipPath = path.join(process.cwd(), 'temp-config-export.zip')
      const output = await fs.open(tempZipPath, 'w')
      const archive = archiver('zip', { zlib: { level: 9 } })

      archive.pipe(output.createWriteStream())

      const backupDirExists = await fs.access(backupDir).then(() => true).catch(() => false)

      if (backupDirExists) {
        archive.directory(backupDir, 'runtime')
      }

      await archive.finalize()
      await output.close()

      const zipBuffer = await fs.readFile(tempZipPath)

      await fs.unlink(tempZipPath)

      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename=config-export-${new Date().toISOString().split('T')[0]}.zip`
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format. Use "db" or "json"' }, { status: 400 })
  } catch (error) {
    console.error('Export config error:', error)
    return NextResponse.json({ 
      error: 'Failed to export config',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
