import { useState, useEffect } from 'react'
import { Button, Tabs } from '@arco-design/web-react'
import { IconSave } from '@arco-design/web-react/icon'
import { toast } from 'sonner'
import {
  getSiteRootConfig,
  saveSiteRootConfig,
  getSiteFooterConfig,
  saveSiteFooterConfig,
  getSiteHeaderConfig,
  saveSiteHeaderConfig
} from '@/lib/api-client'
import { ManagementHeader } from '../../components/ManagementHeader'
import { ModuleFieldEditor } from '../../components/module-editor/ModuleFieldEditor'
import styles from './site-config.module.css'

const TabPane = Tabs.TabPane

type ConfigTab = 'site-root' | 'site-header' | 'site-footer'

export function SiteConfigManager() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('site-root')
  const [siteRootData, setSiteRootData] = useState<Record<string, unknown>>({})
  const [siteFooterData, setSiteFooterData] = useState<Record<string, unknown>>({})
  const [siteHeaderData, setSiteHeaderData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasSiteRootChanges, setHasSiteRootChanges] = useState(false)
  const [hasSiteFooterChanges, setHasSiteFooterChanges] = useState(false)
  const [hasSiteHeaderChanges, setHasSiteHeaderChanges] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rootConfig, footerConfig, headerConfig] = await Promise.all([
        getSiteRootConfig(),
        getSiteFooterConfig(),
        getSiteHeaderConfig()
      ])
      setSiteRootData(rootConfig)
      setSiteFooterData(footerConfig)
      setSiteHeaderData(headerConfig)
      setHasSiteRootChanges(false)
      setHasSiteFooterChanges(false)
      setHasSiteHeaderChanges(false)
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

  const handleSiteHeaderChange = (data: Record<string, unknown>) => {
    setSiteHeaderData(data)
    setHasSiteHeaderChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const savePromises: Promise<{ success: boolean; message?: string }>[] = []
      
      if (hasSiteRootChanges) {
        savePromises.push(saveSiteRootConfig(siteRootData))
      }
      if (hasSiteFooterChanges) {
        savePromises.push(saveSiteFooterConfig(siteFooterData))
      }
      if (hasSiteHeaderChanges) {
        savePromises.push(saveSiteHeaderConfig(siteHeaderData))
      }
      
      if (savePromises.length === 0) {
        toast.info('没有需要保存的更改')
        return
      }
      
      const results = await Promise.all(savePromises)
      const allSuccess = results.every(r => r.success)
      
      if (allSuccess) {
        const savedItems = []
        if (hasSiteRootChanges) savedItems.push('站点配置')
        if (hasSiteHeaderChanges) savedItems.push('站点导航')
        if (hasSiteFooterChanges) savedItems.push('页脚配置')
        toast.success(`${savedItems.join('、')}保存成功`)
        setHasSiteRootChanges(false)
        setHasSiteFooterChanges(false)
        setHasSiteHeaderChanges(false)
      } else {
        const failedMessages = results.filter(r => !r.success).map(r => r.message).join('；')
        toast.error(failedMessages || '部分配置保存失败')
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      toast.error('配置保存失败')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = hasSiteRootChanges || hasSiteFooterChanges || hasSiteHeaderChanges

  const renderActions = () => (
    <Button
      type="primary"
      icon={<IconSave />}
      loading={saving}
      disabled={!hasChanges}
      onClick={handleSave}
    >
      保存配置
    </Button>
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
        description="管理网站的全局配置，包括站点配置、站点导航和页脚配置。配置保存后将全局生效，所有页面自动使用最新配置。"
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
        <TabPane key="site-header" title="站点导航">
          <div className={styles.tabContent}>
            <ModuleFieldEditor
              moduleId="site-header"
              data={siteHeaderData}
              onChange={handleSiteHeaderChange}
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
    </div>
  )
}
