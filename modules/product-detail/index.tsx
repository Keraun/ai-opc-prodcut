'use client'

import { useState, useEffect } from 'react'
import type { ModuleProps } from '@/modules/types'
import type { ProductDetailData, Product } from './types'
import styles from './index.module.css'

const DEFAULT_PRODUCT_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(225, 125)">
    <path d="M75 0L150 37.5V112.5L75 150L0 112.5V37.5L75 0Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
    <path d="M75 37.5L112.5 56.25V93.75L75 112.5L37.5 93.75V56.25L75 37.5Z" fill="rgba(255,255,255,0.3)"/>
  </g>
  <text x="300" y="300" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="system-ui, sans-serif" font-size="24" font-weight="500">AI 产品</text>
</svg>
`)}`

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
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
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

  const getProductImage = () => {
    if (!product?.image || imageError) {
      return DEFAULT_PRODUCT_IMAGE
    }
    return product.image
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '免费'
    return `¥${price}`
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
            <img 
              src={getProductImage()} 
              alt={product.title}
              className={styles.productImage}
              onError={() => setImageError(true)}
            />
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
            
            {config.showFeatures && product.features && product.features.length > 0 && (
              <div className={styles.featuresSection}>
                <h3 className={styles.featuresTitle}>产品特性</h3>
                <ul className={styles.featuresList}>
                  {product.features.map((feature, index) => (
                    <li key={index} className={styles.featureItem}>
                      <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className={styles.actionSection}>
              <button className={styles.buyButton}>
                立即购买
              </button>
              <button className={styles.contactButton}>
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
                      src={related.image || DEFAULT_PRODUCT_IMAGE} 
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
    </div>
  )
}
