import Link from "next/link"
import { Card, Section, Button } from "@/components/ui"
import { useTheme } from "@/components/theme-provider"
import { CheckIcon, ArrowRightIcon } from "@/modules/icons"
import type { ModuleProps } from "@/modules/types"
import type { PricingData, PricingFeature } from "./types"
import styles from "./index.module.css"

export function PricingModule({ data }: ModuleProps) {
  const config: PricingData = (data as PricingData) || {}
  const { themeConfig } = useTheme()

  const primaryColor = themeConfig?.colors.primary || "#1e40af" // 默认主色
  const secondaryColor = themeConfig?.colors.secondary || "#3b82f6" // 默认次要色
  const accentColor = themeConfig?.colors.accent || "#06b6d4" // 默认强调色

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
    <Section
      id="pricing"
      title={config?.title || '选择适合你的计划'}
      description={config?.description || '无论你是个人创业者还是企业用户，我们都有适合你的AI解决方案'}
      variant="default"
      padding="lg"
      centered
    >
      <div className={styles.grid}>
        {pricingPlans.map((plan: PricingFeature, index: number) => {
          const planLink = (plan as any).buttonLink || (plan as any).link
          const cardFooter = planLink ? (
            <Link href={planLink} className={styles.buttonLink}>
              <Button
                variant={plan.isPopular ? "primary" : "outline"}
                size="lg"
                fullWidth
                icon={<ArrowRightIcon />}
                iconPosition="right"
                style={{
                  backgroundColor: plan.isPopular ? primaryColor : 'transparent',
                  borderColor: primaryColor,
                  color: plan.isPopular ? '#ffffff' : primaryColor,
                  transition: 'all 0.3s ease'
                }}
              >
                {plan.buttonText}
              </Button>
            </Link>
          ) : (
            <Button
              variant={plan.isPopular ? "primary" : "outline"}
              size="lg"
              fullWidth
              disabled
              icon={<ArrowRightIcon />}
              iconPosition="right"
              style={{
                backgroundColor: plan.isPopular ? primaryColor : 'transparent',
                borderColor: primaryColor,
                color: plan.isPopular ? '#ffffff' : primaryColor
              }}
            >
              {plan.buttonText}
            </Button>
          )

          return (
            <Card
              key={index}
              variant="default"
              padding="lg"
              hover
              className={`${styles.card} ${plan.isPopular ? styles.cardPopular : ''}`}
              style={{
                borderColor: plan.isPopular ? primaryColor : '#e5e7eb',
                boxShadow: plan.isPopular ? `0 25px 50px -12px ${primaryColor}33` : 'none',
                transform: plan.isPopular ? 'translateY(-10px)' : 'none'
              }}
            >
              {plan.isPopular && (
                <div 
                  className={styles.popularBadge}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                  }}
                >
                  {config.popularBadgeText || '最受欢迎'}
                </div>
              )}

              <div className={styles.planHeader}>
                <h3 className={styles.planTitle} style={{ color: plan.isPopular ? primaryColor : '#111827' }}>{plan.title}</h3>
                <div className={styles.planPrice} style={{ color: plan.isPopular ? primaryColor : '#111827' }}>
                  {plan.price}
                  <span className={styles.priceUnit}>/月</span>
                </div>
                <p className={styles.planDescription}>{plan.description}</p>
              </div>

              <ul className={styles.features}>
                {(plan.features || []).map((feature: string, i: number) => (
                  <li key={i} className={styles.featureItem}>
                    <span className={styles.featureIcon} style={{ color: accentColor }}><CheckIcon /></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.cardFooter}>
                {cardFooter}
              </div>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}
