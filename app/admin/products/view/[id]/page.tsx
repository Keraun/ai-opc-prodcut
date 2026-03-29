"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button, Card, Spin } from "@arco-design/web-react"
import { ChevronLeft as IconChevronLeft, Edit as IconEdit } from "lucide-react"
import { toast } from "sonner"
import styles from "../../products.module.css"

interface Product {
  id: number
  title: string
  description: string
  content: string
  price: number
  originalPrice?: number
  image?: string
  tags?: string[]
  category?: string
  categoryName?: string
  link?: string
  features?: string[]
  salesCount?: number
  rating?: number
  status: string
  created_at: string
  updated_at: string
}

export default function ViewProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?id=${productId}`)
      const result = await response.json()
      if (result.success && result.data) {
        setProduct(result.data)
      } else {
        toast.error('产品不存在')
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast.error('加载产品失败')
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/admin/products/edit/${productId}`)
  }

  const handleBack = () => {
    router.push('/admin/products')
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '免费'
    return `¥${price}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size={40} />
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={<IconChevronLeft />}
              onClick={handleBack}
              style={{ color: 'white' }}
            >
              返回产品列表
            </Button>
            <h1 className={styles.headerTitle}>{product.title}</h1>
          </div>
          <Button
            type="primary"
            icon={<IconEdit size={16} />}
            onClick={handleEdit}
          >
            编辑产品
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.viewCard}>
          <div className={styles.viewContent}>
            <div className={styles.viewSection}>
              <h3 className={styles.sectionTitle}>基本信息</h3>
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>产品名称</label>
                <p className={styles.viewValue}>{product.title}</p>
              </div>
              <div className={styles.viewRow}>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>产品分类</label>
                  <p className={styles.viewValue}>{product.categoryName || '未分类'}</p>
                </div>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>状态</label>
                  <span className={`${styles.statusBadge} ${product.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                    {product.status === 'active' ? '上架' : '下架'}
                  </span>
                </div>
              </div>
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>产品描述</label>
                <p className={styles.viewValue}>{product.description}</p>
              </div>
            </div>

            <div className={styles.viewSection}>
              <h3 className={styles.sectionTitle}>价格信息</h3>
              <div className={styles.viewRow}>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>售价</label>
                  <p className={styles.viewPrice}>{formatPrice(product.price)}</p>
                </div>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>原价</label>
                  <p className={styles.viewValue}>
                    {product.originalPrice ? formatPrice(product.originalPrice) : '无'}
                  </p>
                </div>
              </div>
              <div className={styles.viewRow}>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>销量</label>
                  <p className={styles.viewValue}>{product.salesCount || 0}</p>
                </div>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>评分</label>
                  <p className={styles.viewValue}>{product.rating || 5.0}</p>
                </div>
              </div>
            </div>

            <div className={styles.viewSection}>
              <h3 className={styles.sectionTitle}>媒体与链接</h3>
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>产品图片</label>
                {product.image ? (
                  <div className={styles.imagePreview}>
                    <img src={product.image} alt={product.title} />
                  </div>
                ) : (
                  <p className={styles.viewValue}>暂无图片</p>
                )}
              </div>
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>产品链接</label>
                {product.link ? (
                  <a href={product.link} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
                    {product.link}
                  </a>
                ) : (
                  <p className={styles.viewValue}>无</p>
                )}
              </div>
            </div>

            <div className={styles.viewSection}>
              <h3 className={styles.sectionTitle}>标签与特性</h3>
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>产品标签</label>
                <div className={styles.tagsList}>
                  {product.tags && product.tags.length > 0 ? (
                    product.tags.map((tag, index) => (
                      <span key={index} className={styles.tagItem}>{tag}</span>
                    ))
                  ) : (
                    <span className={styles.noTags}>无标签</span>
                  )}
                </div>
              </div>
              <div className={styles.viewField}>
                <label className={styles.viewLabel}>产品特性</label>
                <div className={styles.featuresList}>
                  {product.features && product.features.length > 0 ? (
                    product.features.map((feature, index) => (
                      <div key={index} className={styles.featureItem}>
                        <span className={styles.featureIcon}>✓</span>
                        <span>{feature}</span>
                      </div>
                    ))
                  ) : (
                    <span className={styles.noTags}>无特性</span>
                  )}
                </div>
              </div>
            </div>

            {product.content && (
              <div className={styles.viewSection}>
                <h3 className={styles.sectionTitle}>产品详情</h3>
                <div 
                  className={styles.htmlContent}
                  dangerouslySetInnerHTML={{ __html: product.content }}
                />
              </div>
            )}

            <div className={styles.viewSection}>
              <h3 className={styles.sectionTitle}>时间信息</h3>
              <div className={styles.viewRow}>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>创建时间</label>
                  <p className={styles.viewValue}>{formatDate(product.created_at)}</p>
                </div>
                <div className={styles.viewField}>
                  <label className={styles.viewLabel}>更新时间</label>
                  <p className={styles.viewValue}>{formatDate(product.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
