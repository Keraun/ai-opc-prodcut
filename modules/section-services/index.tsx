import type { ModuleProps } from "@/modules/types"
import type { ServicesData } from "./types"
import styles from "./index.module.css"

// SVG 图标组件
const BulbIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const SettingsIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const BookIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const CustomerServiceIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

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
              <div
                key={index}
                className={styles.card}
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={`${styles.iconWrapper} ${colors.iconWrapper}`}>
                      <div className={`${styles.icon} ${colors.icon}`}>
                        {Icon}
                      </div>
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
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
