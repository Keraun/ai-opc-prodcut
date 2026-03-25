import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import unzipper from 'unzipper'
import { writeConfig } from '@/lib/config-manager'

const CONFIG_DIR = path.join(process.cwd(), 'config', 'json')
const RUNTIME_DIR = path.join(CONFIG_DIR, 'runtime')
const VERSIONS_DIR = path.join(CONFIG_DIR, 'versions')

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
    const extractedRuntimeDir = path.join(tempDir, 'runtime')
    const extractedVersionsDir = path.join(tempDir, 'versions')
    
    const extractedRuntimeDirExists = await fs
      .access(extractedRuntimeDir)
      .then(() => true)
      .catch(() => false)

    const extractedVersionsDirExists = await fs
      .access(extractedVersionsDir)
      .then(() => true)
      .catch(() => false)

    if (!extractedRuntimeDirExists && !extractedVersionsDirExists) {
      // 清理临时文件
      await fs.rm(tempDir, { recursive: true, force: true })
      return NextResponse.json({ error: 'Invalid zip file structure' }, { status: 400 })
    }

    // 导入运行时配置
    if (extractedRuntimeDirExists) {
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

      // 确保运行时目录存在
      if (!fsSync.existsSync(RUNTIME_DIR)) {
        await fs.mkdir(RUNTIME_DIR, { recursive: true })
      }

      await copyDirectory(extractedRuntimeDir, RUNTIME_DIR)
    }

    // 导入版本历史
    if (extractedVersionsDirExists) {
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

      // 清空现有的 versions 目录
      if (fsSync.existsSync(VERSIONS_DIR)) {
        await fs.rm(VERSIONS_DIR, { recursive: true, force: true })
      }
      await fs.mkdir(VERSIONS_DIR, { recursive: true })

      await copyDirectory(extractedVersionsDir, VERSIONS_DIR)
    }

    // 清理临时文件
    await fs.rm(tempDir, { recursive: true, force: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Import config error:', error)
    return NextResponse.json({ error: 'Failed to import config' }, { status: 500 })
  }
}