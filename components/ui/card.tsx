import type { HTMLAttributes, ReactNode } from "react"

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
  const baseStyles = "rounded-xl transition-all duration-300"

  const variantStyles = {
    default: "bg-white border border-gray-200",
    outlined: "bg-transparent border-2 border-gray-300",
    elevated: "bg-white shadow-lg border border-gray-100"
  }

  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  }

  const hoverStyles = hover ? "hover:shadow-xl hover:-translate-y-1" : ""

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      style={style}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {children}
      {footer && (
        <div className="mt-6 pt-4 border-t border-gray-100">{footer}</div>
      )}
    </div>
  )
}
