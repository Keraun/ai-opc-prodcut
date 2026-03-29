import { NextRequest, NextResponse } from 'next/server'
import { ImageProcessor } from '@/lib/image-processor'

const imageProcessor = new ImageProcessor('public/uploads/editor')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, message: '没有找到文件' }, { status: 400 })
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: '文件大小不能超过10MB' }, { status: 400 })
    }
    
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: '只支持图片文件' }, { status: 400 })
    }

    const url = new URL(request.url)
    const quality = parseInt(url.searchParams.get('quality') || '80')
    const width = url.searchParams.get('width') ? parseInt(url.searchParams.get('width')!) : undefined
    const height = url.searchParams.get('height') ? parseInt(url.searchParams.get('height')!) : undefined

    const processedImage = await imageProcessor.processImage(file, {
      quality,
      width,
      height,
      fit: 'cover',
    })

    const savedPercentage = ((processedImage.original.size - processedImage.webp.size) / processedImage.original.size * 100).toFixed(1)

    return NextResponse.json({
      success: true,
      url: processedImage.webp.url,
      originalUrl: processedImage.original.url,
      message: '上传成功',
      width: processedImage.webp.width,
      height: processedImage.webp.height,
      webpSize: processedImage.webp.size,
      originalSize: processedImage.original.size,
      savedPercentage,
      format: processedImage.original.format,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      success: false, 
      message: '上传失败' 
    }, { status: 500 })
  }
}
