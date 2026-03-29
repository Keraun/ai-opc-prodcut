import { useState, useEffect } from 'react'
import { Button, Card, Modal, Tabs, Checkbox } from '@arco-design/web-react'
import { IconSave, IconSync, IconInfoCircle } from '@arco-design/web-react/icon'
import { toast } from 'sonner'
import {
  getSiteRootConfig,
  saveSiteRootConfig,
  getSiteFooterConfig,
  saveSiteFooterConfig,
  syncGlobalConfig
} from '@/lib/api-client'
import { ManagementHeader } from '../../components/ManagementHeader'
import { ModuleFieldEditor } from '../../components/module-editor/ModuleFieldEditor'
import styles from './site-config.module.css'

const TabPane = Tabs.TabPane

type ConfigTab = 'site-root' | 'site-footer'

export function SiteConfigManager() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('site-root')
  const [siteRootData, setSiteRootData] = useState<Record<string, unknown>>({})
  const [siteFooterData, setSiteFooterData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [hasSiteRootChanges, setHasSiteRootChanges] = useState(false)
  const [hasSiteFooterChanges, setHasSiteFooterChanges] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncOptions, setSyncOptions] = useState({
    siteRoot: true,
    siteFooter: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rootConfig, footerConfig] = await Promise.all([
        getSiteRootConfig(),
        getSiteFooterConfig()
      ])
      setSiteRootData(rootConfig)
      setSiteFooterData(footerConfig)
      setHasSiteRootChanges(false)
      setHasSiteFooterChanges(false)
    } catch (error) {
      console.error('获取配置失败:', error)
      toast.error('获取配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSiteRootChange = (data: Record<string, unknown>) => {
    setSiteRootData(data)
    setHasSiteRootChanges(true)
  }

  const handleSiteFooterChange = (data: Record<string, unknown>) => {
    setSiteFooterData(data)
    setHasSiteFooterChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeTab === 'site-root') {
        const result = await saveSiteRootConfig(siteRootData)
        if (result.success) {
          toast.success('站点配置保存成功')
          setHasSiteRootChanges(false)
        } else {
          toast.error(result.message || '配置保存失败')
        }
      } else {
        const result = await saveSiteFooterConfig(siteFooterData)
        if (result.success) {
          toast.success('页脚配置保存成功')
          setHasSiteFooterChanges(false)
        } else {
          toast.error(result.message || '配置保存失败')
        }
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      toast.error('配置保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleSync = async () => {
    if (!syncOptions.siteRoot && !syncOptions.siteFooter) {
      toast.error('请至少选择一项配置进行同步')
      return
    }

    setSyncing(true)
    try {
      const result = await syncGlobalConfig({
        siteRootData: syncOptions.siteRoot ? siteRootData : undefined,
        siteFooterData: syncOptions.siteFooter ? siteFooterData : undefined
      })

      if (result.success) {
        toast.success(result.message || '同步成功')
      } else {
        toast.error(result.message || '同步失败')
      }
    } catch (error) {
      console.error('同步配置失败:', error)
      toast.error('同步失败')
    } finally {
      setSyncing(false)
      setShowSyncModal(false)
    }
  }

  const hasChanges = activeTab === 'site-root' ? hasSiteRootChanges : hasSiteFooterChanges

  const renderActions = () => (
    <>
      <Button
        icon={<IconSync />}
        onClick={() => {
          setSyncOptions({ siteRoot: true, siteFooter: true })
          setShowSyncModal(true)
        }}
      >
        同步到所有页面
      </Button>
      <Button
        type="primary"
        icon={<IconSave />}
        loading={saving}
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
        <div className={styles.loadingText}>加载配置中...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ManagementHeader
        title="全局配置"
        description="管理网站的全局配置，包括站点配置和页脚配置。保存后将同步更新相关数据。"
        actions={renderActions()}
      />

      <Tabs
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as ConfigTab)}
        type="card-gutter"
      >
        <TabPane key="site-root" title="站点配置">
          <div className={styles.tabContent}>
            <ModuleFieldEditor
              moduleId="site-root"
              data={siteRootData}
              onChange={handleSiteRootChange}
            />
          </div>
        </TabPane>
        <TabPane key="site-footer" title="页脚配置">
          <div className={styles.tabContent}>
            <ModuleFieldEditor
              moduleId="site-footer"
              data={siteFooterData}
              onChange={handleSiteFooterChange}
            />
          </div>
        </TabPane>
      </Tabs>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconInfoCircle style={{ color: '#ff7d00' }} />
            <span>同步配置到所有页面</span>
          </div>
        }
        visible={showSyncModal}
        onCancel={() => setShowSyncModal(false)}
        onOk={handleSync}
        confirmLoading={syncing}
        okText="确认同步"
        cancelText="取消"
      >
        <div style={{ lineHeight: 1.8 }}>
          <p style={{ marginBottom: 16 }}>请选择要同步的配置项：</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Checkbox
              checked={syncOptions.siteRoot}
              onChange={(checked) => setSyncOptions(prev => ({ ...prev, siteRoot: checked }))}
            >
              <span style={{ fontWeight: 500 }}>站点配置</span>
              <span style={{ color: '#86909c', fontSize: 12, marginLeft: 8 }}>
                同步到所有页面的站点容器模块
              </span>
            </Checkbox>
            <Checkbox
              checked={syncOptions.siteFooter}
              onChange={(checked) => setSyncOptions(prev => ({ ...prev, siteFooter: checked }))}
            >
              <span style={{ fontWeight: 500 }}>页脚配置</span>
              <span style={{ color: '#86909c', fontSize: 12, marginLeft: 8 }}>
                同步到所有页面的页脚模块
              </span>
            </Checkbox>
          </div>
          <p style={{ color: '#86909c', fontSize: 13, marginTop: 16 }}>
            这将覆盖所有页面中对应模块的 data 数据，确保所有页面使用统一的配置。
          </p>
        </div>
      </Modal>
    </div>
  )
}
