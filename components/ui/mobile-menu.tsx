'use client'

import type { HTMLAttributes, ReactNode } from "react"
import { useState } from "react"
import styles from "./mobile-menu.module.css"

export interface MobileMenuItem {
  id: string
  label: string
  href?: string
  icon?: ReactNode
  disabled?: boolean
  badge?: string
  children?: MobileMenuItem[]
}

export interface MobileMenuProps extends HTMLAttributes<HTMLElement> {
  items: MobileMenuItem[]
  variant?: "default" | "pills"
  size?: "sm" | "md" | "lg"
}

export function MobileMenu({
  items,
  variant = "default",
  size = "md",
  className = "",
  style = {},
  ...props
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const variantClass = styles[`variant_${variant}`] || styles.variant_default
  const sizeClass = styles[`size_${size}`] || styles.size_md

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const renderMenuItem = (item: MobileMenuItem) => {
    const variantItemClass = styles[`item_${variant}`] || styles.item_default

    return (
      <a
        key={item.id}
        href={item.href}
        className={`${styles.menuItem} ${variantItemClass} ${sizeClass} ${item.disabled ? styles.disabled : ""}`}
        aria-disabled={item.disabled}
        onClick={() => setIsOpen(false)}
      >
        {item.icon && <span className={styles.icon}>{item.icon}</span>}
        <span className={styles.label}>{item.label}</span>
        {item.badge && (
          <span className={styles.badge}>
            {item.badge}
          </span>
        )}
      </a>
    )
  }

  return (
    <div className={`${styles.mobileMenu} ${className}`} style={style} {...props}>
      <button
        className={`${styles.menuButton} ${isOpen ? styles.open : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)}></div>
          <nav className={`${styles.menu} ${variantClass}`}>
            {items.map(renderMenuItem)}
          </nav>
        </>
      )}
    </div>
  )
}
