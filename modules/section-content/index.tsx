"use client"

import { Section } from "@/components/ui"
import type { ModuleProps } from "@/modules/types"
import type { ContentData } from "./types"
import styles from "./index.module.css"

export function ContentModule({ data }: ModuleProps) {
  const config: ContentData = (data as ContentData) || {}

  return (
    <Section
      id="content-section"
      variant="default"
      padding="lg"
      maxWidth="xl"
    >
      <div className={styles.container}>
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
