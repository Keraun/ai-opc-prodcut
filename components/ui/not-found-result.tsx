'use client'

import Link from 'next/link'
import { Button } from './button'
import styles from './not-found-result.module.css'

export function NotFoundResult() {
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
