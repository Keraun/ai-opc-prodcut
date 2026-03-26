'use client'

import styles from "./not-found.module.css"
import { registerSiteHeaderModule } from "@/modules/site-header/register"
import { registerSiteFooterModule } from "@/modules/site-footer/register"
import { registerNotFoundModule } from "@/modules/section-404/register"
import { ModuleRenderer } from "@/modules/renderer"
import type { ModuleData } from "@/modules/types"

registerSiteHeaderModule()
registerSiteFooterModule()
registerNotFoundModule()

const notFoundModules: ModuleData[] = [
  {
    moduleName: "site-header",
    moduleId: "site-header",
    moduleInstanceId: "site-header",
    data: {}
  },
  {
    moduleName: "404 页面",
    moduleId: "section-404",
    moduleInstanceId: "section-404",
    data: {}
  },
  {
    moduleName: "site-footer",
    moduleId: "site-footer",
    moduleInstanceId: "site-footer",
    data: {}
  },
]

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <ModuleRenderer modules={notFoundModules} />
    </div>
  )
}
