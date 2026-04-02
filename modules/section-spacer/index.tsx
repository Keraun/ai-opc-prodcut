"use client"

import { Section } from "@/components/ui"
import type { ModuleProps } from "@/modules/types"
import type { SpacerData } from "./types"
import styles from "./index.module.css"

export function SpacerModule({ data }: ModuleProps) {
  const config: SpacerData = (data as SpacerData) || {}

  const getSpacingValue = (spacingConfig: SpacingConfig | undefined) => {
    if (!spacingConfig) return '0'
    return `${spacingConfig.value}${spacingConfig.unit}`
  }

  const containerStyle = {
    margin: getSpacingValue(config.margin),
    marginTop: getSpacingValue(config.marginTop),
    marginBottom: getSpacingValue(config.marginBottom),
    marginLeft: getSpacingValue(config.marginLeft),
    marginRight: getSpacingValue(config.marginRight),
    padding: getSpacingValue(config.padding),
    paddingTop: getSpacingValue(config.paddingTop),
    paddingBottom: getSpacingValue(config.paddingBottom),
    paddingLeft: getSpacingValue(config.paddingLeft),
    paddingRight: getSpacingValue(config.paddingRight),
    height: getSpacingValue(config.height),
    backgroundColor: config.backgroundColor,
    border: config.border,
    borderRadius: config.borderRadius
  }

  const sectionStyle = {
    marginTop: 0,
    marginBottom: 0
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
        style={sectionStyle}
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
      style={sectionStyle}
    >
      {containerContent}
    </Section>
  )
}