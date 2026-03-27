import type { ReactNode } from 'react'
import styles from './section-tag.module.css'

export interface SectionTagProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  type?: 'blue' | 'gray' | 'green' | 'orange' | 'red' | 'cyan' | 'purple' | 'teal'
}

export function SectionTag({
  children,
  className = '',
  style = {},
  type = 'blue'
}: SectionTagProps) {
  return (
    <span 
      className={`${styles.sectionTag} ${styles[`color_${type}`]} ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}
