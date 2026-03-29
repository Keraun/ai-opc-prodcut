'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './ResponsiveImage.module.css'

interface ResponsiveImageProps {
  src: string
  webpSrc?: string
  alt: string
  className?: string
  priority?: boolean
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export function ResponsiveImage({
  src,
  webpSrc,
  alt,
  className = '',
  priority = false,
  placeholder,
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [supportsWebP, setSupportsWebP] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas')
      if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
      }
      return false
    }

    setSupportsWebP(checkWebPSupport())
  }, [])

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const imageSrc = supportsWebP && webpSrc ? webpSrc : src

  if (hasError) {
    return (
      <div className={`${styles.errorPlaceholder} ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>图片加载失败</span>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {!isLoaded && (
        <div className={styles.placeholder}>
          {placeholder ? (
            <img src={placeholder} alt="" className={styles.placeholderImg} />
          ) : (
            <div className={styles.loadingSpinner} />
          )}
        </div>
      )}
      
      <picture>
        {webpSrc && (
          <source srcSet={isInView ? webpSrc : undefined} type="image/webp" />
        )}
        <img
          ref={imgRef}
          src={isInView ? imageSrc : undefined}
          alt={alt}
          className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
        />
      </picture>
    </div>
  )
}
