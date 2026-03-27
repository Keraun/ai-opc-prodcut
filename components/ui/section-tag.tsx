import type { ReactNode } from 'react'
import styles from './section-tag.module.css'

interface SectionTagProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function SectionTag({
  children,
  className = '',
  style = {}
}: SectionTagProps) {
  return (
    <span 
      className={`${styles.sectionTag} ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}
