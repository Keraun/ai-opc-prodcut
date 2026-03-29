import { useState, useEffect } from 'react'
import { Button, Card } from '@arco-design/web-react'
import { IconSave, IconCode } from '@arco-design/web-react/icon'
import { toast } from 'sonner'
import { getSiteRootConfig, saveSiteRootConfig } from '@/lib/api-client'
import { ManagementHeader } from '../../components/ManagementHeader'
import { ModuleFieldEditor } from '../../components/module-editor/ModuleFieldEditor'
import styles from './site-config.module.css'

export function SiteConfigManager() {
  const [configData, setConfigData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const configResult = await getSiteRootConfig()
      setConfigData(configResult)
      setHasChanges(false)
    } catch (error) {
      console.error('获取站点配置失败:', error)
      toast.error('获取站点配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDataChange = (data: Record<string, unknown>) => {
    setConfigData(data)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      const result = await saveSiteRootConfig(configData)
      
      if (result.success) {
        toast.success('站点配置保存成功')
        setHasChanges(false)
      } else {
        toast.error(result.message || '配置保存失败')
      }
    } catch (error) {
      console.error('保存站点配置失败:', error)
      toast.error('配置保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const renderActions = () => (
    <>
      <Button
        type="primary"
        icon={<IconSave />}
        loading={submitting}
        disabled={!hasChanges}
        onClick={handleSave}
      >
        保存配置
      </Button>
    </>
  )

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>加载站点配置中...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ManagementHeader
        title="站点配置"
        description="管理网站的全局配置，包括基本信息、联系方式、SEO设置等。保存后将同步更新站点数据和页脚信息。"
        actions={renderActions()}
      />

      <Card className={styles.formCard}>
        <ModuleFieldEditor
          moduleId="site-root"
          data={configData}
          onChange={handleDataChange}
        />
      </Card>
    </div>
  )
}
