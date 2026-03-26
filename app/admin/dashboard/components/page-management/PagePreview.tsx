"use client"

import { useEffect, useState } from "react"
import { Message, Spin } from "@arco-design/web-react"
import styles from "../../dashboard.module.css"

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
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generatePreview()
  }, [pageId, modules])

  const generatePreview = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modules }),
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewHtml(data.html || '')
      } else {
        Message.error("生成预览失败")
      }
    } catch (error) {
      Message.error("生成预览失败")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.pagePreview}>
        <div className={styles.previewLoading}>
          <Spin size={40} />
          <p style={{ marginTop: 16, color: "#6b7280" }}>正在生成预览...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pagePreview}>
      <div className={styles.previewContainer}>
        <iframe
          srcDoc={previewHtml}
          className={styles.previewFrame}
          title="页面预览"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  )
}