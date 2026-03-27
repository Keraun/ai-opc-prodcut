"use client"

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
  const previewUrl = `/admin/page-preview/${pageId}`

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
