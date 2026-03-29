'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { ModuleProps } from '@/modules/types'
import type { ProductListData, Product } from './types'
import { QrcodeModal } from '@/components/QrcodeModal'
import styles from './index.module.css'

function ProductImage({ product, onImageError }: { product: Product; onImageError: (id: number) => void }) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !product.image) {
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
        <span className={styles.fallbackLabel}>产品图</span>
      </div>
    )
  }

  return (
    <img
      src={product.image}
      alt={product.title}
      className={styles.productImage}
      onError={() => {
        setHasError(true)
        onImageError(product.id)
      }}
    />
  )
}

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('联系客服')

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

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const categories = [
    { key: 'all', title: '全部产品' },
    ...(config.categories || [])
  ]

  const formatPrice = (price: number) => {
    if (price === 0) return '免费'
    return '¥' + price
  }

  const handleBuyClick = (product: Product) => {
    if (product.buyLink) {
      window.open(product.buyLink, '_blank', 'noopener,noreferrer')
    } else {
      setModalTitle('咨询：' + product.title)
      setIsModalOpen(true)
    }
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
                  <ProductImage product={product} onImageError={handleImageError} />
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
                  
                  <div className={styles.actionGroup}>
                    <button 
                      className={styles.buyButton}
                      onClick={() => handleBuyClick(product)}
                    >
                      立即购买
                    </button>
                    {product.link && (
                      <Link 
                        href={product.link} 
                        className={styles.actionButton}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        了解详情
                      </Link>
                    )}
                  </div>
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
      
      <QrcodeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      />
    </div>
  )
}
