"use client"

import { Section } from "@/components/ui"
import type { ModuleProps } from "@/modules/types"
import type { ContentData } from "./types"
import styles from "./index.module.css"

export function ContentModule({ data }: ModuleProps) {
  const config: ContentData = (data as ContentData) || {}

  const getMarginValue = (marginConfig: MarginConfig | undefined) => {
    if (!marginConfig) return '0'
    return `${marginConfig.value}${marginConfig.unit}`
  }

  return (
    <Section
      id="content-section"
      variant={config.contentLayout === 'section' ? 'gradient' : 'default'}
      padding="lg"
      maxWidth="lg"
      style={{
        marginTop: getMarginValue(config.marginTop),
        marginBottom: getMarginValue(config.marginBottom)
      }}
    >
      <div className={`${styles.container} ${config.contentLayout === 'article' ? styles.article : ''}`}>
        {config.title && (
          <h2 className={styles.title}>{config.title}</h2>
        )}
        {config.content && (
          <div 
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: config.content }}
          />
        )}
      </div>
    </Section>
  )
}
