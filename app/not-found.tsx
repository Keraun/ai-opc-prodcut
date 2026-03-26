
'use client'

import Link from 'next/link'
import styles from "./not-found.module.css"
import { Button } from "@/components/ui"
import { registerSiteHeaderModule, HeaderModule } from "@/modules/site-header/register"
import { registerSiteFooterModule, FooterModule } from "@/modules/site-footer/register"

function NotFoundResult() {
  return (
    <div className={styles.resultWrapper}>
      <div className={styles.illustration}>
        <div className={styles.errorCode}>404</div>
      </div>
      <h1 className={styles.title}>页面飞走了</h1>
      <p className={styles.subTitle}>抱歉，您要找的页面不存在或已被移除</p>
      <div className={styles.buttonGroup}>
        <Link href="/">
          <Button variant="primary" size="lg">
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function NotFoundPage() {
  registerSiteHeaderModule()
  registerSiteFooterModule()

  return (
    <div className={styles.container}>
      <HeaderModule moduleName="site-header" moduleId="site-header" moduleInstanceId="site-header" data={{}} />
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.animationWrapper}>
            <NotFoundResult />
          </div>
        </div>
      </div>
      <FooterModule moduleName="site-footer" moduleId="site-footer" moduleInstanceId="site-footer" data={{}} />
    </div>
  )
}
