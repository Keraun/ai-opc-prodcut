import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import unzipper from 'unzipper'

const DATABASE_DIR = path.join(process.cwd(), 'database')
const RUNTIME_DIR = path.join(DATABASE_DIR, 'runtime')
const VERSIONS_DIR = path.join(DATABASE_DIR, 'versions')

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

    const tempDir = path.join(process.cwd(), 'temp-import')
    const tempZipPath = path.join(tempDir, 'import.zip')

    await fs.mkdir(tempDir, { recursive: true })

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(tempZipPath, fileBuffer)

    await fs.mkdir(tempDir, { recursive: true })
    await new Promise<void>((resolve, reject) => {
      fsSync.createReadStream(tempZipPath)
        .pipe(unzipper.Extract({ path: tempDir }))
        .on('close', resolve)
        .on('error', reject)
    })

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
      await fs.rm(tempDir, { recursive: true, force: true })
      return NextResponse.json({ error: 'Invalid zip file structure' }, { status: 400 })
    }

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

      if (!fsSync.existsSync(RUNTIME_DIR)) {
        await fs.mkdir(RUNTIME_DIR, { recursive: true })
      }

      await copyDirectory(extractedRuntimeDir, RUNTIME_DIR)
    }

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

      if (fsSync.existsSync(VERSIONS_DIR)) {
        await fs.rm(VERSIONS_DIR, { recursive: true, force: true })
      }
      await fs.mkdir(VERSIONS_DIR, { recursive: true })

      await copyDirectory(extractedVersionsDir, VERSIONS_DIR)
    }

    await fs.rm(tempDir, { recursive: true, force: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Import config error:', error)
    return NextResponse.json({ error: 'Failed to import config' }, { status: 500 })
  }
}
