import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Tabs, Tooltip } from '@arco-design/web-react'
import { IconSave, IconRefresh, IconDesktop, IconMobile, IconApps, IconFullscreen, IconFullscreenExit } from '@arco-design/web-react/icon'
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

const tabConfigMap = {
  'site-root': { name: '站点配置', saveFunc: saveSiteRootConfig },
  'site-header': { name: '站点导航', saveFunc: saveSiteHeaderConfig },
  'site-footer': { name: '页脚配置', saveFunc: saveSiteFooterConfig }
}

export function SiteConfigManager() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('site-root')
  const [siteRootData, setSiteRootData] = useState<Record<string, unknown>>({})
  const [siteFooterData, setSiteFooterData] = useState<Record<string, unknown>>({})
  const [siteHeaderData, setSiteHeaderData] = useState<Record<string, unknown>>({})
  const [originalSiteRootData, setOriginalSiteRootData] = useState<Record<string, unknown>>({})
  const [originalSiteFooterData, setOriginalSiteFooterData] = useState<Record<string, unknown>>({})
  const [originalSiteHeaderData, setOriginalSiteHeaderData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'web' | 'mobile' | 'ipad'>('ipad')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const previewIframeRef = useRef<HTMLIFrameElement>(null)
  const previewPanelRef = useRef<HTMLDivElement>(null)

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
      setOriginalSiteRootData(JSON.parse(JSON.stringify(rootConfig)))
      setOriginalSiteFooterData(JSON.parse(JSON.stringify(footerConfig)))
      setOriginalSiteHeaderData(JSON.parse(JSON.stringify(headerConfig)))
    } catch (error) {
      console.error('获取配置失败:', error)
      toast.error('获取配置失败')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentData = useCallback(() => {
    switch (activeTab) {
      case 'site-root':
        return siteRootData
      case 'site-header':
        return siteHeaderData
      case 'site-footer':
        return siteFooterData
      default:
        return {}
    }
  }, [activeTab, siteRootData, siteHeaderData, siteFooterData])

  const getOriginalData = useCallback(() => {
    switch (activeTab) {
      case 'site-root':
        return originalSiteRootData
      case 'site-header':
        return originalSiteHeaderData
      case 'site-footer':
        return originalSiteFooterData
      default:
        return {}
    }
  }, [activeTab, originalSiteRootData, originalSiteHeaderData, originalSiteFooterData])

  const hasChanges = useCallback((): boolean => {
    return JSON.stringify(getCurrentData()) !== JSON.stringify(getOriginalData())
  }, [getCurrentData, getOriginalData])

  const sendPreviewData = useCallback((data: Record<string, unknown>) => {
    if (previewIframeRef.current && previewIframeRef.current.contentWindow) {
      previewIframeRef.current.contentWindow.postMessage({
        type: 'MODULE_PREVIEW_DATA',
        data: data
      }, '*')
    }
  }, [])

  const handleSiteRootChange = (data: Record<string, unknown>) => {
    setSiteRootData(data)
    sendPreviewData(data)
  }

  const handleSiteFooterChange = (data: Record<string, unknown>) => {
    setSiteFooterData(data)
    sendPreviewData(data)
  }

  const handleSiteHeaderChange = (data: Record<string, unknown>) => {
    setSiteHeaderData(data)
    sendPreviewData(data)
  }

  const handlePreviewMessage = useCallback((event: MessageEvent) => {
    if (event.data && event.data.type === 'MODULE_PREVIEW_READY') {
      sendPreviewData(getCurrentData())
    }
  }, [getCurrentData, sendPreviewData])

  useEffect(() => {
    window.addEventListener('message', handlePreviewMessage)
    return () => {
      window.removeEventListener('message', handlePreviewMessage)
    }
  }, [handlePreviewMessage])

  useEffect(() => {
    if (previewIframeRef.current && previewIframeRef.current.contentWindow) {
      sendPreviewData(getCurrentData())
    }
  }, [activeTab, getCurrentData, sendPreviewData])

  const handleSaveCurrentTab = async () => {
    if (!hasChanges()) {
      toast.info('没有需要保存的更改')
      return
    }

    setSaving(true)
    try {
      const config = tabConfigMap[activeTab]
      const result = await config.saveFunc(getCurrentData())
      
      if (result.success) {
        toast.success(`${config.name}保存成功`)
        switch (activeTab) {
          case 'site-root':
            setOriginalSiteRootData(JSON.parse(JSON.stringify(siteRootData)))
            break
          case 'site-header':
            setOriginalSiteHeaderData(JSON.parse(JSON.stringify(siteHeaderData)))
            break
          case 'site-footer':
            setOriginalSiteFooterData(JSON.parse(JSON.stringify(siteFooterData)))
            break
        }
      } else {
        toast.error(result.message || '保存失败')
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      toast.error('配置保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleResetCurrentTab = () => {
    if (!hasChanges()) {
      toast.info('没有需要重置的更改')
      return
    }

    switch (activeTab) {
      case 'site-root':
        setSiteRootData(JSON.parse(JSON.stringify(originalSiteRootData)))
        sendPreviewData(originalSiteRootData)
        break
      case 'site-header':
        setSiteHeaderData(JSON.parse(JSON.stringify(originalSiteHeaderData)))
        sendPreviewData(originalSiteHeaderData)
        break
      case 'site-footer':
        setSiteFooterData(JSON.parse(JSON.stringify(originalSiteFooterData)))
        sendPreviewData(originalSiteFooterData)
        break
    }
    toast.success('已重置为上次保存的配置')
  }

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && previewPanelRef.current) {
        await previewPanelRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('全屏切换失败:', error)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const renderActions = () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button
        icon={<IconRefresh />}
        disabled={!hasChanges()}
        onClick={handleResetCurrentTab}
      >
        重置
      </Button>
      <Button
        type="primary"
        icon={<IconSave />}
        loading={saving}
        disabled={!hasChanges()}
        onClick={handleSaveCurrentTab}
      >
        保存{tabConfigMap[activeTab].name}
      </Button>
    </div>
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

      <div className={styles.configLayout}>
        <div className={`${styles.configEditorPanel} ${activeTab === 'site-root' ? styles.editorFullWidth : ''}`}>
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

        {activeTab !== 'site-root' && (
          <div 
            ref={previewPanelRef}
            className={`${styles.configPreviewPanel} ${isFullscreen ? styles.fullscreenPreview : ''}`}
          >
            <div className={styles.previewHeader}>
              <h4>实时预览</h4>
              <div className={styles.previewControls}>
                <div className={styles.previewDevices}>
                  <Tooltip content="桌面端">
                    <Button 
                      size="mini" 
                      type={previewDevice === 'web' ? "primary" : "text"}
                      icon={<IconDesktop />}
                      onClick={() => setPreviewDevice('web')}
                    />
                  </Tooltip>
                  <Tooltip content="平板端">
                    <Button 
                      size="mini" 
                      type={previewDevice === 'ipad' ? "primary" : "text"}
                      icon={<IconApps />}
                      onClick={() => setPreviewDevice('ipad')}
                    />
                  </Tooltip>
                  <Tooltip content="移动端">
                    <Button 
                      size="mini" 
                      type={previewDevice === 'mobile' ? "primary" : "text"}
                      icon={<IconMobile />}
                      onClick={() => setPreviewDevice('mobile')}
                    />
                  </Tooltip>
                </div>
                <Tooltip content={isFullscreen ? "退出全屏" : "全屏查看"}>
                  <Button 
                    size="mini"
                    type="text"
                    icon={isFullscreen ? <IconFullscreenExit /> : <IconFullscreen />}
                    onClick={toggleFullscreen}
                  />
                </Tooltip>
              </div>
            </div>
            <div className={styles.previewContent}>
              <div 
                className={styles.previewFrame}
                style={{
                  width: previewDevice === 'web' ? '100%' : previewDevice === 'mobile' ? '375px' : '768px'
                }}
              >
                <iframe
                  ref={previewIframeRef}
                  src={`/admin/module-preview/${activeTab}`}
                  className={styles.previewIframe}
                  title={`${tabConfigMap[activeTab].name} 预览`}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
