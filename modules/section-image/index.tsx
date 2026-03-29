"use client"

import { Section } from "@/components/ui"
import { WebPImage } from "@/components/WebPImage"
import { useMobile } from "@/hooks/use-mobile"
import type { ModuleProps } from "@/modules/types"
import type { ImageData } from "./types"
import styles from "./index.module.css"

export function ImageModule({ data }: ModuleProps) {
  const config: ImageData = (data as ImageData) || {}
  const isMobile = useMobile()

  const imageUrl = isMobile && config.mobileImage 
    ? config.mobileImage 
    : config.webImage

  return (
    <Section
      id="image-section"
      variant={config.background === 'light' ? 'default' : 'gradient'}
      padding={config.fullWidth ? 'none' : 'lg'}
      maxWidth={config.fullWidth ? 'full' : 'xl'}
    >
      <div className={`${styles.container} ${config.fullWidth ? styles.fullWidth : ''}`}>
        {config.title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{config.title}</h2>
            {config.description && (
              <p className={styles.description}>{config.description}</p>
            )}
          </div>
        )}
        
        {imageUrl && (
          <div className={styles.imageWrapper}>
            <WebPImage
              src={imageUrl}
              alt={config.alt || '图片'}
              width={config.width || 1200}
              height={config.height || 630}
              className={styles.image}
              priority={config.priority || false}
            />
          </div>
        )}
        
        {config.caption && (
          <p className={styles.caption}>{config.caption}</p>
        )}
      </div>
    </Section>
  )
}
