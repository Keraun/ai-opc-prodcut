import type { ModuleProps } from "@/modules/types"
import type { AboutData } from "./types"
import styles from "./index.module.css"

// SVG 图标组件
const StarIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.78.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const CompassIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
)

const HeartIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

const ThunderboltIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)

const UserIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export function AboutModule({ data }: ModuleProps) {
  const config: AboutData = (data as AboutData) || {}

  const values = [
    {
      icon: <StarIcon />,
      title: config?.mission?.title,
      description: config?.mission?.description,
      color: "cyan"
    },
    {
      icon: <CompassIcon />,
      title: config?.vision?.title,
      description: config?.vision?.description,
      color: "blue"
    },
    {
      icon: <HeartIcon />,
      title: config?.values?.title,
      description: config?.values?.description,
      color: "purple"
    },
  ]

  const stats = config?.stats?.map((stat, index: number) => ({
    icon: index === 0 ? <ThunderboltIcon /> : index === 1 ? <UserIcon /> : <CheckCircleIcon />,
    value: stat?.value,
    label: stat?.label,
    color: index === 0 ? "cyan" : index === 1 ? "blue" : "green",
  })) || []

  const getIconWrapperClass = (color: string) => {
    switch (color) {
      case "cyan": return styles.statIconWrapperCyan
      case "blue": return styles.statIconWrapperBlue
      case "green": return styles.statIconWrapperGreen
      default: return styles.statIconWrapperCyan
    }
  }

  const getIconClass = (color: string) => {
    switch (color) {
      case "cyan": return styles.statIconCyan
      case "blue": return styles.statIconBlue
      case "green": return styles.statIconGreen
      default: return styles.statIconCyan
    }
  }

  const getValueIconWrapperClass = (color: string) => {
    switch (color) {
      case "cyan": return styles.valueIconWrapperCyan
      case "blue": return styles.valueIconWrapperBlue
      case "purple": return styles.valueIconWrapperPurple
      default: return styles.valueIconWrapperCyan
    }
  }

  const getValueIconClass = (color: string) => {
    switch (color) {
      case "cyan": return styles.valueIconCyan
      case "blue": return styles.valueIconBlue
      case "purple": return styles.valueIconPurple
      default: return styles.valueIconCyan
    }
  }

  return (
    <section id="about" className={styles.section}>
      <div className={styles.bgPattern} />
      <div className={styles.decorativeOrb1} />
      <div className={styles.decorativeOrb2} />

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.leftContent}>
            {config?.title && (
              <>
                <span className={styles.tag}>
                  {config?.sectionTag || "关于我们"}
                </span>
                <h2 className={styles.title}>
                  {config.title?.main}
                  <br />
                  {config.title?.highlight && (
                    <span className={styles.titleHighlight}>
                      {config.title.highlight}
                    </span>
                  )}
                </h2>
              </>
            )}
            {config?.description && config.description.length > 0 && (
              <div className={styles.description}>
                {config.description.map((desc: string, index: number) => (
                  <p key={index} className={styles.descriptionItem}>{desc}</p>
                ))}
              </div>
            )}

            {stats.length > 0 && (
              <div className={styles.stats}>
                {stats.map((stat, index: number) => {
                  const Icon = stat?.icon
                  if (!Icon) return null

                  return (
                    <div key={index} className={styles.stat}>
                      <div className={`${styles.statIconWrapper} ${getIconWrapperClass(stat.color)}`}>
                        <div className={`${styles.statIcon} ${getIconClass(stat.color)}`}>
                          {Icon}
                        </div>
                      </div>
                      <div className={styles.statValue}>{stat.value}</div>
                      <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className={styles.rightContent}>
            {values.map((value, index: number) => {
              const Icon = value?.icon
              if (!Icon || !value?.title || !value?.description) return null

              return (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.valueHeader}>
                    <div className={`${styles.valueIconWrapper} ${getValueIconWrapperClass(value.color)}`}>
                      <div className={`${styles.valueIcon} ${getValueIconClass(value.color)}`}>
                        {Icon}
                      </div>
                    </div>
                    <h3 className={styles.valueTitle}>{value.title}</h3>
                  </div>
                  <p className={styles.valueDescription}>{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
