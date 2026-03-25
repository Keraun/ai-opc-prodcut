import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import archiver from 'archiver'

const VERSIONS_DIR = path.join(process.cwd(), 'config', 'json', 'versions')

export async function GET(request: NextRequest) {
  try {
    // 检查 versions 目录是否存在
    const versionsDirExists = await fs
      .access(VERSIONS_DIR)
      .then(() => true)
      .catch(() => false)

    if (!versionsDirExists) {
      return NextResponse.json({ error: 'Versions directory not found' }, { status: 404 })
    }

    // 创建临时 zip 文件
    const tempZipPath = path.join(process.cwd(), 'temp-config-export.zip')
    const output = await fs.open(tempZipPath, 'w')
    const archive = archiver('zip', { zlib: { level: 9 } })

    archive.pipe(output.createWriteStream())
    archive.directory(VERSIONS_DIR, 'versions')
    await archive.finalize()
    await output.close()

    // 读取 zip 文件内容
    const zipBuffer = await fs.readFile(tempZipPath)

    // 删除临时文件
    await fs.unlink(tempZipPath)

    // 返回 zip 文件
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