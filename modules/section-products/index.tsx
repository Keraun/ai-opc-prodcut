import Link from "next/link"
import { Card, Section } from "@/components/ui"
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

  const accentColor = "#06b6d4" // 默认强调色

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {products.map((product, index: number) => {
            const Icon = product?.icon
            if (!Icon) return null

            const cardFooter = product?.link ? (
              <Link
                href={product.link}
                className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-600 font-medium transition-colors"
              >
                了解更多
                <ArrowRightIcon />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 text-cyan-500 font-medium">
                了解更多
                <ArrowRightIcon />
              </span>
            )

            return (
              <Card
                key={product?.id || index}
                variant="elevated"
                padding="md"
                hover
                className="relative"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    {Icon}
                  </div>
                  {product?.tag && (
                    <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {product.tag}
                    </span>
                  )}
                </div>

                {product?.name && (
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                )}
                {product?.description && (
                  <p className="text-gray-600 mb-4">{product.description}</p>
                )}

                {product?.features && product.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.map((feature: string, i: number) => (
                      <span key={i} className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
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
