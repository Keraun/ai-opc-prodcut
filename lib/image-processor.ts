import sharp from 'sharp'
import { writeFile, mkdir, unlink, readdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export interface ImageProcessOptions {
  quality?: number
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface ProcessedImage {
  original: {
    path: string
    url: string
    width: number
    height: number
    size: number
    format: string
  }
  webp: {
    path: string
    url: string
    width: number
    height: number
    size: number
  }
}

export class ImageProcessor {
  private uploadDir: string

  constructor(uploadDir: string = 'public/uploads') {
    this.uploadDir = uploadDir
  }

  async processImage(
    file: File | Buffer,
    options: ImageProcessOptions = {}
  ): Promise<ProcessedImage> {
    const {
      quality = 80,
      width,
      height,
      fit = 'cover'
    } = options

    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
    
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}_${randomStr}`

    const uploadPath = path.join(process.cwd(), this.uploadDir)
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    const sharpInstance = sharp(buffer)
    const metadata = await sharpInstance.metadata()

    const originalExt = metadata.format || 'jpeg'
    const originalFileName = `${fileName}.${originalExt}`
    const originalPath = path.join(uploadPath, originalFileName)

    let originalImage = sharp(buffer)
    if (width || height) {
      originalImage = originalImage.resize(width, height, {
        fit,
        withoutEnlargement: true,
      })
    }

    await originalImage.toFile(originalPath)

    const originalStats = await stat(originalPath)
    const originalMetadata = await sharp(originalPath).metadata()

    const webpFileName = `${fileName}.webp`
    const webpPath = path.join(uploadPath, webpFileName)

    await sharp(buffer)
      .resize(width, height, {
        fit,
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toFile(webpPath)

    const webpStats = await stat(webpPath)
    const webpMetadata = await sharp(webpPath).metadata()

    return {
      original: {
        path: originalPath,
        url: `${this.uploadDir.replace('public', '')}/${originalFileName}`,
        width: originalMetadata.width || 0,
        height: originalMetadata.height || 0,
        size: originalStats.size,
        format: originalExt,
      },
      webp: {
        path: webpPath,
        url: `${this.uploadDir.replace('public', '')}/${webpFileName}`,
        width: webpMetadata.width || 0,
        height: webpMetadata.height || 0,
        size: webpStats.size,
      },
    }
  }

  async deleteImage(imagePath: string): Promise<boolean> {
    try {
      const fullPath = imagePath.startsWith('/') 
        ? path.join(process.cwd(), 'public', imagePath)
        : imagePath

      if (existsSync(fullPath)) {
        await unlink(fullPath)
      }

      const dir = path.dirname(fullPath)
      const fileName = path.basename(fullPath, path.extname(fullPath))
      
      const files = await readdir(dir)
      for (const file of files) {
        if (file.startsWith(fileName + '.')) {
          await unlink(path.join(dir, file))
        }
      }

      return true
    } catch (error) {
      console.error('Error deleting image:', error)
      return false
    }
  }

  async getImageList(directory?: string): Promise<Array<{
    name: string
    path: string
    url: string
    webpUrl: string
    size: number
    webpSize: number
    createdAt: Date
    width: number
    height: number
  }>> {
    const targetDir = directory 
      ? path.join(process.cwd(), this.uploadDir, directory)
      : path.join(process.cwd(), this.uploadDir)

    if (!existsSync(targetDir)) {
      return []
    }

    const files = await readdir(targetDir)
    const webpFiles = files.filter(file => file.endsWith('.webp'))

    const images = await Promise.all(
      webpFiles.map(async (webpFile) => {
        const webpPath = path.join(targetDir, webpFile)
        const webpStats = await stat(webpPath)
        const webpMetadata = await sharp(webpPath).metadata()
        
        const baseName = webpFile.replace('.webp', '')
        const originalFiles = files.filter(f => 
          f.startsWith(baseName + '.') && f !== webpFile
        )
        
        let originalFile = originalFiles[0]
        let originalStats = webpStats
        let originalMetadata = webpMetadata
        
        if (originalFile) {
          const originalPath = path.join(targetDir, originalFile)
          originalStats = await stat(originalPath)
          originalMetadata = await sharp(originalPath).metadata()
        } else {
          originalFile = webpFile
        }

        return {
          name: originalFile,
          path: path.join(targetDir, originalFile),
          url: `${this.uploadDir.replace('public', '')}/${originalFile}`,
          webpUrl: `${this.uploadDir.replace('public', '')}/${webpFile}`,
          size: originalStats.size,
          webpSize: webpStats.size,
          createdAt: webpStats.birthtime,
          width: webpMetadata.width || 0,
          height: webpMetadata.height || 0,
        }
      })
    )

    return images.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async getImageStats(): Promise<{
    totalImages: number
    totalSize: number
    totalWebpSize: number
    averageSize: number
    averageWebpSize: number
    savedPercentage: number
  }> {
    const images = await this.getImageList()
    
    let totalSize = 0
    let totalWebpSize = 0

    for (const image of images) {
      totalSize += image.size
      totalWebpSize += image.webpSize
    }

    const savedPercentage = totalSize > 0 
      ? ((totalSize - totalWebpSize) / totalSize * 100)
      : 0

    return {
      totalImages: images.length,
      totalSize,
      totalWebpSize,
      averageSize: images.length > 0 ? totalSize / images.length : 0,
      averageWebpSize: images.length > 0 ? totalWebpSize / images.length : 0,
      savedPercentage,
    }
  }
}

export const imageProcessor = new ImageProcessor()
