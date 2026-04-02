"use client"

import { Section } from "@/components/ui"
import type { ModuleProps } from "@/modules/types"
import type { SpacerData } from "./types"
import styles from "./index.module.css"

export function SpacerModule({ data }: ModuleProps) {
  const config: SpacerData = (data as SpacerData) || {}

  const containerStyle = {
    margin: config.margin,
    marginTop: config.marginTop,
    marginBottom: config.marginBottom,
    marginLeft: config.marginLeft,
    marginRight: config.marginRight,
    padding: config.padding,
    paddingTop: config.paddingTop,
    paddingBottom: config.paddingBottom,
    paddingLeft: config.paddingLeft,
    paddingRight: config.paddingRight,
    height: config.height,
    backgroundColor: config.backgroundColor,
    border: config.border,
    borderRadius: config.borderRadius
  }

  const containerContent = (
    <div 
      className={`${styles.container} ${config.layout === 'article' ? styles.article : ''} ${config.className || ''}`}
      style={containerStyle}
    />
  )

  if (config.layout === 'section') {
    return (
      <Section
        id="spacer-section"
        variant="gradient"
        padding="none"
        maxWidth="lg"
        className={styles.section}
      >
        {containerContent}
      </Section>
    )
  }

  return (
    <Section
      id="spacer-section"
      variant="default"
      padding="none"
      maxWidth="lg"
      className={styles.section}
    >
      {containerContent}
    </Section>
  )
}