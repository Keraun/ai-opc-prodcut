import type { HTMLAttributes, ReactNode } from "react"
import { SectionTag } from "./section-tag"
import styles from "./section.module.css"

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  id?: string
  title?: string
  description?: string
  badge?: string
  badgeClassName?: string
  badgeStyle?: React.CSSProperties
  variant?: "default" | "gradient" | "minimal"
  padding?: "none" | "sm" | "md" | "lg"
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full"
  centered?: boolean
}

export function Section({
  id,
  title,
  description,
  badge,
  badgeClassName = "",
  badgeStyle,
  variant = "default",
  padding = "lg",
  maxWidth = "xl",
  centered = false,
  children,
  className = "",
  style = {},
  ...props
}: SectionProps) {
  const variantClass = styles[variant] || styles.default
  const paddingClass = styles[`padding_${padding}`] || styles.padding_lg
  const maxWidthClass = styles[`maxWidth_${maxWidth}`] || styles.maxWidth_xl

  return (
    <section
      id={id}
      className={`${styles.section} ${variantClass} ${paddingClass} ${className}`}
      style={style}
      {...props}
    >
      <div className={`${styles.container} ${maxWidthClass} ${centered ? styles.centered : ""}`}>
        <div className={styles.header}>
          {badge && (
            <SectionTag
              className={`${styles.badge} ${badgeClassName}`}
              style={badgeStyle}
            >
              {badge}
            </SectionTag>
          )}
          {title && (
            <h2 className={styles.title}>
              {title}
            </h2>
          )}
          {description && (
            <p className={styles.description}>
              {description}
            </p>
          )}</div>
        {children}
      </div>
    </section>
  )
}
