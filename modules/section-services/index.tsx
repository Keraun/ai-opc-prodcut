import type { ModuleProps } from "@/modules/types"
import type { ServicesData } from "./types"
import { Section } from "@/components/ui"
import { BulbIcon, BookIcon, SettingsIcon, CustomerServiceIcon } from "@/modules/icons"
import styles from "./index.module.css"

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
    icon: index === 0 ? <BulbIcon /> : index === 1 ? <BookIcon /> : index === 2 ? <SettingsIcon /> : <CustomerServiceIcon />,
    number: `0${index + 1}`,
    title: service.title,
    description: service.description,
    highlights: service.highlights,
    color: index === 0 ? "blue" : index === 1 ? "green" : index === 2 ? "purple" : "orange",
  }))

  return (
    <Section
      id="services"
      badge={config.sectionTag}
      title={config.title}
      description={config.description}
      className={styles.section}
      useThemeBadgeColor
      centered
    >
      <div className={styles.bgPattern} />

      <div className={styles.container}>
        <div className={styles.grid}>
          {services.map((service, index) => {
            const colorClasses = colorMap[service.color]
            const colorValues: Record<string, string> = {
              blue: '#2563eb',
              green: '#16a34a',
              purple: '#9333ea',
              orange: '#f59e0b',
            }
            const colorValue = colorValues[service.color]
            return (
              <div
                key={index}
                className={styles.card}
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.iconWrapper} ${colorClasses.iconWrapper}`}>
                      <div className={`${styles.icon} ${colorClasses.icon}`}>
                        {service.icon}
                      </div>
                    </div>
                    <span className={styles.number} style={{ color: colorValue }}>
                      {service.number}
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardDescription}>{service.description}</p>

                  <div className={styles.highlights}>
                    {service.highlights?.map((highlight, i) => (
                      <div key={i} className={styles.highlight}>
                        <div className={`${styles.highlightDot} ${colorClasses.highlightDot}`} />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
