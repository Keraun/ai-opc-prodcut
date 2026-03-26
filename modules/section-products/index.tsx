import Link from "next/link"
import type { ModuleProps } from "@/modules/types"
import type { ProductsData } from "./types"
import styles from "./index.module.css"

// SVG 图标组件
const AppsIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const BookIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const ThunderboltIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)

const CustomerServiceIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
)

const iconMap: Record<string, any> = {
  IconApps: <AppsIcon />,
  IconBook: <BookIcon />,
  IconThunderbolt: <ThunderboltIcon />,
  IconCustomerService: <CustomerServiceIcon />,
}

export function ProductsModule({ data }: ModuleProps) {
  const config: ProductsData = (data as ProductsData) || {}

  const items = config.items || []
  const products = items.map((product) => ({
    ...product,
    icon: product.icon ? iconMap[product.icon] : null,
  }))

  const primaryColor = "#1e40af" // 默认主色
  const accentColor = "#06b6d4" // 默认强调色

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
            {products.map((product, index: number) => {
              const Icon = product?.icon
              if (!Icon) return null

              return (
                <div
                  key={product?.id || index}
                  className={styles.card}
                >
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <div className={styles.iconWrapper}>
                        <div
                          className={styles.icon}
                          style={{ color: primaryColor }}
                        >
                          {Icon}
                        </div>
                      </div>
                      {product?.tag && (
                        <span 
                          className={styles.tag} 
                          style={{ 
                            backgroundColor: product?.tagColor || '#e5e7eb',
                            borderRadius: '9999px', 
                            padding: '0.125rem 0.625rem', 
                            fontSize: '0.75rem' 
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

                    {product?.link ? (
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
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
