'use client'

import { useState, useEffect, useMemo } from 'react'
import NextImage from 'next/image'

interface WebPImageProps extends Omit<React.ComponentProps<typeof NextImage>, 'src'> {
  src: string
  webpSrc?: string
  fallbackSrc?: string
  onWebPFallback?: () => void
  onLoadError?: () => void
}

let webPSupportCached: boolean | null = null

function checkWebPSupport(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  if (webPSupportCached !== null) {
    return webPSupportCached
  }

  try {
    const canvas = document.createElement('canvas')
    if (canvas.getContext && canvas.getContext('2d')) {
      webPSupportCached = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    } else {
      webPSupportCached = false
    }
  } catch {
    webPSupportCached = false
  }

  return webPSupportCached
}

function deriveWebPSrc(originalSrc: string): string {
  if (!originalSrc) return originalSrc

  if (originalSrc.endsWith('.webp')) {
    return originalSrc
  }

  const ext = /\.(jpe?g|png|gif|bmp|svg)$/i
  if (ext.test(originalSrc)) {
    return originalSrc.replace(ext, '.webp')
  }

  return `${originalSrc}.webp`
}

export function WebPImage({
  src,
  webpSrc: explicitWebpSrc,
  fallbackSrc,
  onWebPFallback,
  onLoadError,
  onError,
  ...props
}: WebPImageProps) {
  const [supportsWebP, setSupportsWebP] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const supported = checkWebPSupport()
    setSupportsWebP(supported)
  }, [])

  const webpSrc = useMemo(() => {
    if (explicitWebpSrc) return explicitWebpSrc
    return deriveWebPSrc(src)
  }, [src, explicitWebpSrc])

  const actualSrc = useMemo(() => {
    if (hasError && fallbackSrc) {
      return fallbackSrc
    }

    if (supportsWebP && !hasError) {
      return webpSrc
    }

    return src
  }, [supportsWebP, hasError, src, webpSrc, fallbackSrc])

  const handleError = (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('WebPImage load error:', actualSrc)

    if (actualSrc === webpSrc && !hasError) {
      setHasError(true)
      onWebPFallback?.()
    } else {
      onLoadError?.()
      onError?.(error)
    }
  }

  return (
    <NextImage
      src={actualSrc}
      onError={handleError}
      {...props}
    />
  )
}

export function useWebPSupport() {
  const [supportsWebP, setSupportsWebP] = useState(false)

  useEffect(() => {
    setSupportsWebP(checkWebPSupport())
  }, [])

  return supportsWebP
}

export { checkWebPSupport, deriveWebPSrc }
