import type { HTMLAttributes, ReactNode } from "react"
import styles from "./menu.module.css"

export interface MenuItem {
  id: string
  label: string
  href?: string
  icon?: ReactNode
  disabled?: boolean
  badge?: string
  children?: MenuItem[]
}

export interface MenuProps extends HTMLAttributes<HTMLElement> {
  items: MenuItem[]
  device?: "web" | "mobile"
  variant?: "default" | "pills" | "underline"
  size?: "sm" | "md" | "lg"
}

export function Menu({
  items,
  device = "web",
  variant = "default",
  size = "md",
  className = "",
  style = {},
  ...props
}: MenuProps) {
  const isMobile = device === "mobile"
  const orientationClass = isMobile ? styles.vertical : styles.horizontal
  const deviceClass = isMobile ? styles.mobile : styles.web
  const variantClass = styles[`variant_${variant}`] || styles.variant_default
  const sizeClass = styles[`size_${size}`] || styles.size_md

  const renderMenuItem = (item: MenuItem) => {
    const variantItemClass = styles[`item_${variant}`] || styles.item_default

    return (
      <a
        key={item.id}
        href={item.href}
        className={`${styles.menuItem} ${variantItemClass} ${sizeClass} ${item.disabled ? styles.disabled : ""}`}
        aria-disabled={item.disabled}
      >
        {item.icon && <span className={styles.icon}>{item.icon}</span>}
        <span>{item.label}</span>
        {item.badge && (
          <span className={styles.badge}>
            {item.badge}
          </span>
        )}
      </a>
    )
  }

  return (
    <nav
      className={`${styles.menu} ${deviceClass} ${orientationClass} ${variantClass} ${className}`}
      style={style}
      {...props}
    >
      {items.map(renderMenuItem)}
    </nav>
  )
}
