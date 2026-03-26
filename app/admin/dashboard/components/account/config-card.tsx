"use client"

import { Button, Card } from "@arco-design/web-react"
import { IconSave, IconEdit, IconHistory, IconEye, IconInfoCircle } from "@arco-design/web-react/icon"
import styles from "../../dashboard.module.css"

interface ConfigCardProps {
  title: string
  configType: string
  description: string
  configData: any
  schemaData: any
  versionInfo: any
  loading: boolean
  showSchema: boolean
  leftWidth: number
  isDragging: boolean
  hasChanges: boolean
  onView: () => void
  onEdit: () => void
  onSave: () => void
  onViewPreviousVersion: () => void
  onToggleSchema: () => void
  onMouseDown: () => void
  renderSchema: () => JSX.Element | null
}

export function ConfigCard({
  title,
  configType,
  description,
  configData,
  schemaData,
  versionInfo,
  loading,
  showSchema,
  leftWidth,
  isDragging,
  hasChanges,
  onView,
  onEdit,
  onSave,
  onViewPreviousVersion,
  onToggleSchema,
  onMouseDown,
  renderSchema
}: ConfigCardProps) {
  return (
    <div id="config-container" className={styles.configContainer}>
      <div style={{ width: showSchema ? `${leftWidth}%` : '100%' }} className={styles.configLeft}>
        <Card
          style={{ height: 'calc(100vh - 64px - 64px)' }}
          title={
            <div className={styles.configCardTitle}>
              <span className={styles.configCardTitleText}>{title}</span>
              <div className={styles.configCardActions}>
                <Button
                  size="small"
                  type="text"
                  icon={<IconInfoCircle />}
                  onClick={onToggleSchema}
                >
                  {showSchema ? '隐藏说明' : '显示说明'}
                </Button>
                <Button
                  size="small"
                  icon={<IconHistory />}
                  onClick={onViewPreviousVersion}
                >
                  上一版本
                </Button>
                <Button
                  size="small"
                  icon={<IconEye />}
                  onClick={onView}
                >
                  查看
                </Button>
                <Button
                  size="small"
                  icon={<IconEdit />}
                  onClick={onEdit}
                >
                  编辑
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<IconSave />}
                  loading={loading}
                  onClick={onSave}
                  disabled={!hasChanges}
                >
                  提交
                </Button>
              </div>
            </div>
          }
        >
          <div className={styles.configCardBody}>
            <p className={styles.configCardBodyDescription}>{description}</p>
            {versionInfo && (
              <p className={styles.configCardBodyVersion}>
                最后更新时间:{new Date(versionInfo.createdAt).toLocaleString('zh-CN')}
              </p>
            )}
          </div>
          <pre className={styles.configCardBodyPreview}>
            {JSON.stringify(configData, null, 2)}
          </pre>
        </Card>
      </div>

      {showSchema && (
        <>
          <div
            className={`${styles.configResizer} ${isDragging ? styles.configResizerDragging : ''}`}
            onMouseDown={onMouseDown}
          >
            <div className={styles.configResizerHandle} />
            <div className={styles.configResizerVisual} />
          </div>

          <div style={{ width: `${100 - leftWidth}%` }} className={styles.configRight}>
            {renderSchema()}
          </div>
        </>
      )}
    </div>
  )
}
