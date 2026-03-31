'use client'

import { useState, useEffect } from 'react'
import type { ModuleProps } from '@/modules/types'
import type { ProductDetailData, Product } from './types'
import { QrcodeModal } from '@/components/QrcodeModal'
import styles from './index.module.css'

// 预览模式下的模拟产品数据
const previewProduct: Product = {
  id: 1,
  title: '示例产品名称',
  description: '这是一款示例产品的描述，用于预览模式展示。您可以配置是否显示价格、特性、评分、销量等相关信息。',
  price: 99,
  originalPrice: 199,
  image: '',
  tags: ['热门', '推荐'],
  category: '示例分类',
  categoryName: '示例分类',
  link: '#',
  buyLink: '#',
  features: ['特性一：高效便捷', '特性二：安全可靠', '特性三：易于使用', '特性四：专业支持'],
  salesCount: 1000,
  rating: 4.8,
  status: 'published',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

function ProductDetailImage({ product }: { product: Product | null }) {
  const [hasError, setHasError] = useState(false)

  if (!product?.image || hasError) {
    return (
      <div className={styles.fallbackImage}>
        <div className={styles.fallbackIconWrapper}>
          <svg viewBox="0 0 100 100" className={styles.fallbackIcon}>
            <path 
              d="M50 0L100 25V75L50 100L0 75V25L50 0Z" 
              fill="currentColor" 
              opacity="0.3"
            />
            <path 
              d="M50 25L75 37.5V62.5L50 75L25 62.5V37.5L50 25Z" 
              fill="currentColor" 
              opacity="0.5"
            />
          </svg>
        </div>
        <span className={styles.fallbackLabel}>AI 产品</span>
      </div>
    )
  }

  return (
    <img 
      src={product.image} 
      alt={product.title}
      className={styles.productImage}
      onError={() => setHasError(true)}
    />
  )
}

export function ProductDetailModule({ data }: ModuleProps) {
  const config: ProductDetailData = (data as unknown as ProductDetailData) || {
    showPrice: true,
    showFeatures: true,
    showRating: true,
    showSalesCount: true,
    showRelated: true,
    relatedCount: 4
  }

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      const isPreviewMode = window.location.pathname.includes('/admin/module-preview/') || window.location.pathname.includes('/admin/page-preview/')
      setIsPreview(isPreviewMode)
      
      if (isPreviewMode) {
        try {
          const response = await fetch('/api/products?id=1')
          const result = await response.json()
          if (result.success && result.data) {
            setProduct(result.data)
            if (config.showRelated && result.data.category) {
              const relatedResponse = await fetch(`/api/products?category=${result.data.category}`)
              const relatedResult = await relatedResponse.json()
              if (relatedResult.success && relatedResult.data) {
                setRelatedProducts(
                  relatedResult.data
                    .filter((p: Product) => p.id !== result.data.id)
                    .slice(0, config.relatedCount || 4)
                )
              }
            }
          } else {
            setProduct(previewProduct)
            setRelatedProducts([])
          }
        } catch {
          setProduct(previewProduct)
          setRelatedProducts([])
        }
        setLoading(false)
        return
      }

      const slug = window.location.pathname.split('/').pop()
      if (!slug) return

      try {
        const response = await fetch(`/api/products?id=${slug}`)
        const result = await response.json()
        if (result.success && result.data) {
          setProduct(result.data)
          
          if (config.showRelated && result.data.category) {
            const relatedResponse = await fetch(`/api/products?category=${result.data.category}`)
            const relatedResult = await relatedResponse.json()
            if (relatedResult.success && relatedResult.data) {
              setRelatedProducts(
                relatedResult.data
                  .filter((p: Product) => p.id !== result.data.id)
                  .slice(0, config.relatedCount || 4)
              )
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [config.showRelated, config.relatedCount])

  const formatPrice = (price: number) => {
    if (price === 0) return '免费'
    return '¥' + price
  }

  const handleBuyClick = () => {
    if (product && product.buyLink) {
      window.open(product.buyLink, '_blank', 'noopener,noreferrer')
    } else {
      setIsModalOpen(true)
    }
  }

  const handleContactClick = () => {
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>加载中...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className={styles.errorTitle}>产品不存在</h2>
        <p className={styles.errorText}>抱歉，您访问的产品不存在或已下架</p>
        <a href="/product" className={styles.errorButton}>返回产品列表</a>
      </div>
    )
  }

  return (
    <div className={styles.productDetail}>
      <div className={styles.container}>
        <div className={styles.productMain}>
          <div className={styles.imageSection}>
            <ProductDetailImage product={product} />
            {product.tags && product.tags.length > 0 && (
              <div className={styles.tags}>
                {product.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
          
          <div className={styles.infoSection}>
            <h1 className={styles.title}>{product.title}</h1>
            <p className={styles.description}>{product.description}</p>
            
            {config.showRating && product.rating && (
              <div className={styles.ratingSection}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={`${styles.star} ${star <= Math.floor(product.rating!) ? styles.starFilled : ''}`}
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className={styles.ratingValue}>{product.rating}</span>
                {config.showSalesCount && product.salesCount && (
                  <span className={styles.salesCount}>已售 {product.salesCount} 件</span>
                )}
              </div>
            )}
            
            {config.showPrice && (
              <div className={styles.priceSection}>
                {product.price === 0 ? (
                  <span className={styles.freePrice}>免费</span>
                ) : (
                  <div className={styles.priceGroup}>
                    <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {config.showFeatures && product.features && (
              <div className={styles.featuresSection}>
                <h3 className={styles.featuresTitle}>产品特性</h3>
                <ul className={styles.featuresList}>
                  {Array.isArray(product.features) 
                    ? product.features.map((feature, index) => (
                        <li key={index} className={styles.featureItem}>
                          <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))
                    : (
                        <li className={styles.featureItem}>
                          <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{typeof product.features === 'string' ? product.features.replace(/<[^>]*>/g, '') : String(product.features)}</span>
                        </li>
                      )
                  }
                </ul>
              </div>
            )}
            
            <div className={styles.actionSection}>
              <button className={styles.buyButton} onClick={handleBuyClick}>
                立即购买
              </button>
              <button className={styles.contactButton} onClick={handleContactClick}>
                咨询客服
              </button>
            </div>
          </div>
        </div>
        
        {config.showRelated && relatedProducts.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>相关产品</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((related) => (
                <a 
                  key={related.id} 
                  href={`/product/${related.id}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImageWrapper}>
                    <img 
                      src={related.image || ''} 
                      alt={related.title}
                      className={styles.relatedImage}
                    />
                  </div>
                  <div className={styles.relatedInfo}>
                    <h3 className={styles.relatedName}>{related.title}</h3>
                    <p className={styles.relatedPrice}>
                      {related.price === 0 ? '免费' : formatPrice(related.price)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <QrcodeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={product && product.title ? '咨询：' + product.title : '联系客服'}
      />
    </div>
  )
}
