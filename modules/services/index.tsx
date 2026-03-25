"use client"

import { Card } from "@arco-design/web-react"
import {
  IconBulb,
  IconSettings,
  IconBook,
  IconCustomerService,
} from "@arco-design/web-react/icon"
import type { ModuleProps } from "@/modules/types"
import type { ServicesData } from "./types"
import styles from "./services.module.css"

const colorMap: Record<string, { iconWrapper: string; icon: string; highlightDot: string }> = {
  orange: { 
    iconWrapper: styles.iconWrapperOrange, 
    icon: styles.iconOrange, 
    highlightDot: styles.highlightDotOrange 
  },
  blue: { 
    iconWrapper: styles.iconWrapperBlue, 
    icon: styles.iconBlue, 
    highlightDot: styles.highlightDotBlue 
  },
  green: { 
    iconWrapper: styles.iconWrapperGreen, 
    icon: styles.iconGreen, 
    highlightDot: styles.highlightDotGreen 
  },
  purple: { 
    iconWrapper: styles.iconWrapperPurple, 
    icon: styles.iconPurple, 
    highlightDot: styles.highlightDotPurple 
  },
}

export function ServicesModule({ data }: ModuleProps) {
  const config: ServicesData = (data as ServicesData) || {}
  const items = config.items || []

  const services = items.map((service, index) => ({
    icon: index === 0 ? IconBulb : index === 1 ? IconBook : index === 2 ? IconSettings : IconCustomerService,
    number: `0${index + 1}`,
    title: service.title,
    description: service.description,
    highlights: service.highlights,
    color: index === 0 ? "orange" : index === 1 ? "blue" : index === 2 ? "green" : "purple",
  }))

  return (
    <section id="services" className={styles.section}>
      <div className={styles.bgPattern} />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>
            {config.sectionTag || "服务内容"}
          </span>
          <h2 className={styles.title}>
            {config.title || "全方位AI赋能服务"}
          </h2>
          <p className={styles.description}>
            {config.description || "从工具到课程，从定制到咨询，为个人创业者提供一站式AI服务支持"}
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((service, index) => {
            const Icon = service.icon
            const colors = colorMap[service.color]
            return (
              <Card
                key={index}
                className={styles.card}
                hoverable
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.iconWrapper} ${colors.iconWrapper}`}>
                      <Icon className={`${styles.icon} ${colors.icon}`} />
                    </div>
                    <span className={styles.number}>
                      {service.number}
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardDescription}>{service.description}</p>

                  <div className={styles.highlights}>
                    {service.highlights?.map((highlight, i) => (
                      <div key={i} className={styles.highlight}>
                        <div className={`${styles.highlightDot} ${colors.highlightDot}`} />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
