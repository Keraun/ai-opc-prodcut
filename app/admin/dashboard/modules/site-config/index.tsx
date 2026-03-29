import { useState, useEffect } from 'react'
import { Button, Card, Modal } from '@arco-design/web-react'
import { IconSave, IconSync, IconInfoCircle } from '@arco-design/web-react/icon'
import { toast } from 'sonner'
import { getSiteRootConfig, saveSiteRootConfig, syncSiteRootToPages } from '@/lib/api-client'
import { ManagementHeader } from '../../components/ManagementHeader'
import { ModuleFieldEditor } from '../../components/module-editor/ModuleFieldEditor'
import styles from './site-config.module.css'

export function SiteConfigManager() {
  const [configData, setConfigData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSyncConfirm, setShowSyncConfirm] = useState(false)

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

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await syncSiteRootToPages(configData)
      
      if (result.success) {
        toast.success(result.message || '同步成功')
        if (result.syncedPages && result.syncedPages.length > 0) {
          console.log('已同步到页面:', result.syncedPages.join(', '))
        }
      } else {
        toast.error(result.message || '同步失败')
      }
    } catch (error) {
      console.error('同步站点配置失败:', error)
      toast.error('同步失败')
    } finally {
      setSyncing(false)
      setShowSyncConfirm(false)
    }
  }

  const renderActions = () => (
    <>
      <Button
        icon={<IconSync />}
        loading={syncing}
        onClick={() => setShowSyncConfirm(true)}
      >
        同步到所有页面
      </Button>
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

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconInfoCircle style={{ color: '#ff7d00' }} />
            <span>确认同步</span>
          </div>
        }
        visible={showSyncConfirm}
        onCancel={() => setShowSyncConfirm(false)}
        onOk={handleSync}
        confirmLoading={syncing}
        okText="确认同步"
        cancelText="取消"
      >
        <div style={{ lineHeight: 1.8 }}>
          <p>此操作将把当前站点配置同步到所有页面的站点容器模块。</p>
          <p style={{ color: '#86909c', fontSize: 13 }}>
            这将覆盖所有页面中 site-root 模块的 data 数据，确保所有页面使用统一的站点配置。
          </p>
        </div>
      </Modal>
    </div>
  )
}
