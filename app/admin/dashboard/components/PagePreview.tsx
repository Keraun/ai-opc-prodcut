"use client"

import { useEffect, useState } from "react"
import { Message } from "@arco-design/web-react"
import styles from "../dashboard.module.css"

interface ModuleInfo {
  moduleId: string
  moduleName: string
  moduleInstanceId: string
  data: Record<string, unknown>
}

interface PagePreviewProps {
  pageId: string
  modules: ModuleInfo[]
}

export function PagePreview({ pageId, modules }: PagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPreviewData()
  }, [pageId, modules])

  const fetchPreviewData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`)
      if (response.ok) {
        const data = await response.json()
        setPreviewUrl(`/${data.slug}?preview=true`)
      }
    } catch (error) {
      Message.error("获取预览数据失败")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.pagePreview}>
        <div className={styles.loading}>加载预览...</div>
      </div>
    )
  }

  return (
    <div className={styles.pagePreview}>
      <div className={styles.previewContainer}>
        <iframe
          src={previewUrl}
          className={styles.previewFrame}
          title="页面预览"
        />
      </div>
    </div>
  )
}
