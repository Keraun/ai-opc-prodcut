"use client"

import { useRouter } from 'next/navigation'
import { Button, Result } from '@arco-design/web-react'
import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import styles from "./not-found.module.css"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.animationWrapper}>
            <Result
              status="404"
              title="页面不存在"
              subTitle="抱歉，您访问的页面不存在或已被移除"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
