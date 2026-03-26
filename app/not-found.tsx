'use client'

import { useModule } from "@/hooks/use-module"
import { ModuleRenderer } from "@/modules/renderer"
import type { ModuleData } from "@/modules/types"
import { useEffect, useState } from "react"
import styles from "./not-found.module.css"

export default function NotFoundPage() {
  const [modules, setModules] = useState<ModuleData[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setModules([
      {
        moduleName: '站点头部',
        moduleId: 'site-header',
        moduleInstanceId: 'site-header',
        data: {}
      },
      {
        moduleName: '404 页面',
        moduleId: 'section-404',
        moduleInstanceId: 'section-404',
        data: {}
      },
      {
        moduleName: '站点页脚',
        moduleId: 'site-footer',
        moduleInstanceId: 'site-footer',
        data: {}
      }
    ])
    setLoaded(true)
  }, [])

  if (!loaded) {
    return null
  }

  const headerModule = modules.find(m => m.moduleId === 'site-header')
  const footerModule = modules.find(m => m.moduleId === 'site-footer')
  const notFoundModule = modules.find(m => m.moduleId === 'section-404')

  return (
    <div className={styles.container}>
      {headerModule && <ModuleRenderer modules={[headerModule]} />}
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.animationWrapper}>
            {notFoundModule && <ModuleRenderer modules={[notFoundModule]} />}
          </div>
        </div>
      </div>
      {footerModule && <ModuleRenderer modules={[footerModule]} />}
    </div>
  )
}
