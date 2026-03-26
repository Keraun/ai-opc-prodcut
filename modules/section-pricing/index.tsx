"use client"

import { Button, Card, Modal } from "@arco-design/web-react"
import { IconCheck, IconArrowRight } from "@arco-design/web-react/icon"
import { useTheme } from "@/components/theme-provider"
import { useState } from "react"
import type { ModuleProps } from "@/modules/types"
import type { PricingData, PricingFeature } from "./types"
import styles from "./index.module.css"

export function PricingModule({ data }: ModuleProps) {
  const { themeConfig } = useTheme()
  const config: PricingData = (data as PricingData) || {}

  const [qrModalVisible, setQrModalVisible] = useState(false)

  const primaryColor = themeConfig?.colors?.primary || "#1e40af"

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

  const handleButtonClick = (plan: PricingFeature) => {
    if (plan.link) {
      window.location.href = plan.link
    } else {
      setQrModalVisible(true)
    }
  }

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
            <Card
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
                      <IconCheck className={styles.featureIcon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  type={plan.isPopular ? "primary" : "secondary"}
                  className={`${styles.button} ${plan.isPopular ? styles.buttonPrimary : styles.buttonSecondary}`}
                  style={plan.isPopular ? { backgroundColor: primaryColor } : {}}
                  onClick={() => handleButtonClick(plan)}
                >
                  {plan.buttonText}
                  <IconArrowRight style={{ marginLeft: '0.5rem' }} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        title="扫码咨询"
        visible={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
      >
        <div className={styles.qrCodeContainer}>
          <img
            src="/wechat-qr.png"
            alt="微信二维码"
            className={styles.qrCodeImage}
          />
          <p className={styles.qrCodeText}>
            扫描二维码添加微信咨询
          </p>
        </div>
      </Modal>
    </section>
  )
}
