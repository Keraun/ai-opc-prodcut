import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import archiver from 'archiver'

const CONFIG_DIR = path.join(process.cwd(), 'config', 'json')
const RUNTIME_DIR = path.join(CONFIG_DIR, 'runtime')
const VERSIONS_DIR = path.join(CONFIG_DIR, 'versions')

export async function GET(request: NextRequest) {
  try {
    // 创建临时 zip 文件
    const tempZipPath = path.join(process.cwd(), 'temp-config-export.zip')
    const output = await fs.open(tempZipPath, 'w')
    const archive = archiver('zip', { zlib: { level: 9 } })

    archive.pipe(output.createWriteStream())

    // 导出运行时配置
    const runtimeDirExists = await fs
      .access(RUNTIME_DIR)
      .then(() => true)
      .catch(() => false)

    if (runtimeDirExists) {
      archive.directory(RUNTIME_DIR, 'runtime')
    }

    // 导出版本历史
    const versionsDirExists = await fs
      .access(VERSIONS_DIR)
      .then(() => true)
      .catch(() => false)

    if (versionsDirExists) {
      archive.directory(VERSIONS_DIR, 'versions')
    }

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