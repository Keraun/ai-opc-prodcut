import { NextRequest, NextResponse } from 'next/server'
import { ImageProcessor } from '@/lib/image-processor'

const imageProcessor = new ImageProcessor('public/uploads/editor')

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const directory = url.searchParams.get('directory') || undefined
    const stats = url.searchParams.get('stats') === 'true'

    if (stats) {
      const imageStats = await imageProcessor.getImageStats()
      return NextResponse.json({
        success: true,
        stats: imageStats,
      })
    }

    const images = await imageProcessor.getImageList(directory)
    
    return NextResponse.json({
      success: true,
      images,
      total: images.length,
    })
  } catch (error) {
    console.error('Get images error:', error)
    return NextResponse.json({ 
      success: false, 
      message: '获取图片列表失败' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { imagePath, imagePaths } = body

    if (!imagePath && (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0)) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少图片路径' 
      }, { status: 400 })
    }

    if (imagePaths && Array.isArray(imagePaths) && imagePaths.length > 0) {
      const fullPaths = imagePaths.map(path => 
        path.startsWith('/') ? `public${path}` : `public/${path}`
      )
      
      const result = await imageProcessor.deleteImages(fullPaths)
      
      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? `成功删除 ${result.deletedCount} 张图片` 
          : `删除 ${result.deletedCount} 张图片成功，${result.failedPaths.length} 张失败`,
        deletedCount: result.deletedCount,
        failedPaths: result.failedPaths
      })
    }

    const fullPath = imagePath.startsWith('/') 
      ? `public${imagePath}` 
      : `public/${imagePath}`

    const deleted = await imageProcessor.deleteImage(fullPath)
    
    if (deleted) {
      return NextResponse.json({
        success: true,
        message: '图片删除成功',
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '图片删除失败',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json({ 
      success: false, 
      message: '删除图片失败' 
    }, { status: 500 })
  }
}
