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

  // 判断是否是白色背景（包含 #ffffff, #fff, white 等）
  const isWhiteBackground = () => {
    const bg = (config.backgroundColor || "#ffffff").toLowerCase().trim()
    return bg === "#ffffff" || bg === "#fff" || bg === "white"
  }

  // 确定 Section 的 padding，优先级：fullWidth > containerPadding
  const getSectionPadding = () => {
    if (config.fullWidth) {
      return 'none'
    }
    return 'lg'
  }

  return (
    <Section
      id="image-section"
      variant="default"
      padding={getSectionPadding()}
      maxWidth={config.fullWidth ? 'full' : 'xl'}
      className={styles.section}
      style={{ 
        backgroundColor: config.backgroundColor || "#ffffff",
        paddingLeft: !config.fullWidth ? config.containerPadding || '1.5rem' : undefined,
        paddingRight: !config.fullWidth ? config.containerPadding || '1.5rem' : undefined
      }}
    >
      <div className={`${styles.container} ${config.fullWidth ? styles.fullWidth : ''} ${isWhiteBackground() ? styles.whiteBackground : ''}`}>
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
              priority={false}
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
