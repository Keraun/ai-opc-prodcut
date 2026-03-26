'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ModuleProps } from '@/modules/types'
import type { ProductListData, Product } from './types'
import styles from './index.module.css'

export function ProductListModule({ data }: ModuleProps) {
  const config: ProductListData = (data as ProductListData) || {
    title: 'AI产品',
    subtitle: '精选优质 AI 工具、课程和服务',
    showPrice: true,
    showTags: true,
    categories: []
  }

  const products: Product[] = (data as any)?.products || []
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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
          <p className={styles.heroSubtitle}>
            {config.subtitle}
          </p>
        </div>
      </section>

      <section className={styles.main}>
        {categories.length > 1 && (
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
        )}

        {filteredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={styles.productCard}>
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className={styles.productImage}
                  />
                )}
                <div className={styles.productContent}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productDescription}>{product.description}</p>
                  
                  {config.showTags && product.tags && product.tags.length > 0 && (
                    <div className={styles.productTags}>
                      {product.tags.map((tag, index) => (
                      <span key={index} className={styles.productTag}>
                        {tag}
                      </span>
                    ))}
                    </div>
                  )}
                  
                  {config.showPrice && (
                    <div className={styles.productPrice}>
                      {product.price === 0 ? (
                        <span className={styles.freePrice}>免费</span>
                      ) : (
                        <>
                          <span className={styles.currentPrice}>
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className={styles.originalPrice}>
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {product.link && (
                    <Link href={product.link} className={styles.productLink}>
                      了解详情
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.loading}>
            <p className={styles.loadingText}>暂无产品</p>
          </div>
        )}
      </section>
    </div>
  )
}
