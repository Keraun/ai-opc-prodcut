'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal, Button, Card, Statistic, Grid, Spin, Empty, Popconfirm, Message } from '@arco-design/web-react'
import { 
  Image as ImageIcon, 
  Trash2, 
  Upload, 
  Eye, 
  Download,
  HardDrive,
  FileImage,
  TrendingUp,
  Link2,
  Copy
} from 'lucide-react'
import { ManagementHeader } from './ManagementHeader'
import styles from './ImageManagement.module.css'

const { Row, Col } = Grid

interface ImageInfo {
  name: string
  path: string
  url: string
  webpUrl: string
  size: number
  webpSize: number
  createdAt: string
  width: number
  height: number
}

interface ImageStats {
  totalImages: number
  totalSize: number
  totalWebpSize: number
  averageSize: number
  averageWebpSize: number
  savedPercentage: number
}

export function ImageManagement() {
  const [images, setImages] = useState<ImageInfo[]>([])
  const [stats, setStats] = useState<ImageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState<ImageInfo | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadImages()
    loadStats()
  }, [])

  const loadImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/images')
      const result = await response.json()
      
      if (result.success) {
        setImages(result.images)
      } else {
        Message.error(result.message || '加载图片失败')
      }
    } catch (error) {
      console.error('Load images error:', error)
      Message.error('加载图片失败')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/images?stats=true')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Load stats error:', error)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload?quality=80', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        Message.success(`图片上传成功，节省 ${result.savedPercentage}% 空间`)
        loadImages()
        loadStats()
      } else {
        Message.error(result.message || '上传失败')
      }
    } catch (error) {
      console.error('Upload error:', error)
      Message.error('上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (image: ImageInfo) => {
    try {
      const response = await fetch('/api/images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePath: image.url }),
      })

      const result = await response.json()

      if (result.success) {
        Message.success('图片删除成功')
        loadImages()
        loadStats()
      } else {
        Message.error(result.message || '删除失败')
      }
    } catch (error) {
      console.error('Delete error:', error)
      Message.error('删除失败')
    }
  }

  const handlePreview = (image: ImageInfo) => {
    setPreviewImage(image)
    setPreviewVisible(true)
  }

  const handleDownload = (image: ImageInfo, useWebP: boolean = true) => {
    const link = document.createElement('a')
    link.href = useWebP ? image.webpUrl : image.url
    link.download = image.name
    link.click()
  }

  const handleCopyLink = async (url: string, label: string) => {
    try {
      const fullUrl = window.location.origin + url
      await navigator.clipboard.writeText(fullUrl)
      Message.success(`${label}链接已复制`)
    } catch (error) {
      console.error('Copy link error:', error)
      Message.error('复制链接失败')
    }
  }

  const getFullUrl = (url: string) => {
    return window.location.origin + url
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={styles.container}>
      <ManagementHeader
        title="图片管理"
        description="管理网站的所有图片资源，自动生成 WebP 格式以优化性能"
        buttonText="上传图片"
        buttonIcon={<Upload size={16} />}
        onButtonClick={() => fileInputRef.current?.click()}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUpload}
      />

      {stats && (
        <Card className={styles.statsCard}>
          <Row gutter={16}>
            <Col span={6}>
              <div className={styles.statItem}>
                <FileImage size={24} className={styles.statIcon} />
                <Statistic 
                  title="图片总数" 
                  value={stats.totalImages}
                  suffix="张"
                />
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.statItem}>
                <HardDrive size={24} className={styles.statIcon} />
                <Statistic 
                  title="原图总大小" 
                  value={formatFileSize(stats.totalSize)}
                />
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.statItem}>
                <TrendingUp size={24} className={styles.statIcon} />
                <Statistic 
                  title="WebP 总大小" 
                  value={formatFileSize(stats.totalWebpSize)}
                />
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.statItem}>
                <ImageIcon size={24} className={styles.statIcon} />
                <Statistic 
                  title="节省空间" 
                  value={stats.savedPercentage.toFixed(1)}
                  suffix="%"
                />
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Card className={styles.imageListCard}>
        {loading ? (
          <div className={styles.loading}>
            <Spin size={32} />
            <span>加载中...</span>
          </div>
        ) : images.length === 0 ? (
          <Empty
            icon={<ImageIcon size={48} />}
            description="暂无图片"
          />
        ) : (
          <div className={styles.imageGrid}>
            {images.map((image) => (
              <div key={image.path} className={styles.imageItem}>
                <div className={styles.imagePreview}>
                  <img 
                    src={image.webpUrl} 
                    alt={image.name}
                    className={styles.imageThumb}
                  />
                  <div className={styles.imageOverlay}>
                    <button
                      className={styles.overlayBtn}
                      onClick={() => handlePreview(image)}
                      title="预览"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className={styles.overlayBtn}
                      onClick={() => handleCopyLink(image.webpUrl, 'WebP')}
                      title="复制 WebP 链接"
                    >
                      <Link2 size={16} />
                    </button>
                    <button
                      className={styles.overlayBtn}
                      onClick={() => handleDownload(image, true)}
                      title="下载 WebP"
                    >
                      <Download size={16} />
                    </button>
                    <Popconfirm
                      title="确定要删除这张图片吗？"
                      onOk={() => handleDelete(image)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <button
                        className={`${styles.overlayBtn} ${styles.deleteBtn}`}
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Popconfirm>
                  </div>
                </div>
                <div className={styles.imageInfo}>
                  <div className={styles.imageName} title={image.name}>
                    {image.name}
                  </div>
                  <div className={styles.imageMeta}>
                    <span>{image.width}x{image.height}</span>
                    <span>{formatDate(image.createdAt)}</span>
                  </div>
                  <div className={styles.sizeInfo}>
                    <span className={styles.originalSize}>原图: {formatFileSize(image.size)}</span>
                    <span className={styles.webpSize}>WebP: {formatFileSize(image.webpSize)}</span>
                    <span className={styles.savedSize}>
                      节省 {((image.size - image.webpSize) / image.size * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title="图片预览"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        style={{ width: 900 }}
      >
        {previewImage && (
          <div className={styles.previewContent}>
            <img 
              src={previewImage.webpUrl} 
              alt={previewImage.name}
              className={styles.previewImage}
            />
            <div className={styles.previewInfo}>
              <p><strong>文件名：</strong>{previewImage.name}</p>
              <p><strong>尺寸：</strong>{previewImage.width}x{previewImage.height}</p>
              
              <div className={styles.linkSection}>
                <div className={styles.linkItem}>
                  <span className={styles.linkLabel}>WebP 链接：</span>
                  <div className={styles.linkContainer}>
                    <input
                      type="text"
                      value={getFullUrl(previewImage.webpUrl)}
                      readOnly
                      className={styles.linkInput}
                    />
                    <button
                      className={styles.copyBtn}
                      onClick={() => handleCopyLink(previewImage.webpUrl, 'WebP')}
                      title="复制"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                
                <div className={styles.linkItem}>
                  <span className={styles.linkLabel}>原图链接：</span>
                  <div className={styles.linkContainer}>
                    <input
                      type="text"
                      value={getFullUrl(previewImage.url)}
                      readOnly
                      className={styles.linkInput}
                    />
                    <button
                      className={styles.copyBtn}
                      onClick={() => handleCopyLink(previewImage.url, '原图')}
                      title="复制"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <p><strong>原图大小：</strong>{formatFileSize(previewImage.size)}</p>
              <p><strong>WebP 大小：</strong>{formatFileSize(previewImage.webpSize)}</p>
              <p><strong>上传时间：</strong>{formatDate(previewImage.createdAt)}</p>
              
              <div className={styles.previewActions}>
                <Button 
                  type="primary" 
                  onClick={() => handleDownload(previewImage, true)}
                >
                  下载 WebP
                </Button>
                <Button 
                  onClick={() => handleDownload(previewImage, false)}
                >
                  下载原图
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {uploading && (
        <div className={styles.uploadingOverlay}>
          <Spin size={32} />
          <span>上传中...</span>
        </div>
      )}
    </div>
  )
}
