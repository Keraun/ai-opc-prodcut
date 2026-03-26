import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import archiver from 'archiver'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const RUNTIME_DIR = path.join(DATABASE_DIR, 'runtime')
const VERSIONS_DIR = path.join(DATABASE_DIR, 'versions')

export async function GET(request: NextRequest) {
  try {
    const tempZipPath = path.join(process.cwd(), 'temp-config-export.zip')
    const output = await fs.open(tempZipPath, 'w')
    const archive = archiver('zip', { zlib: { level: 9 } })

    archive.pipe(output.createWriteStream())

    const runtimeDirExists = await fs
      .access(RUNTIME_DIR)
      .then(() => true)
      .catch(() => false)

    if (runtimeDirExists) {
      archive.directory(RUNTIME_DIR, 'runtime')
    }

    const versionsDirExists = await fs
      .access(VERSIONS_DIR)
      .then(() => true)
      .catch(() => false)

    if (versionsDirExists) {
      archive.directory(VERSIONS_DIR, 'versions')
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
  } catch (error) {
    console.error('Export config error:', error)
    return NextResponse.json({ error: 'Failed to export config' }, { status: 500 })
  }
}
