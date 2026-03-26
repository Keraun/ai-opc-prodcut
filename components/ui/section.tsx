import type { HTMLAttributes, ReactNode } from "react"

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  id?: string
  title?: string
  description?: string
  badge?: string
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
  variant = "default",
  padding = "lg",
  maxWidth = "xl",
  centered = false,
  children,
  className = "",
  style = {},
  ...props
}: SectionProps) {
  const baseStyles = "w-full"

  const variantStyles = {
    default: "bg-white",
    gradient: "bg-gradient-to-br from-blue-50 to-cyan-50",
    minimal: "bg-transparent"
  }

  const paddingStyles = {
    none: "",
    sm: "py-8",
    md: "py-12",
    lg: "py-20"
  }

  const maxWidthStyles = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full"
  }

  const centeredStyles = centered ? "text-center" : "text-left"

  return (
    <section
      id={id}
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      style={style}
      {...props}
    >
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthStyles[maxWidth]} ${centeredStyles}`}>
        {badge && (
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-full mb-4">
            {badge}
          </span>
        )}
        {title && (
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-lg text-gray-600 mb-8 max-w-3xl">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
