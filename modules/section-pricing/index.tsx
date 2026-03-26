import Link from "next/link"
import type { ModuleProps } from "@/modules/types"
import type { PricingData, PricingFeature } from "./types"
import styles from "./index.module.css"

// SVG 图标组件
const CheckIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
)

export function PricingModule({ data }: ModuleProps) {
  const config: PricingData = (data as PricingData) || {}

  const primaryColor = "#1e40af" // 默认主色

  const defaultPlans: PricingFeature[] = [
    {
      title: "免费版",
      price: "¥0",
      description: "适合个人用户和小型项目",
      features: [
        "1000+ AI工具访问",
        "基础工作流模板",
        "社区支持",
        "每月100次API调用"
      ],
      buttonText: "开始免费使用",
      link: "/products"
    },
    {
      title: "专业版",
      price: "¥999",
      description: "适合专业用户和小型企业",
      features: [
        "全部AI工具访问",
        "高级工作流定制",
        "优先技术支持",
        "每月1000次API调用",
        "AI GEO课程访问"
      ],
      buttonText: "升级专业版",
      isPopular: true,
      link: "/products"
    },
    {
      title: "企业版",
      price: "¥2999",
      description: "适合企业级用户和团队",
      features: [
        "全部AI工具访问",
        "企业级工作流定制",
        "专属技术支持",
        "无限制API调用",
        "AI GEO课程访问",
        "企业级安全保障"
      ],
      buttonText: "联系销售"
    }
  ]

  const pricingPlans: PricingFeature[] = config?.plans || defaultPlans

  return (
    <section id="pricing" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{config?.title || '选择适合你的计划'}</h2>
          <p className={styles.description}>
            {config?.description || '无论你是个人创业者还是企业用户，我们都有适合你的AI解决方案'}
          </p>
        </div>

        <div className={styles.grid}>
          {pricingPlans.map((plan: PricingFeature, index: number) => (
            <div
              key={index}
              className={`${styles.card} ${plan.isPopular ? styles.cardPopular : ''}`}
              style={{
                borderColor: plan.isPopular ? primaryColor : '#e5e7eb'
              }}
            >
              {plan.isPopular && (
                <div
                  className={styles.popularBadge}
                  style={{ backgroundColor: primaryColor }}
                >
                  最受欢迎
                </div>
              )}
              <div className={styles.cardContent}>
                <h3 className={styles.planTitle}>{plan.title}</h3>
                <div
                  className={styles.planPrice}
                  style={{ color: plan.isPopular ? primaryColor : '#111827' }}
                >
                  {plan.price}
                  <span style={{ fontSize: '1rem', fontWeight: '400', color: '#6b7280' }}>
                    /月
                  </span>
                </div>
                <p className={styles.planDescription}>{plan.description}</p>

                <ul className={styles.features}>
                  {(plan.features || []).map((feature: string, i: number) => (
                    <li key={i} className={styles.featureItem}>
                      <span className={styles.featureIcon}><CheckIcon /></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.link ? (
                  <Link
                    href={plan.link}
                    className={`${styles.button} ${plan.isPopular ? styles.buttonPrimary : styles.buttonSecondary}`}
                    style={plan.isPopular ? { backgroundColor: primaryColor } : {}}
                  >
                    {plan.buttonText}
                    <span style={{ marginLeft: '0.5rem' }}><ArrowRightIcon /></span>
                  </Link>
                ) : (
                  <span
                    className={`${styles.button} ${plan.isPopular ? styles.buttonPrimary : styles.buttonSecondary}`}
                    style={plan.isPopular ? { backgroundColor: primaryColor, color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' } : {}}
                  >
                    {plan.buttonText}
                    <span style={{ marginLeft: '0.5rem' }}><ArrowRightIcon /></span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
