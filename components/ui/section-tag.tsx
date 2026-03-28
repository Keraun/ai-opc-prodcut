import type { ReactNode } from 'react'
import styles from './section-tag.module.css'

export interface SectionTagProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  type?: 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'pink' | 'yellow' | 'cyan'
  useThemeColor?: boolean
}

export function SectionTag({
  children,
  className = '',
  style = {},
  type = 'blue',
  useThemeColor = false
}: SectionTagProps) {
  if (useThemeColor) {
    return (
      <span 
        className={`${styles.sectionTag} ${styles.color_theme} ${className}`}
        style={style}
      >
        {children}
      </span>
    )
  }

  return (
    <span 
      className={`${styles.sectionTag} ${styles[`color_${type}`]} ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}
