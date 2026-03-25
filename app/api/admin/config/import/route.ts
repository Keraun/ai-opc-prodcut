import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import unzipper from 'unzipper'

const VERSIONS_DIR = path.join(process.cwd(), 'config', 'json', 'versions')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'File must be a zip file' }, { status: 400 })
    }

    // 创建临时目录和文件
    const tempDir = path.join(process.cwd(), 'temp-import')
    const tempZipPath = path.join(tempDir, 'import.zip')

    // 确保临时目录存在
    await fs.mkdir(tempDir, { recursive: true })

    // 保存上传的文件
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(tempZipPath, fileBuffer)

    // 解压文件
    await fs.mkdir(tempDir, { recursive: true })
    await new Promise<void>((resolve, reject) => {
      fsSync.createReadStream(tempZipPath)
        .pipe(unzipper.Extract({ path: tempDir }))
        .on('close', resolve)
        .on('error', reject)
    })

    // 检查解压后的目录结构
    const extractedVersionsDir = path.join(tempDir, 'versions')
    const extractedVersionsDirExists = await fs
      .access(extractedVersionsDir)
      .then(() => true)
      .catch(() => false)

    if (!extractedVersionsDirExists) {
      // 清理临时文件
      await fs.rm(tempDir, { recursive: true, force: true })
      return NextResponse.json({ error: 'Invalid zip file structure' }, { status: 400 })
    }

    // 清空现有的 versions 目录
    await fs.rm(VERSIONS_DIR, { recursive: true, force: true })
    await fs.mkdir(VERSIONS_DIR, { recursive: true })

    // 复制解压后的文件到 versions 目录
    const copyDirectory = async (src: string, dest: string) => {
      const entries = await fs.readdir(src, { withFileTypes: true })
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
          await fs.mkdir(destPath, { recursive: true })
          await copyDirectory(srcPath, destPath)
        } else {
          await fs.copyFile(srcPath, destPath)
        }
      }
    }

    await copyDirectory(extractedVersionsDir, VERSIONS_DIR)

    // 清理临时文件
    await fs.rm(tempDir, { recursive: true, force: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Import config error:', error)
    return NextResponse.json({ error: 'Failed to import config' }, { status: 500 })
  }
}