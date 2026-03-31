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

  const pricingPlans: PricingFeature[] = config?.plans || []
  const popularBadgeText = config?.popularBadgeText || '最受欢迎'
  const priceUnit = config?.priceUnit || '/ 月'

  return (
    <Section
      id="pricing"
      title={config?.title}
      description={config?.description}
      badge={config?.sectionTag || '价格方案'}
      variant="default"
      padding="lg"
      centered
      badgeClassName={styles.badge}
      useThemeBadgeColor
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
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: plan.isPopular ? secondaryColor : `${primaryColor}10`,
                    borderColor: secondaryColor
                  }
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
              icon={<ArrowRightIcon />}
              iconPosition="right"
              style={{
                backgroundColor: plan.isPopular ? primaryColor : 'transparent',
                borderColor: primaryColor,
                color: plan.isPopular ? '#ffffff' : primaryColor,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: plan.isPopular ? secondaryColor : `${primaryColor}10`,
                  borderColor: secondaryColor
                }
              }}
            >
              {plan.buttonText}
            </Button>
          )

          return (
            <Card
              key={index}
              className={[styles.card, plan.isPopular ? styles.cardPopular : ''].join(' ')}
              style={{
                borderColor: plan.isPopular ? primaryColor : '#e5e7eb'
              }}
            >
              {plan.isPopular && (
                <div
                  className={styles.popularBadge}
                  style={{ backgroundColor: primaryColor }}
                >
                  {popularBadgeText}
                </div>
              )}
              <div className={styles.cardContent}>
                <div className={styles.planHeader}>
                  <h3 className={styles.planTitle}>{plan.title}</h3>
                  <div className={styles.planPrice}>
                    {plan.price}
                    <span className={styles.priceUnit}>{priceUnit}</span>
                  </div>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>
                <ul className={styles.features}>
                  {plan.features?.map((feature: string, i: number) => (
                    <li key={i} className={styles.featureItem}>
                      <span className={styles.featureIcon}>
                        <CheckIcon className={styles.checkIcon} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.cardFooter}>
                  {cardFooter}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}
