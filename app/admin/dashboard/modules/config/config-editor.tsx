import { useState, useEffect } from 'react'
import { Modal, Input, Button } from '@arco-design/web-react'
import { toast } from 'sonner'
import { Check as IconCheck, Info as IconInfo, Undo as IconUndo, History as IconHistory } from 'lucide-react'
import { useConfig } from '../../common/hooks/useConfig'
import { useVersion } from '../../common/hooks/useVersion'
import { validateJson, formatJson, stringifyJson, parseJson } from '../../common/utils/json-utils'
import { ConfigCard, JSONViewerWithLineNumbers, JSONDiffViewer } from '../../components'
import styles from './config.module.css'

interface ConfigEditorProps {
  configType: string
  title: string
  description: string
}

export function ConfigEditor({ configType, title, description }: ConfigEditorProps) {
  const { configs, schema, loading, saveConfig, hasChanges } = useConfig()
  const { viewingPreviousVersion, previousVersionData, previousVersionInfo, restoringVersion, viewPreviousVersion, restoreVersion, closeVersionView } = useVersion()
  
  const [editingConfig, setEditingConfig] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [jsonError, setJsonError] = useState("")
  const [showSchema, setShowSchema] = useState(true)
  const [leftWidth, setLeftWidth] = useState(66.67)
  const [isDragging, setIsDragging] = useState(false)
  const [editLeftWidth, setEditLeftWidth] = useState(70)
  const [isEditDragging, setIsEditDragging] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const container = document.getElementById('config-container')
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      if (newLeftWidth >= 30 && newLeftWidth <= 80) {
        setLeftWidth(newLeftWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  useEffect(() => {
    const handleEditMouseMove = (e: MouseEvent) => {
      if (!isEditDragging) return

      const container = document.getElementById('edit-config-container')
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      if (newLeftWidth >= 40 && newLeftWidth <= 80) {
        setEditLeftWidth(newLeftWidth)
      }
    }

    const handleEditMouseUp = () => {
      setIsEditDragging(false)
    }

    if (isEditDragging) {
      document.addEventListener('mousemove', handleEditMouseMove)
      document.addEventListener('mouseup', handleEditMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleEditMouseMove)
      document.removeEventListener('mouseup', handleEditMouseUp)
    }
  }, [isEditDragging])

  const handleEdit = () => {
    setEditingConfig(true)
    setEditValue(stringifyJson(configs[configType as keyof typeof configs]))
    setJsonError("")
  }

  const handleEditValueChange = (value: string) => {
    setEditValue(value)
    const result = validateJson(value)
    setJsonError(result.error || "")
  }

  const handleFormatJson = () => {
    const result = formatJson(editValue)
    if (result.success && result.formatted) {
      setEditValue(result.formatted)
      setJsonError("")
      toast.success("格式化成功")
    } else {
      setJsonError(result.error || "JSON格式错误")
      toast.error("JSON格式错误,无法格式化")
    }
  }

  const handleSaveEdit = () => {
    const result = validateJson(editValue)
    if (!result.valid) {
      toast.error("JSON格式错误,请修正后再提交")
      return
    }

    const parsed = parseJson(editValue)
    if (parsed) {
      setEditingConfig(false)
      setJsonError("")
      toast.success("配置已更新,请点击提交按钮确认更改")
    }
  }

  const handleSave = async () => {
    const success = await saveConfig(configType)
    if (success) {
      closeVersionView()
    }
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleEditMouseDown = () => {
    setIsEditDragging(true)
  }

  const renderSchema = (schemaData: any) => {
    if (!schemaData) return null

    return (
      <div className={styles.schemaCard}>
        <div className={styles.schemaCardTitle}>
          <IconInfo className={styles.schemaCardTitleIcon} />
          <span className={styles.schemaCardTitleText}>字段说明</span>
        </div>
        <div className={styles.schemaContent}>
          {Object.entries(schemaData).map(([key, value]: [string, any]) => (
            <div key={key} className={styles.schemaItem}>
              <div className={styles.schemaItemHeader}>
                <h4 className={styles.schemaItemName}>{key}</h4>
                {value.required && (
                  <span className={`${styles.schemaItemBadge} ${styles.schemaItemBadgeRequired}`}>必填</span>
                )}
                {value.type && (
                  <span className={`${styles.schemaItemBadge} ${styles.schemaItemBadgeType}`}>{value.type}</span>
                )}
              </div>
              <p className={styles.schemaItemDescription}>{value.description}</p>
              {value.fields && (
                <div className={styles.schemaItemFields}>
                  {Object.entries(value.fields).map(([fieldKey, fieldDesc]: [string, any]) => (
                    <div key={fieldKey} className={styles.schemaField}>
                      <span className={styles.schemaFieldName}>{fieldKey}:</span>
                      <span className={styles.schemaFieldDescription}>{fieldDesc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.configEditor}>
      <ConfigCard
        title={title}
        configType={configType}
        description={description}
        configData={configs[configType as keyof typeof configs]}
        schemaData={schema[configType]}
        versionInfo={null}
        loading={loading}
        showSchema={showSchema}
        leftWidth={leftWidth}
        isDragging={isDragging}
        hasChanges={hasChanges(configType)}
        onView={() => {}}
        onEdit={handleEdit}
        onSave={handleSave}
        onViewPreviousVersion={() => viewPreviousVersion(configType)}
        onToggleSchema={() => setShowSchema(!showSchema)}
        onMouseDown={handleMouseDown}
        renderSchema={() => renderSchema(schema[configType])}
      />

      {editingConfig && (
        <Modal
          title={`编辑配置 - ${title}`}
          visible={editingConfig}
          onCancel={() => setEditingConfig(false)}
          footer={null}
          style={{ top: 20 }}
        >
          <div className={styles.editConfigContainer} id="edit-config-container">
            <div className={styles.editConfigLeft} style={{ width: `${editLeftWidth}%` }}>
              <div className={styles.editConfigHeader}>
                <div className={styles.editConfigHeaderTop}>
                  <div className={styles.editConfigHeaderLeft}>
                    <span className={styles.editConfigHint}>编辑 JSON 配置</span>
                  </div>
                  <div className={styles.editConfigHeaderRight}>
                    <Button size="small" onClick={handleFormatJson}>
                      格式化
                    </Button>
                  </div>
                </div>
                <Input.TextArea
                  value={editValue}
                  onChange={handleEditValueChange}
                  className={styles.jsonTextarea}
                  autoSize={{ minRows: 20, maxRows: 30 }}
                />
                {jsonError && (
                  <div className={styles.jsonError}>{jsonError}</div>
                )}
                <div className={styles.editConfigActionsBottom}>
                  <Button
                    type="primary"
                    onClick={handleSaveEdit}
                    disabled={!!jsonError}
                  >
                    保存更改
                  </Button>
                  <Button onClick={() => setEditingConfig(false)}>
                    取消
                  </Button>
                </div>
              </div>
            </div>
            <div className={styles.configResizer} onMouseDown={handleEditMouseDown}>
              <div className={styles.configResizerHandle} />
              <div className={styles.configResizerVisual} />
            </div>
            <div className={styles.editConfigRight} style={{ width: `${100 - editLeftWidth}%` }}>
              <div className={styles.viewConfigHeader}>
                <div className={styles.viewConfigHeaderTop}>
                  <div className={styles.viewConfigTitle}>
                    <span className={styles.viewConfigHint}>预览</span>
                  </div>
                </div>
                <JSONViewerWithLineNumbers content={editValue} />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {viewingPreviousVersion === configType && previousVersionData && (
        <Modal
          title={`历史版本 - ${title}`}
          visible={true}
          onCancel={closeVersionView}
          footer={null}
          style={{ top: 20 }}
        >
          <div className={styles.versionInfo}>
            <p><strong>版本:</strong> {previousVersionInfo?.version}</p>
            <p><strong>时间:</strong> {previousVersionInfo?.timestamp}</p>
            <p><strong>作者:</strong> {previousVersionInfo?.author}</p>
          </div>
          <div className={styles.diffToggle}>
            <Button
              type={showDiff ? 'primary' : 'default'}
              onClick={() => setShowDiff(!showDiff)}
            >
              {showDiff ? '显示对比' : '显示差异'}
            </Button>
          </div>
          {showDiff ? (
            <JSONDiffViewer
              oldContent={stringifyJson(previousVersionData)}
              newContent={stringifyJson(configs[configType as keyof typeof configs])}
            />
          ) : (
            <div className={styles.diffContainer}>
              <div>
                <div className={styles.diffTitle}>历史版本</div>
                <JSONViewerWithLineNumbers content={stringifyJson(previousVersionData)} />
              </div>
              <div>
                <div className={styles.diffTitle}>当前版本</div>
                <JSONViewerWithLineNumbers content={stringifyJson(configs[configType as keyof typeof configs])} />
              </div>
            </div>
          )}
          <div className={styles.versionActions}>
            <Button
              type="primary"
              status="danger"
              onClick={() => restoreVersion(configType)}
              loading={restoringVersion}
            >
              还原到此版本
            </Button>
            <Button onClick={closeVersionView}>
              关闭
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
