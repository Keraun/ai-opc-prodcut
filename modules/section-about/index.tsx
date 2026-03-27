import type { ModuleProps } from "@/modules/types"
import type { AboutData } from "./types"
import { useTheme } from "@/components/theme-provider"
import { StarIcon, CompassIcon, HeartIcon, ThunderboltIcon, UserIcon, CheckCircleIcon } from "@/modules/icons"
import styles from "./index.module.css"

export function AboutModule({ data }: ModuleProps) {
  const config: AboutData = (data as AboutData) || {}
  const { themeConfig } = useTheme()
  const primaryColor = themeConfig?.colors.primary || "#1e40af" // 默认主色

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
                    <span 
                      className={styles.titleHighlight}
                      style={{ color: primaryColor }}
                    >
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
                  if (!stat?.icon) return null

                  return (
                    <div key={index} className={styles.stat}>
                      <div 
                        className={styles.statIconWrapper} 
                        style={{ 
                          backgroundColor: `${primaryColor}20` 
                        }}
                      >
                        <div 
                          className={styles.statIcon} 
                          style={{ 
                            color: primaryColor 
                          }}
                        >
                          {stat.icon}
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
              if (!value?.icon || !value?.title || !value?.description) return null

              return (
                <div key={index} className={styles.valueCard}>
                  <div className={styles.valueHeader}>
                    <div 
                      className={styles.valueIconWrapper} 
                      style={{ 
                        backgroundColor: `${primaryColor}20` 
                      }}
                    >
                      <div 
                        className={styles.valueIcon} 
                        style={{ 
                          color: primaryColor 
                        }}
                      >
                        {value.icon}
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
