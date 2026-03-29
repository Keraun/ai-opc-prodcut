export const uploadImage = async (
  file: File,
  options: {
    quality?: number
    width?: number
    height?: number
  } = {}
): Promise<{
  success: boolean
  url?: string
  originalUrl?: string
  width?: number
  height?: number
  webpSize?: number
  originalSize?: number
  savedPercentage?: string
  format?: string
  message?: string
}> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const params = new URLSearchParams()
    if (options.quality) params.append('quality', options.quality.toString())
    if (options.width) params.append('width', options.width.toString())
    if (options.height) params.append('height', options.height.toString())

    const response = await fetch(`/api/upload?${params.toString()}`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Upload image error:', error)
    return {
      success: false,
      message: '上传失败',
    }
  }
}

export const getImages = async (directory?: string): Promise<{
  success: boolean
  images?: any[]
  total?: number
  message?: string
}> => {
  try {
    const params = new URLSearchParams()
    if (directory) params.append('directory', directory)

    const response = await fetch(`/api/images?${params.toString()}`)
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Get images error:', error)
    return {
      success: false,
      message: '获取图片列表失败',
    }
  }
}

export const deleteImage = async (imagePath: string): Promise<{
  success: boolean
  message?: string
}> => {
  try {
    const response = await fetch('/api/images', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imagePath }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Delete image error:', error)
    return {
      success: false,
      message: '删除图片失败',
    }
  }
}

export const deleteImages = async (imagePaths: string[]): Promise<{
  success: boolean
  message?: string
  deletedCount?: number
  failedPaths?: string[]
}> => {
  try {
    const response = await fetch('/api/images', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imagePaths }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Delete images error:', error)
    return {
      success: false,
      message: '删除图片失败',
    }
  }
}

export const getImageStats = async (): Promise<{
  success: boolean
  stats?: {
    totalImages: number
    totalSize: number
    totalWebpSize: number
    averageSize: number
    averageWebpSize: number
    savedPercentage: number
  }
  message?: string
}> => {
  try {
    const response = await fetch('/api/images?stats=true')
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Get image stats error:', error)
    return {
      success: false,
      message: '获取图片统计失败',
    }
  }
}
