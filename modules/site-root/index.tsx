"use client"

import type { ModuleProps } from "@/modules/types"
import type { SiteRootData } from "./types"
import styles from "./index.module.css"

export function SiteRootModule({ data }: ModuleProps) {
  const config: SiteRootData = (data as SiteRootData) || {}

  return (
    <div className={styles.siteRoot}>
      {config.name && (
        <meta name="site-name" content={config.name} />
      )}
      {config.description && (
        <meta name="description" content={config.description} />
      )}
      {config.url && (
        <link rel="canonical" href={config.url} />
      )}
      {config.ogImage && (
        <meta property="og:image" content={config.ogImage} />
      )}
    </div>
  )
}
