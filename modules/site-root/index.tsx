"use client"

import type { ModuleProps } from "@/modules/types"
// import type { SiteRootData } from "./types"
import styles from "./index.module.css"

export function SiteRootModule({ data }: ModuleProps) {
  return (
    <div className={styles.siteRoot}></div>
  )
}
