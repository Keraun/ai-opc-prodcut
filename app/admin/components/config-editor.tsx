import { useState, useEffect } from 'react'
import { Button, Input, Alert } from '@arco-design/web-react'
import { IconSave, IconUndo } from '@arco-design/web-react/icon'
import { toast } from 'sonner'
import { JSONViewer } from './json-viewer'
import { useSaveConfig } from '../hooks/use-save-config'
import styles from '../dashboard/dashboard.module.css'

interface ConfigEditorProps {
  configKey: string
  configName: string
  initialData: any
  onSave?: () => void
}

export function ConfigEditor({ 
  configKey, 
  configName, 
  initialData,
  onSave 
}: ConfigEditorProps) {
  const [editData, setEditData] = useState('')
  const [originalData, setOriginalData] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { saveConfig, saving } = useSaveConfig()

  useEffect(() => {
    const dataStr = JSON.stringify(initialData, null, 2)
    setEditData(dataStr)
    setOriginalData(dataStr)
    setError(null)
  }, [initialData])

  const handleSave = async () => {
    try {
      const parsedData = JSON.parse(editData)
      const success = await saveConfig(configKey, parsedData)
      
      if (success) {
        setOriginalData(editData)
        onSave?.()
      }
    } catch (err) {
      setError('JSON 格式错误，请检查语法')
      toast.error('JSON 格式错误，请检查语法')
    }
  }

  const handleReset = () => {
    setEditData(originalData)
    setError(null)
    toast.success('已恢复到上次保存的版本')
  }

  const hasChanges = editData !== originalData

  return (
    <div className={styles.configEditor}>
      <div className={styles.editorHeader}>
        <h3>{configName}</h3>
        <div className={styles.editorActions}>
          <Button
            type="primary"
            icon={<IconSave />}
            loading={saving}
            disabled={!hasChanges}
            onClick={handleSave}
          >
            保存
          </Button>
          <Button
            icon={<IconUndo />}
            disabled={!hasChanges}
            onClick={handleReset}
          >
            重置
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" content={error} closable onClose={() => setError(null)} />
      )}

      <div className={styles.editorContent}>
        <Input.TextArea
          value={editData}
          onChange={setEditData}
          placeholder="请输入 JSON 配置"
          autoSize={{ minRows: 20, maxRows: 40 }}
          className={styles.jsonTextarea}
        />
      </div>

      {hasChanges && (
        <div className={styles.changeIndicator}>
          <Alert type="warning" content="配置已修改，请保存更改" />
        </div>
      )}
    </div>
  )
}
