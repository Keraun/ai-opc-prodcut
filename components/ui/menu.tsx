import type { HTMLAttributes, ReactNode } from "react"

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
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline"
  size?: "sm" | "md" | "lg"
}

export function Menu({
  items,
  orientation = "horizontal",
  variant = "default",
  size = "md",
  className = "",
  style = {},
  ...props
}: MenuProps) {
  const baseStyles = "flex"

  const orientationStyles = {
    horizontal: "flex-row items-center gap-1",
    vertical: "flex-col items-stretch gap-1"
  }

  const variantStyles = {
    default: "",
    pills: "bg-gray-100 p-1 rounded-lg",
    underline: "border-b border-gray-200"
  }

  const sizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  const renderMenuItem = (item: MenuItem) => {
    const baseItemStyles = "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 font-medium"

    const variantItemStyles = {
      default: "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
      pills: "text-gray-700 hover:bg-white hover:shadow-sm",
      underline: "text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-600 -mb-0.5"
    }

    const disabledStyles = item.disabled
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "cursor-pointer"

    return (
      <a
        key={item.id}
        href={item.href}
        className={`${baseItemStyles} ${variantItemStyles[variant]} ${sizeStyles[size]} ${disabledStyles}`}
        aria-disabled={item.disabled}
      >
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </a>
    )
  }

  return (
    <nav
      className={`${baseStyles} ${orientationStyles[orientation]} ${variantStyles[variant]} ${className}`}
      style={style}
      {...props}
    >
      {items.map(renderMenuItem)}
    </nav>
  )
}
