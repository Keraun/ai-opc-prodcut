"use client"

import { Card, Tag, Button } from "@arco-design/web-react"
import {
  IconApps,
  IconBook,
  IconThunderbolt,
  IconCustomerService,
  IconArrowRight,
} from "@arco-design/web-react/icon"
import { useTheme } from "@/components/theme-provider"
import styles from "./products.module.css"

const iconMap: Record<string, any> = {
  IconApps,
  IconBook,
  IconThunderbolt,
  IconCustomerService,
}

interface ProductsProps {
  data?: any
}

export function Products({ data }: ProductsProps) {
  const { themeConfig } = useTheme()
  const config = data || {}

  const items = config.items || []
  const products = items.map((product: any) => ({
    ...product,
    icon: iconMap[product.icon],
  }))

  const primaryColor = themeConfig?.colors?.primary || "#1e40af"
  const accentColor = themeConfig?.colors?.accent || "#06b6d4"

  return (
    <section id="products" className={styles.section}>
      <div className={styles.bgElements}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <span
            className={styles.tag}
            style={{
              backgroundColor: `${accentColor}0D`,
              color: accentColor,
              borderColor: `${accentColor}33`
            }}
          >
            {config.sectionTag || "产品服务"}
          </span>
          <h2 className={styles.title}>
            {config.title || "AI一人公司解决方案"}
          </h2>
          <p className={styles.description}>
            {config.description || "从工具到课程，从学习到实践，全方位助力个人创业者实现AI赋能"}
          </p>
        </div>

        {products && products.length > 0 && (
          <div className={styles.grid}>
            {products.map((product: any, index: number) => {
              const Icon = product?.icon
              if (!Icon) return null

              return (
                <Card
                  key={product?.id || index}
                  className={styles.card}
                  hoverable
                >
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <div className={styles.iconWrapper}>
                        <Icon
                          className={styles.icon}
                          style={{ color: primaryColor }}
                        />
                      </div>
                      {product?.tag && (
                        <Tag color={product?.tagColor} style={{ borderRadius: '9999px', padding: '0.125rem 0.625rem', fontSize: '0.75rem' }}>
                          {product.tag}
                        </Tag>
                      )}
                    </div>

                    {product?.name && (
                      <h3 className={styles.cardTitle}>{product.name}</h3>
                    )}
                    {product?.description && (
                      <p className={styles.cardDescription}>{product.description}</p>
                    )}

                    {product?.features && product.features.length > 0 && (
                      <div className={styles.features}>
                        {product.features.map((feature: string, i: number) => (
                          <span key={i} className={styles.feature}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      className={styles.ctaButton}
                      style={{ color: accentColor }}
                    >
                      了解更多
                      <IconArrowRight className={styles.ctaIcon} />
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
