import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, message: '没有找到文件' }, { status: 400 })
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: '文件大小不能超过5MB' }, { status: 400 })
    }
    
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: '只支持图片文件' }, { status: 400 })
    }
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'editor')
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}_${randomStr}.${ext}`
    const filePath = path.join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)
    
    const url = `/uploads/editor/${fileName}`
    
    return NextResponse.json({ 
      success: true, 
      url,
      message: '上传成功' 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      success: false, 
      message: '上传失败' 
    }, { status: 500 })
  }
}
