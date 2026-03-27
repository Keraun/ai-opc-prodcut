import Link from "next/link"
import { Card, Section } from "@/components/ui"
import { useTheme } from "@/components/theme-provider"
import { AppsIcon, BookIcon, ThunderboltIcon, CustomerServiceIcon, ArrowRightIcon } from "@/modules/icons"
import type { ModuleProps } from "@/modules/types"
import type { ProductsData } from "./types"
import styles from "./index.module.css"

const iconMap: Record<string, any> = {
  IconApps: <AppsIcon />,
  IconBook: <BookIcon />,
  IconThunderbolt: <ThunderboltIcon />,
  IconCustomerService: <CustomerServiceIcon />,
}

export function ProductsModule({ data }: ModuleProps) {
  const config: ProductsData = (data as ProductsData) || {}
  const { themeConfig } = useTheme()

  const items = config.items || []
  const products = items.map((product) => ({
    ...product,
    icon: product.icon ? iconMap[product.icon] : null,
  }))

  const accentColor = themeConfig?.colors.accent || "#06b6d4" // 默认强调色
  const primaryColor = themeConfig?.colors.primary || "#1e40af" // 默认主色

  return (
    <Section
      id="products"
      title={config.title || "AI一人公司解决方案"}
      description={config.description || "从工具到课程，从学习到实践，全方位助力个人创业者实现AI赋能"}
      badge={config.sectionTag || "产品服务"}
      variant="default"
      padding="lg"
      centered
    >
      <div className={styles.bgElements}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
      </div>

      {products && products.length > 0 && (
        <div className={styles.grid}>
          {products.map((product, index: number) => {
            const Icon = product?.icon
            if (!Icon) return null

            const cardFooter = product?.link ? (
              <Link
                href={product.link}
                className={styles.ctaButton}
                style={{ color: accentColor }}
              >
                了解更多
                <span className={styles.ctaIcon}><ArrowRightIcon /></span>
              </Link>
            ) : (
              <span
                className={styles.ctaButton}
                style={{ color: accentColor }}
              >
                了解更多
                <span className={styles.ctaIcon}><ArrowRightIcon /></span>
              </span>
            )

            return (
              <Card
                key={product?.id || index}
                variant="elevated"
                padding="md"
                hover
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <div className={styles.icon}>
                      {Icon}
                    </div>
                  </div>
                  {product?.tag && (
                    <span 
                      className={styles.tag} 
                      style={{ 
                        backgroundColor: product?.tagColor || `${primaryColor}20`,
                        color: product?.tagColor ? '#ffffff' : primaryColor,
                        borderRadius: '9999px', 
                        padding: '0.125rem 0.625rem', 
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      {product.tag}
                    </span>
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

                <div className={styles.cardFooter}>
                  {cardFooter}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </Section>
  )
}
