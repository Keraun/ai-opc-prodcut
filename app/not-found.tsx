'use client'

import styles from "./not-found.module.css"
import { registerSiteHeaderModule, HeaderModule } from "@/modules/site-header/register"
import { registerSiteFooterModule, FooterModule } from "@/modules/site-footer/register"
import { registerNotFoundModule } from "@/modules/section-404/register"
import { ModuleRenderer } from "@/modules/renderer"
import type { ModuleData } from "@/modules/types"

registerSiteHeaderModule()
registerSiteFooterModule()
registerNotFoundModule()

const notFoundModules: ModuleData[] = [
  {
    moduleName: "404 页面",
    moduleId: "section-404",
    moduleInstanceId: "section-404",
    data: {}
  }
]

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <HeaderModule moduleName="site-header" moduleId="site-header" moduleInstanceId="site-header" data={{}} />
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.animationWrapper}>
            <ModuleRenderer modules={notFoundModules} />
          </div>
        </div>
      </div>
      <FooterModule moduleName="site-footer" moduleId="site-footer" moduleInstanceId="site-footer" data={{}} />
    </div>
  )
}
