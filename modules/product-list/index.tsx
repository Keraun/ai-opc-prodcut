'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ModuleProps } from '@/modules/types'
import type { ProductListData, Product } from './types'
import styles from './index.module.css'

const DEFAULT_PRODUCT_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g transform="translate(150, 100)">
    <path d="M50 0L100 25V75L50 100L0 75V25L50 0Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
    <path d="M50 25L75 37.5V62.5L50 75L25 62.5V37.5L50 25Z" fill="rgba(255,255,255,0.3)"/>
  </g>
  <text x="200" y="220" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="system-ui, sans-serif" font-size="18" font-weight="500">AI 产品</text>
</svg>
`)}`

export function ProductListModule({ data }: ModuleProps) {
  const config: ProductListData = (data as unknown as ProductListData) || {
    title: 'AI产品',
    subtitle: '精选优质 AI 工具、课程和服务',
    showPrice: true,
    showTags: true,
    categories: []
  }

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const result = await response.json()
        if (result.success && result.data) {
          setProducts(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleImageError = (productId: number) => {
    setImageErrors(prev => new Set(prev).add(productId))
  }

  const getProductImage = (product: Product) => {
    if (!product.image || imageErrors.has(product.id)) {
      return DEFAULT_PRODUCT_IMAGE
    }
    return product.image
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const categories = [
    { key: 'all', title: '全部产品' },
    ...(config.categories || [])
  ]

  const formatPrice = (price: number) => {
    if (price === 0) return '免费'
    return `¥${price}`
  }

  return (
    <div className={styles.productList}>
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>{config.title}</h1>
          <p className={styles.heroSubtitle}>{config.subtitle}</p>
        </div>
      </section>

      <section className={styles.main}>
        <div className={styles.categoryFilter}>
          {categories.map((category) => (
            <button
              key={category.key}
              className={`${styles.categoryButton} ${selectedCategory === category.key ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category.key)}
            >
              {category.title}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>加载中...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.cardHeader}>
                  <img
                    src={getProductImage(product)}
                    alt={product.title}
                    className={styles.productImage}
                    onError={() => handleImageError(product.id)}
                  />
                  {product.tags && product.tags.length > 0 && (
                    <div className={styles.cardTags}>
                      {product.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className={styles.cardTag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={styles.cardBody}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productDescription}>{product.description}</p>
                  
                  {product.features && product.features.length > 0 && (
                    <div className={styles.featureList}>
                      {product.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className={styles.featureItem}>
                          <svg className={styles.featureIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={styles.cardFooter}>
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
                  
                  {product.link && (
                    <Link href={product.link} className={styles.actionButton}>
                      了解详情
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className={styles.emptyText}>暂无产品</p>
          </div>
        )}
      </section>
    </div>
  )
}
