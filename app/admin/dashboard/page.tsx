"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Tabs, Modal, Alert } from "@arco-design/web-react"
import { 
  IconSave, 
  IconExport, 
  IconEdit, 
  IconLock, 
  IconCheck, 
  IconInfoCircle,
  IconHistory,
  IconUndo,
  IconHome,
  IconSettings,
  IconUser,
  IconNav,
  IconFile,
  IconStorage,
  IconCode,
  IconTrophy,
  IconClockCircle
} from "@arco-design/web-react/icon"
import { toast, Toaster } from "sonner"
import { AdminLayout, ConfigEditor, VersionHistory } from '../components'
import { useConfigs } from '../hooks'
import { ConfigType } from '../types'
import styles from './dashboard.module.css'

const TabPane = Tabs.TabPane

const CONFIG_TYPES: ConfigType[] = [
  { key: 'site', name: '站点配置', icon: 'IconHome', description: '网站基本信息配置' },
  { key: 'common', name: '通用配置', icon: 'IconSettings', description: '网站通用配置' },
  { key: 'seo', name: 'SEO配置', icon: 'IconTrophy', description: '搜索引擎优化配置' },
  { key: 'navigation', name: '导航配置', icon: 'IconNav', description: '网站导航菜单配置' },
  { key: 'footer', name: '底部配置', icon: 'IconFile', description: '网站底部信息配置' },
  { key: 'theme', name: '主题配置', icon: 'IconCode', description: '网站主题样式配置' },
  { key: 'homeBanner', name: 'Banner配置', icon: 'IconStorage', description: '首页Banner配置' },
  { key: 'homeProducts', name: '产品配置', icon: 'IconStorage', description: '首页产品展示配置' },
  { key: 'homeServices', name: '服务配置', icon: 'IconStorage', description: '首页服务展示配置' },
  { key: 'homePricing', name: '价格配置', icon: 'IconStorage', description: '首页价格展示配置' },
  { key: 'homeAbout', name: '关于我们', icon: 'IconUser', description: '关于我们配置' },
  { key: 'homeContact', name: '联系我们', icon: 'IconStorage', description: '联系我们配置' },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const { configs, loading, error, refetch } = useConfigs()
  const [activeTab, setActiveTab] = useState('site')
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth')
        if (!response.ok) {
          router.push('/admin')
        }
      } catch (error) {
        router.push('/admin')
      }
    }
    checkAuth()
  }, [router])

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/config/export')
      if (!response.ok) {
        throw new Error('导出失败')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `config-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('配置导出成功')
      setShowExportModal(false)
    } catch (error) {
      toast.error('配置导出失败')
    }
  }

  const handleImport = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/admin/config/import', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('导入失败')
      }
      
      toast.success('配置导入成功')
      refetch()
    } catch (error) {
      toast.error('配置导入失败')
    }
  }

  if (loading) {
    return (
      <AdminLayout title="控制台">
        <div className={styles.loading}>加载中...</div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="控制台">
        <Alert type="error" content={error} />
      </AdminLayout>
    )
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      
      <AdminLayout title="控制台">
        <div className={styles.dashboard}>
          <div className={styles.dashboardHeader}>
            <div className={styles.headerActions}>
              <Button
                type="primary"
                icon={<IconExport />}
                onClick={() => setShowExportModal(true)}
              >
                导出配置
              </Button>
              <Button
                icon={<IconHistory />}
                onClick={() => {}}
              >
                导入配置
              </Button>
            </div>
          </div>

          <Card className={styles.configCard}>
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              tabPosition="left"
              className={styles.configTabs}
            >
              {CONFIG_TYPES.map(config => (
                <TabPane
                  key={config.key}
                  title={
                    <span className={styles.tabTitle}>
                      <span>{config.name}</span>
                    </span>
                  }
                >
                  <div className={styles.configContent}>
                    <div className={styles.configHeader}>
                      <h3>{config.name}</h3>
                      <p className={styles.configDescription}>{config.description}</p>
                      <VersionHistory
                        configKey={config.key}
                        currentData={configs[config.key as keyof typeof configs]}
                        onRestore={refetch}
                      />
                    </div>
                    
                    <ConfigEditor
                      configKey={config.key}
                      configName={config.name}
                      initialData={configs[config.key as keyof typeof configs]}
                      onSave={refetch}
                    />
                  </div>
                </TabPane>
              ))}
            </Tabs>
          </Card>
        </div>
      </AdminLayout>

      <Modal
        title="导出配置"
        visible={showExportModal}
        onCancel={() => setShowExportModal(false)}
        onOk={handleExport}
        okText="确认导出"
        cancelText="取消"
      >
        <p>确定要导出当前所有配置吗？</p>
        <Alert
          type="info"
          content="导出的配置文件将包含所有运行时配置，可用于备份或迁移。"
        />
      </Modal>
    </>
  )
}
