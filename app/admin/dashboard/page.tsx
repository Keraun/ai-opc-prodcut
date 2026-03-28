"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Modal, Input, Alert } from "@arco-design/web-react"
import { IconCheck, IconInfoCircle, IconUndo, IconHistory } from "@arco-design/web-react/icon"
import { toast, Toaster } from "sonner"
import { useTheme } from "@/components/theme-provider"
import styles from "./dashboard.module.css"
import {
  checkAuthStatus,
  logout,
  getAdminConfig,
  saveAdminConfigApi,
  getSchema,
  getConfigVersion,
  restoreConfigVersion,
  changePassword,
  exportConfig,
  importConfig,
  resetWebsite
} from "@/lib/api-client"
import {
  JSONViewerWithLineNumbers,
  JSONDiffViewer,
  ConfigCard,
  ThemeSelector,
  SystemManagement,
  Sidebar,
  Header,
  ArticlesManagement,
  ConfigFormEditor,
  PageManagement,
  PageEditor,
  AccountManagement
} from "./components"

interface ThemeColors {
  primary: string
  primaryHover: string
  secondary: string
  accent: string
  background: string
  backgroundSecondary: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
}

interface ThemeConfig {
  id: string
  name: string
  description: string
  colors: ThemeColors
  layout: any
  effects: any
  darkMode: {
    colors: ThemeColors
  }
}

interface ThemeData {
  currentTheme: string
  themes: Record<string, ThemeConfig>
}

interface Configs {
  site: any
  footer: any
  theme: ThemeData
  header: any
  'section-hero': any
  'section-partner': any
  'section-products': any
  'section-services': any
  'section-pricing': any
  'section-about': any
  'section-contact': any
  'feishu-app': any
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [configs, setConfigs] = useState<Configs>({
    site: {},
    footer: {},
    theme: {
      currentTheme: 'dark',
      themes: {}
    },
    header: {},
    'section-hero': {},
    'section-partner': {},
    'section-products': {},
    'section-services': {},
    'section-pricing': {},
    'section-about': {},
    'section-contact': {},
    'feishu-app': {
      appId: '',
      appSecret: '',
      baseLink: '',
      appToken: '',
      tableId: '',
      tableLink: ''
    }
  })
  const [originalConfigs, setOriginalConfigs] = useState<Configs>({
    site: {},
    footer: {},
    theme: {
      currentTheme: 'dark',
      themes: {}
    },
    header: {},
    'section-hero': {},
    'section-partner': {},
    'section-products': {},
    'section-services': {},
    'section-pricing': {},
    'section-about': {},
    'section-contact': {},
    'feishu-app': {
      appId: '',
      appSecret: '',
      baseLink: '',
      appToken: '',
      tableId: '',
      tableLink: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [jsonError, setJsonError] = useState<string>("")
  const [schema, setSchema] = useState<any>({})
  const [leftWidth, setLeftWidth] = useState(66.67)
  const [isDragging, setIsDragging] = useState(false)
  const [textareaRows, setTextareaRows] = useState(20)
  const [viewingConfig, setViewingConfig] = useState<string | null>(null)
  const [viewValue, setViewValue] = useState("")
  const [editLeftWidth, setEditLeftWidth] = useState(70)
  const [isEditDragging, setIsEditDragging] = useState(false)
  const [showFieldDescription, setShowFieldDescription] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [viewingPreviousVersion, setViewingPreviousVersion] = useState<string | null>(null)
  const [previousVersionData, setPreviousVersionData] = useState<any>(null)
  const [previousVersionInfo, setPreviousVersionInfo] = useState<any>(null)
  const [restoringVersion, setRestoringVersion] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [showEditDiff, setShowEditDiff] = useState(false)
  const [activeMenu, setActiveMenu] = useState('accountInfo')
  const [editingPageId, setEditingPageId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const menu = urlParams.get('menu') || 'accountInfo'
      if (menu !== activeMenu) {
        setActiveMenu(menu)
      }
    }
  }, [])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSchema, setShowSchema] = useState(true)

  useEffect(() => {
    fetchConfigs()
    fetchSchema()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const authResult = await checkAuthStatus()

      if (!authResult.authenticated) {
        router.push("/admin")
        return
      }

      setCurrentUser(authResult.user)
      sessionStorage.setItem('currentUser', JSON.stringify(authResult.user))

      if ((authResult.user as any)?.mustChangePassword) {
        setMustChangePassword(true)
      }
    } catch (error) {
      router.push("/admin")
    }
  }

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

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleView = (configType: string) => {
    setViewingConfig(configType)
    setViewValue(JSON.stringify(configs[configType as keyof typeof configs], null, 2))
  }

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

  const handleEditMouseDown = () => {
    setIsEditDragging(true)
  }

  const fetchSchema = async () => {
    try {
      const schemaData = await getSchema()
      setSchema(schemaData)
    } catch (error) {
      console.error("获取配置说明失败", error)
    }
  }



  const fetchConfigs = async () => {
    try {
      const data = await getAdminConfig() as unknown as Configs
      
      const mergedData = {
        ...data,
        theme: data.theme || {
          currentTheme: 'modern',
          themes: {}
        }
      }
      
      setConfigs(mergedData)
      setOriginalConfigs(JSON.parse(JSON.stringify(mergedData)))
    } catch (error) {
      console.error('获取配置失败:', error)
      toast.error("获取配置失败")
    }
  }

  const hasConfigChanges = (configType: string) => {
    return JSON.stringify(configs[configType as keyof typeof configs]) !==
      JSON.stringify(originalConfigs[configType as keyof typeof originalConfigs])
  }

  const handleThemeChange = async (themeId: string) => {
    const updatedTheme = {
      ...configs.theme,
      currentTheme: themeId
    }
    
    setConfigs(prev => ({
      ...prev,
      theme: updatedTheme
    }))
    
    setTheme(themeId)
    
    setLoading(true)
    try {
      const result = await saveAdminConfigApi("theme", updatedTheme)

      if (result.success) {
        toast.success("主题切换成功")
        setOriginalConfigs(prev => ({
          ...prev,
          theme: updatedTheme
        }))
      } else {
        toast.error("主题切换失败")
      }
    } catch (error) {
      toast.error("主题切换失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (configType: string, data?: any) => {
    setLoading(true)
    try {
      const configData = data || configs[configType as keyof typeof configs]
      const result = await saveAdminConfigApi(configType, configData)

      if (result.success) {
        toast.success("配置提交成功")
        setConfigs(prev => ({
          ...prev,
          [configType]: JSON.parse(JSON.stringify(configData))
        }))
        setOriginalConfigs(prev => ({
          ...prev,
          [configType]: JSON.parse(JSON.stringify(configData))
        }))
      } else {
        toast.error("配置提交失败")
      }
    } catch (error) {
      toast.error("配置提交失败")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const success = await logout()

      if (success) {
        toast.success("退出成功")
        router.push("/admin")
      }
    } catch (error) {
      toast.error("退出失败")
    }
  }

  const handleViewPreviousVersion = async (configType: string) => {
    try {
      const result = await getConfigVersion(configType)

      if (result.success) {
        setPreviousVersionData(result.data)
        setPreviousVersionInfo(result.version)
        setViewingPreviousVersion(configType)
      } else {
        toast.info("当前配置项还没有历史版本记录,提交配置后将创建第一个版本。")
      }
    } catch (error) {
      toast.error("获取上一版本失败")
    }
  }

  const handleRestoreVersion = async (configType: string) => {
    const confirmed = window.confirm("确定要还原到上一版本吗?当前配置将被覆盖。")
    
    if (!confirmed) {
      return
    }

    setRestoringVersion(true)
    try {
      const result = await restoreConfigVersion(configType)

      if (result.success) {
        toast.success("版本还原成功")
        await fetchConfigs()
      } else {
        toast.error(result.message || "版本还原失败")
      }
    } catch (error) {
      toast.error("版本还原失败")
    } finally {
      setRestoringVersion(false)
    }
  }

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu)
    router.push(`/admin/dashboard?menu=${menu}`)
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("请填写所有字段")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致")
      return
    }

    if (newPassword.length < 8) {
      toast.error("新密码长度至少为8位")
      return
    }

    const currentUserStr = sessionStorage.getItem('currentUser')
    if (!currentUserStr) {
      toast.error("未找到用户信息,请重新登录")
      router.push("/admin")
      return
    }

    const currentUser = JSON.parse(currentUserStr)

    setChangePasswordLoading(true)

    try {
      const result = await changePassword({
        username: currentUser.username,
        oldPassword,
        newPassword
      })

      if (result.success) {
        toast.success("密码修改成功")
        setShowChangePassword(false)
        setMustChangePassword(false)
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")

        if (result.user) {
          setCurrentUser(result.user)
          sessionStorage.setItem('currentUser', JSON.stringify(result.user))
        }
      } else {
        toast.error(result.message || "密码修改失败")
      }
    } catch (error) {
      toast.error("密码修改失败,请重试")
    } finally {
      setChangePasswordLoading(false)
    }
  }

  const handleEdit = (configType: string) => {
    setEditingConfig(configType)
    setEditValue(JSON.stringify(configs[configType as keyof typeof configs], null, 2))
    setJsonError("")
  }

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setJsonError("JSON内容不能为空")
      return false
    }
    try {
      JSON.parse(value)
      setJsonError("")
      return true
    } catch (error: any) {
      const errorMessage = error.message || "JSON格式错误"
      setJsonError(errorMessage)
      return false
    }
  }

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(editValue)
      const formatted = JSON.stringify(parsed, null, 2)
      setEditValue(formatted)
      setJsonError("")
      toast.success("格式化成功")
    } catch (error: any) {
      const errorMessage = error.message || "JSON格式错误"
      setJsonError(errorMessage)
      toast.error("JSON格式错误,无法格式化")
    }
  }

  const handleEditValueChange = (value: string) => {
    setEditValue(value)
    validateJson(value)
  }

  const handleSaveEdit = () => {
    if (!validateJson(editValue)) {
      toast.error("JSON格式错误,请修正后再提交")
      return
    }

    try {
      const parsed = JSON.parse(editValue)
      setConfigs(prev => ({
        ...prev,
        [editingConfig as string]: parsed
      }))
      setEditingConfig(null)
      setJsonError("")
      toast.success("配置已更新,请点击提交按钮确认更改")
    } catch (error) {
      toast.error("JSON格式错误")
    }
  }

  const renderSchema = (schemaData: any) => {
    if (!schemaData) return null

    return (
      <Card
        title={
          <div className={styles.schemaCardTitle}>
            <IconInfoCircle className={styles.schemaCardTitleIcon} />
            <span className={styles.schemaCardTitleText}>字段说明</span>
          </div>
        }
      >
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
      </Card>
    )
  }

  const handleExportConfig = async () => {
    try {
      const blob = await exportConfig()
      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `config-export-${new Date().toISOString().split('T')[0]}.zip`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('配置导出成功')
      } else {
        toast.error('配置导出失败')
      }
    } catch (error) {
      toast.error('配置导出失败')
    }
  }

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadConfig = async () => {
      try {
        const success = await importConfig(file)

        if (success) {
          toast.success('配置导入成功,正在刷新页面...')
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else {
          toast.error('配置导入失败')
        }
      } catch (error) {
        toast.error('配置导入失败')
      }
    }

    const confirmed = window.confirm('确定要导入配置吗?这将覆盖当前的配置版本。')
    
    if (confirmed) {
      uploadConfig()
    }
  }

  const handleResetWebsite = async () => {
    if (!currentUser) {
      toast.error("未找到用户信息,请重新登录")
      return
    }

    const backupConfirmed = window.confirm(
      "⚠️ 一键还原网站配置\n\n" +
      "此操作将把所有配置还原到模版文件状态,建议先备份当前配置。\n\n" +
      "点击'确定'先下载配置备份,点击'取消'放弃操作。"
    )

    if (!backupConfirmed) {
      return
    }

    await handleExportConfig()

    const resetConfirmed = window.confirm(
      "✅ 配置已备份完成\n\n" +
      "现在可以安全地执行一键还原操作。\n\n" +
      "此操作将把所有配置还原到模版文件状态,无法恢复!\n\n" +
      "点击'确定'继续还原,点击'取消'放弃操作。"
    )

    if (!resetConfirmed) {
      return
    }

    setLoading(true)
    try {
      const success = await resetWebsite(currentUser.username)

      if (success) {
        toast.success("网站配置已成功还原到初始状态")
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast.error("还原失败")
      }
    } catch (error) {
      toast.error("还原失败,请重试")
    } finally {
      setLoading(false)
    }
  }



  const renderConfigCard = (title: string, configType: string, description: string) => {
    const schemaData = schema[configType]

    return (
      <ConfigCard
        title={title}
        configType={configType}
        description={description}
        configData={configs[configType as keyof typeof configs]}
        schemaData={schemaData}
        versionInfo={null}
        loading={loading}
        showSchema={showSchema}
        leftWidth={leftWidth}
        isDragging={isDragging}
        hasChanges={hasConfigChanges(configType)}
        onView={() => handleView(configType)}
        onEdit={() => handleEdit(configType)}
        onSave={() => handleSave(configType)}
        onViewPreviousVersion={() => handleViewPreviousVersion(configType)}
        onToggleSchema={() => setShowSchema(!showSchema)}
        onMouseDown={handleMouseDown}
        renderSchema={() => renderSchema(schemaData)}
      />
    )
  }

  return (
    <div className={styles.mainContainer}>
      <Toaster position="top-center" />

      {mustChangePassword && (
        <div className={styles.passwordBanner}>
          <div className={styles.passwordBannerInner}>
            <div className={styles.passwordBannerContent}>
              <div className={styles.passwordBannerIcon}>
                <svg className={styles.passwordBannerIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className={styles.passwordBannerText}>
                <p className={styles.passwordBannerTitle}>安全提示</p>
                <p className={styles.passwordBannerMessage}>您的账户需要修改密码才能继续使用</p>
              </div>
              <div className={styles.passwordBannerButton}>
                <Button
                  type="primary"
                  status="danger"
                  onClick={() => setShowChangePassword(true)}
                >
                  立即修改
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onChangePassword={() => setShowChangePassword(true)}
      />

      <div className={styles.mainLayout}>
        <Sidebar
          collapsed={sidebarCollapsed}
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className={styles.contentArea}>
          <div className={styles.contentPadding}>


            {activeMenu === 'pages' && (
              editingPageId ? (
                <PageEditor
                  pageId={editingPageId}
                  onBack={() => setEditingPageId(null)}
                />
              ) : (
                <PageManagement
                  onEditPage={(pageId) => setEditingPageId(pageId)}
                />
              )
            )}

            {activeMenu === 'site' && (
              <ConfigFormEditor
                configType="site"
                title="站点配置"
                description="包含站点名称、描述、联系方式等基本信息"
                configData={configs.site}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, site: data }))
                  await handleSave('site')
                }}
                hasChanges={hasConfigChanges('site')}
                loading={loading}
              />
            )}

            {activeMenu === 'header' && (
              <ConfigFormEditor
                configType="header"
                title="顶部导航配置"
                description="配置网站顶部导航栏"
                configData={configs.header || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, header: data }))
                  await handleSave('header')
                }}
                hasChanges={hasConfigChanges('header')}
                loading={loading}
              />
            )}

            {activeMenu === 'section-hero' && (
              <ConfigFormEditor
                configType="section-hero"
                title="Hero 区块配置"
                description="配置首页 Hero 区块内容"
                configData={configs['section-hero'] || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, 'section-hero': data }))
                  await handleSave('section-hero')
                }}
                hasChanges={hasConfigChanges('section-hero')}
                loading={loading}
              />
            )}

            {activeMenu === 'section-partner' && (
              <ConfigFormEditor
                configType="section-partner"
                title="合作伙伴区块配置"
                description="配置首页合作伙伴区块内容"
                configData={configs['section-partner'] || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, 'section-partner': data }))
                  await handleSave('section-partner')
                }}
                hasChanges={hasConfigChanges('section-partner')}
                loading={loading}
              />
            )}

            {activeMenu === 'section-products' && (
              <ConfigFormEditor
                configType="section-products"
                title="产品展示区块配置"
                description="配置首页产品展示区块内容"
                configData={configs['section-products'] || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, 'section-products': data }))
                  await handleSave('section-products')
                }}
                hasChanges={hasConfigChanges('section-products')}
                loading={loading}
              />
            )}

            {activeMenu === 'section-services' && (
              <ConfigFormEditor
                configType="section-services"
                title="服务信息区块配置"
                description="配置首页服务信息区块内容"
                configData={configs['section-services'] || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, 'section-services': data }))
                  await handleSave('section-services')
                }}
                hasChanges={hasConfigChanges('section-services')}
                loading={loading}
              />
            )}

            {activeMenu === 'section-pricing' && (
              <ConfigFormEditor
                configType="section-pricing"
                title="价格信息区块配置"
                description="配置首页价格信息区块内容"
                configData={configs['section-pricing'] || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, 'section-pricing': data }))
                  await handleSave('section-pricing')
                }}
                hasChanges={hasConfigChanges('section-pricing')}
                loading={loading}
              />
            )}

            {activeMenu === 'section-about' && (
              <ConfigFormEditor
                configType="section-about"
                title="关于我们区块配置"
                description="配置首页关于我们区块内容"
                configData={configs['section-about'] || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, 'section-about': data }))
                  await handleSave('section-about')
                }}
                hasChanges={hasConfigChanges('section-about')}
                loading={loading}
              />
            )}

            {activeMenu === 'section-contact' && (
              <ConfigFormEditor
                configType="section-contact"
                title="联系我们区块配置"
                description="配置首页联系我们区块内容"
                configData={configs['section-contact'] || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, 'section-contact': data }))
                  await handleSave('section-contact')
                }}
                hasChanges={hasConfigChanges('section-contact')}
                loading={loading}
              />
            )}

            {activeMenu === 'footer' && (
              <ConfigFormEditor
                configType="footer"
                title="页脚配置"
                description="配置网站页脚信息"
                configData={configs.footer || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, footer: data }))
                  await handleSave('footer')
                }}
                hasChanges={hasConfigChanges('footer')}
                loading={loading}
              />
            )}

            {activeMenu === 'articles' && <ArticlesManagement />}

            {activeMenu === 'theme' && (
              <ThemeSelector
                themeData={configs.theme}
                onThemeChange={handleThemeChange}
              />
            )}

            {activeMenu === 'feishu-app' && (
              <ConfigFormEditor
                configType="feishu-app"
                title="飞书配置"
                description="配置提交留言功能的飞书数据应用"
                configData={configs['feishu-app'] || {}}
                onSave={async (data) => {
                  setConfigs(prev => ({ ...prev, 'feishu-app': data }))
                  await handleSave('feishu-app', data)
                }}
                hasChanges={hasConfigChanges('feishu-app')}
                loading={loading}
              />
            )}

            {activeMenu === 'system' && (
              <SystemManagement
                siteConfig={configs.site}
                onExportConfig={handleExportConfig}
                onImportConfig={handleImportConfig}
                onResetWebsite={handleResetWebsite}
                currentUser={currentUser}
                onChangePassword={() => setShowChangePassword(true)}
              />
            )}

            {activeMenu === 'accounts' && (
              <AccountManagement />
            )}


          </div>
        </div>
      </div>

      <Modal
        title="编辑配置"
        visible={!!editingConfig}
        onCancel={() => {
          setEditingConfig(null)
          setJsonError("")
          setShowEditDiff(false)
        }}
        onOk={handleSaveEdit}
        okText="确认修改"
        style={{ width: '90vw', maxWidth: 1200 }}
      >
        <div id="edit-config-container" className={styles.editConfigContainer}>
          <div style={{ width: showFieldDescription ? `${editLeftWidth}%` : '100%' }} className={styles.editConfigLeft}>
            <div className={styles.editConfigHeader}>
              <div className={styles.editConfigHeaderTop}>
                <div className={styles.editConfigHeaderLeft}>
                  <p className={styles.editConfigHint}>
                    请直接编辑JSON配置内容
                  </p>
                  <Button
                    size="small"
                    type={showEditDiff ? "primary" : "secondary"}
                    onClick={() => setShowEditDiff(!showEditDiff)}
                  >
                    {showEditDiff ? "隐藏对比" : "对比原版本"}
                  </Button>
                  <Button
                    size="small"
                    icon={<IconUndo />}
                    onClick={() => {
                      if (editingConfig) {
                        setEditValue(JSON.stringify(configs[editingConfig as keyof typeof configs], null, 2))
                        setJsonError("")
                        toast.success("已恢复到编辑前的配置")
                      }
                    }}
                  >
                    恢复原配置
                  </Button>
                </div>
                <div className={styles.editConfigHeaderRight}>
                  <Button
                    size="small"
                    icon={<IconInfoCircle />}
                    type={showFieldDescription ? "primary" : "secondary"}
                    onClick={() => setShowFieldDescription(!showFieldDescription)}
                  >
                    {showFieldDescription ? "隐藏字段说明" : "显示字段说明"}
                  </Button>
                  <Button
                    size="small"
                    icon={<IconCheck />}
                    onClick={handleFormatJson}
                  >
                    格式化
                  </Button>
                </div>
              </div>

              {jsonError && (
                <Alert
                  type="error"
                  content={jsonError}
                  className={styles.editConfigError}
                  closable
                  onClose={() => setJsonError("")}
                />
              )}

              {showEditDiff && editingConfig ? (
                <JSONDiffViewer
                  oldContent={JSON.stringify(configs[editingConfig as keyof typeof configs], null, 2)}
                  newContent={editValue}
                  oldTitle="原版本"
                  newTitle="编辑后"
                  maxHeight="50vh"
                />
              ) : (
                <Input.TextArea
                  value={editValue}
                  onChange={handleEditValueChange}
                  rows={textareaRows}
                  className={styles.editConfigTextarea}
                  status={jsonError ? "error" : undefined}
                />
              )}


            </div>
            <div className={styles.editConfigActionsBottom}>
              <span className={styles.editConfigRowsLabel}>输入框高度:</span>
              <div className={styles.editConfigRowsControls}>
                <Button
                  size="mini"
                  onClick={() => setTextareaRows(Math.max(15, textareaRows - 5))}
                  disabled={textareaRows <= 15}
                >
                  - 5行
                </Button>
                <span className={styles.editConfigRowsValue}>{textareaRows} 行</span>
                <Button
                  size="mini"
                  onClick={() => setTextareaRows(Math.min(50, textareaRows + 5))}
                  disabled={textareaRows >= 50}
                >
                  + 5行
                </Button>
              </div>
              <div className={styles.editConfigPresets}>
                <Button
                  size="mini"
                  onClick={() => setTextareaRows(20)}
                >
                  默认
                </Button>
                <Button
                  size="mini"
                  onClick={() => setTextareaRows(35)}
                >
                  大
                </Button>
                <Button
                  size="mini"
                  onClick={() => setTextareaRows(50)}
                >
                  最大
                </Button>
              </div>
            </div>
          </div>

          {showFieldDescription && (
            <>
              <div
                className={`${styles.editConfigResizer} ${isEditDragging ? styles.editConfigResizerDragging : ''}`}
                onMouseDown={handleEditMouseDown}
              >
                <div className={styles.editConfigResizerHandle} />
                <div className={styles.editConfigResizerVisual} />
              </div>

              <div style={{ width: `${100 - editLeftWidth}%` }} className={styles.editConfigRight}>
                {editingConfig && schema[editingConfig] && renderSchema(schema[editingConfig])}
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        title="查看配置"
        visible={!!viewingConfig}
        onCancel={() => setViewingConfig(null)}
        footer={null}
        style={{ width: '90vw', maxWidth: 1000 }}
      >
        <div className={styles.viewConfigModalBody}>
          <div className={styles.viewConfigModalHeader}>
            <p className={styles.viewConfigModalHint}>
              配置内容(只读)
            </p>
            <Button
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(viewValue)
                toast.success("已复制到剪贴板")
              }}
            >
              复制
            </Button>
          </div>

          <JSONViewerWithLineNumbers
            content={viewValue}
            maxHeight="60vh"
          />
        </div>
      </Modal>

      <Modal
        title={
          <div className={styles.viewConfigModalTitle}>
            <IconHistory className={styles.schemaCardTitleIcon} />
            <span>查看上一版本配置</span>
          </div>
        }
        visible={!!viewingPreviousVersion}
        onCancel={() => {
          setViewingPreviousVersion(null)
          setPreviousVersionData(null)
          setPreviousVersionInfo(null)
          setShowDiff(false)
        }}
        footer={
          <div className={styles.viewConfigModalFooter}>
            <Button onClick={() => {
              setViewingPreviousVersion(null)
              setPreviousVersionData(null)
              setPreviousVersionInfo(null)
              setShowDiff(false)
            }}>
              关闭
            </Button>
            <Button
              type="primary"
              icon={<IconUndo />}
              loading={restoringVersion}
              onClick={() => {
                if (viewingPreviousVersion) {
                  handleRestoreVersion(viewingPreviousVersion)
                  setViewingPreviousVersion(null)
                  setPreviousVersionData(null)
                  setPreviousVersionInfo(null)
                  setShowDiff(false)
                }
              }}
            >
              还原到此版本
            </Button>
          </div>
        }
        style={{ width: '90vw', maxWidth: 1200 }}
      >
        <div className={styles.viewConfigModalBody}>
          {previousVersionInfo && (
            <Alert
              type="info"
              content={`版本时间:${new Date(previousVersionInfo.createdAt).toLocaleString('zh-CN')}`}
              className={styles.viewConfigVersionInfo}
            />
          )}

          <div className={styles.viewConfigModalHeader}>
            <div className={styles.viewConfigModalHeaderLeft}>
              <Button
                type={showDiff ? "secondary" : "primary"}
                size="small"
                onClick={() => setShowDiff(false)}
              >
                查看版本
              </Button>
              <Button
                type={showDiff ? "primary" : "secondary"}
                size="small"
                onClick={() => setShowDiff(true)}
              >
                对比当前版本
              </Button>
            </div>
            {!showDiff && (
              <Button
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(previousVersionData, null, 2))
                  toast.success("已复制到剪贴板")
                }}
              >
                复制
              </Button>
            )}
          </div>

          {showDiff && viewingPreviousVersion ? (
            <JSONDiffViewer
              oldContent={JSON.stringify(previousVersionData, null, 2)}
              newContent={JSON.stringify(configs[viewingPreviousVersion as keyof typeof configs], null, 2)}
              oldTitle="上一版本"
              newTitle="当前版本"
              maxHeight="60vh"
            />
          ) : (
            <JSONViewerWithLineNumbers
              content={JSON.stringify(previousVersionData, null, 2)}
              maxHeight="60vh"
            />
          )}
        </div>
      </Modal>

      <Modal
        title="修改密码"
        visible={showChangePassword}
        onCancel={() => {
          setShowChangePassword(false)
          setOldPassword("")
          setNewPassword("")
          setConfirmPassword("")
        }}
        onOk={handleChangePassword}
        confirmLoading={changePasswordLoading}
        okText="确认修改"
      >
        <div className={styles.changePasswordForm}>
          <div className={styles.formItem}>
            <label className={styles.formLabel}>旧密码</label>
            <Input.Password
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="请输入旧密码"
            />
          </div>
          <div className={styles.formItem}>
            <label className={styles.formLabel}>新密码</label>
            <Input.Password
              value={newPassword}
              onChange={setNewPassword}
              placeholder="请输入新密码(至少8位)"
            />
          </div>
          <div className={styles.formItem}>
            <label className={styles.formLabel}>确认新密码</label>
            <Input.Password
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="请再次输入新密码"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
