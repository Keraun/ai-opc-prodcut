'use client'

import styles from './FallbackImage.module.css'

interface FallbackImageProps {
  type: 'product' | 'article'
  alt?: string
  className?: string
}

export function FallbackImage({ type, alt = '', className = '' }: FallbackImageProps) {
  return (
    <div className={`${styles.fallbackImage} ${styles[type]} ${className}`}>
      <div className={styles.iconWrapper}>
        {type === 'product' ? (
          <svg viewBox="0 0 100 100" className={styles.icon}>
            <path 
              d="M50 0L100 25V75L50 100L0 75V25L50 0Z" 
              fill="currentColor" 
              opacity="0.3"
            />
            <path 
              d="M50 25L75 37.5V62.5L50 75L25 62.5V37.5L50 25Z" 
              fill="currentColor" 
              opacity="0.5"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 100 100" className={styles.icon}>
            <rect x="10" y="10" width="80" height="60" rx="4" fill="currentColor" opacity="0.3"/>
            <rect x="20" y="80" width="60" height="6" rx="2" fill="currentColor" opacity="0.4"/>
            <rect x="20" y="90" width="40" height="4" rx="2" fill="currentColor" opacity="0.3"/>
          </svg>
        )}
      </div>
      <span className={styles.label}>
        {type === 'product' ? 'AI 产品' : '资讯文章'}
      </span>
    </div>
  )
}
