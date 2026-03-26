import type { HTMLAttributes, ReactNode } from "react"
import styles from "./card.module.css"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  footer?: ReactNode
  variant?: "default" | "outlined" | "elevated"
  padding?: "none" | "sm" | "md" | "lg"
  hover?: boolean
}

export function Card({
  title,
  description,
  footer,
  variant = "default",
  padding = "md",
  hover = false,
  children,
  className = "",
  style = {},
  ...props
}: CardProps) {
  const variantClass = styles[variant] || styles.default
  const paddingClass = styles[`padding_${padding}`] || styles.padding_md

  return (
    <div
      className={`${styles.card} ${variantClass} ${paddingClass} ${hover ? styles.hover : ""} ${className}`}
      style={style}
      {...props}
    >
      {title && (
        <h3 className={styles.title}>{title}</h3>
      )}
      {description && (
        <p className={styles.description}>{description}</p>
      )}
      {children}
      {footer && (
        <div className={styles.footer}>{footer}</div>
      )}
    </div>
  )
}
