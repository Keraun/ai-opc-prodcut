import type { ButtonHTMLAttributes, ReactNode } from "react"
import styles from "./button.module.css"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "text"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: "left" | "right"
  loading?: boolean
  disabled?: boolean
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  children,
  className = "",
  style = {},
  ...props
}: ButtonProps) {
  const variantClass = styles[variant] || styles.primary
  const sizeClass = styles[size] || styles.md

  return (
    <button
      className={`${styles.button} ${variantClass} ${sizeClass} ${fullWidth ? styles.fullWidth : ""} ${className}`}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading && (
        <svg
          className={styles.spinner}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className={styles.spinnerCircle}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className={styles.spinnerPath}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0 4.411 3.589 8 8 8s8-3.589 8-8c0-2.87-1.52-5.38-3.8-6.708l-2.708 2.708z"
          />
        </svg>
      )}
      {!loading && icon && iconPosition === "left" && (
        <span className={styles.iconLeft}>{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <span className={styles.iconRight}>{icon}</span>
      )}
    </button>
  )
}
