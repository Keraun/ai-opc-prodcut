import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { migrateFromJson } from '@/lib/migrate'

const DATABASE_DIR = path.join(process.cwd(), 'database')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.name.endsWith('.db')) {
      const dbPath = path.join(DATABASE_DIR, 'app.db')
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(dbPath, fileBuffer)
      
      return NextResponse.json({ 
        success: true, 
        message: '数据库导入成功' 
      })
    }

    if (file.name.endsWith('.zip')) {
      const tempDir = path.join(process.cwd(), 'temp-import')
      const tempZipPath = path.join(tempDir, 'import.zip')
      
      await fs.mkdir(tempDir, { recursive: true })
      
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(tempZipPath, fileBuffer)
      
      const unzipper = await import('unzipper')
      const fsSync = await import('fs')
      
      await new Promise<void>((resolve, reject) => {
        fsSync.createReadStream(tempZipPath)
          .pipe(unzipper.Extract({ path: tempDir }))
          .on('close', resolve)
          .on('error', reject)
      })
      
      const runtimeDir = path.join(tempDir, 'runtime')
      const runtimeExists = await fs.access(runtimeDir).then(() => true).catch(() => false)
      
      if (runtimeExists) {
        const tempRuntimePath = path.join(tempDir, 'runtime-temp')
        await fs.rename(runtimeDir, tempRuntimePath)
        
        const originalRuntimeDir = path.join(DATABASE_DIR, 'runtime')
        await fs.rename(tempRuntimePath, originalRuntimeDir)
        
        migrateFromJson(false)
        
        await fs.rm(originalRuntimeDir, { recursive: true, force: true })
        
        await fs.rm(tempDir, { recursive: true, force: true })
        
        return NextResponse.json({ 
          success: true, 
          message: '从JSON备份导入成功' 
        })
      }
      
      await fs.rm(tempDir, { recursive: true, force: true })
      
      return NextResponse.json({ 
        error: 'Invalid zip file structure. Expected runtime folder.' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'File must be .db or .zip file' 
    }, { status: 400 })
  } catch (error) {
    console.error('Import config error:', error)
    return NextResponse.json({ 
      error: 'Failed to import config',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
