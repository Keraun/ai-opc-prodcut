"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Modal, Input, Alert, Dropdown, Switch } from "@arco-design/web-react"
import { IconSave, IconExport, IconEdit, IconLock, IconCheck, IconInfoCircle, IconEye, IconCustomerService, IconQuestionCircle, IconHistory, IconUndo, IconHome, IconSettings, IconUser, IconNav, IconFile, IconStorage, IconCode, IconTrophy, IconClockCircle } from "@arco-design/web-react/icon"
import { toast, Toaster } from "sonner"
import { compareJSON, getLineClass, hasChanges } from "@/lib/json-compare"
import { useTheme } from "@/components/theme-provider"
import styles from "./dashboard.module.css"

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
  common: any
  seo: any
  navigation: any
  footer: any
  home: any
  homeOrder: any
  homeBanner: any
  homePartners: any
  homeProducts: any
  homeServices: any
  homePricing: any
  homeAbout: any
  homeContact: any
  products: any
  otherPages: any
  custom: any
  account: any
  loginLogs: any
  theme: ThemeData
}

const JSONViewerWithLineNumbers = ({
  content,
  diffLines = null,
  maxHeight = '60vh'
}: {
  content: string
  diffLines?: any[] | null
  maxHeight?: string
}) => {
  const lines = content.split('\n')

  return (
    <div className={styles.jsonViewer} style={{ maxHeight }}>
      {lines.map((line, index) => {
        const lineNumber = index + 1
        const diffLine = diffLines?.find(d => d.lineNumber === lineNumber)
        const lineClass = diffLine ? getLineClass(diffLine.type) : ''

        return (
          <div key={index} className={`${styles.jsonLine} ${lineClass}`}>
            <div className={styles.jsonLineNumber}>
              {lineNumber}
            </div>
            <div className={styles.jsonLineContent}>
              {line || ' '}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const JSONDiffViewer = ({
  oldContent,
  newContent,
  oldTitle = '旧版本',
  newTitle = '新版本',
  maxHeight = '60vh'
}: {
  oldContent: string
  newContent: string
  oldTitle?: string
  newTitle?: string
  maxHeight?: string
}) => {
  const oldObj = JSON.parse(oldContent)
  const newObj = JSON.parse(newContent)
  const { oldLines, newLines } = compareJSON(oldObj, newObj)

  return (
    <div className={styles.diffContainer}>
      <div>
        <div className={styles.diffTitle}>{oldTitle}</div>
        <div className={styles.jsonViewer} style={{ maxHeight }}>
          {oldLines.map((line, index) => (
            <div key={index} className={`${styles.jsonLine} ${getLineClass(line.type)}`}>
              <div className={styles.jsonLineNumber}>
                {line.lineNumber}
              </div>
              <div className={styles.jsonLineContent}>
                {line.content || ' '}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className={styles.diffTitle}>{newTitle}</div>
        <div className={styles.jsonViewer} style={{ maxHeight }}>
          {newLines.map((line, index) => (
            <div key={index} className={`${styles.jsonLine} ${getLineClass(line.type)}`}>
              <div className={styles.jsonLineNumber}>
                {line.lineNumber}
              </div>
              <div className={styles.jsonLineContent}>
                {line.content || ' '}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [configs, setConfigs] = useState<Configs>({
    site: {},
    common: {},
    seo: {},
    navigation: {},
    footer: {},
    home: {},
    homeOrder: {},
    homeBanner: {},
    homePartners: {},
    homeProducts: {},
    homeServices: {},
    homePricing: {},
    homeAbout: {},
    homeContact: {},
    products: {},
    otherPages: {},
    custom: {},
    account: {},
    loginLogs: {},
    theme: {
      currentTheme: 'modern',
      themes: {}
    }
  })
  const [originalConfigs, setOriginalConfigs] = useState<Configs>({
    site: {},
    common: {},
    seo: {},
    navigation: {},
    footer: {},
    home: {},
    homeOrder: {},
    homeBanner: {},
    homePartners: {},
    homeProducts: {},
    homeServices: {},
    homePricing: {},
    homeAbout: {},
    homeContact: {},
    products: {},
    otherPages: {},
    custom: {},
    account: {},
    loginLogs: {},
    theme: {
      currentTheme: 'modern',
      themes: {}
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
  const [operationLogs, setOperationLogs] = useState<any[]>([])
  const [viewingPreviousVersion, setViewingPreviousVersion] = useState<string | null>(null)
  const [previousVersionData, setPreviousVersionData] = useState<any>(null)
  const [previousVersionInfo, setPreviousVersionInfo] = useState<any>(null)
  const [restoringVersion, setRestoringVersion] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [showEditDiff, setShowEditDiff] = useState(false)
  const [versionInfos, setVersionInfos] = useState<Record<string, any>>({})
  const [activeMenu, setActiveMenu] = useState('accountInfo')

  // 在客户端使用 useEffect 获取 URL 查询参数
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

  const fetchVersionInfos = async () => {
    const configTypes = ['homePage', 'aboutPage', 'contactPage', 'otherPages', 'newsCategory']
    const infos: Record<string, any> = {}

    for (const type of configTypes) {
      try {
        const response = await fetch(`/api/admin/config/version?type=${type}&action=latest`)
        const data = await response.json()
        if (data.success) {
          infos[type] = data.version
        }
      } catch (error) {
        console.error(`获取${type}版本信息失败:`, error)
      }
    }

    setVersionInfos(infos)
  }

  useEffect(() => {
    fetchConfigs()
    fetchSchema()
    fetchOperationLogs()
    checkAuth()
  }, [])

  useEffect(() => {
    if (Object.keys(configs).length > 0) {
      fetchVersionInfos()
    }
  }, [configs])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/auth")
      const data = await response.json()

      if (!data.authenticated) {
        router.push("/admin")
        return
      }

      setCurrentUser(data.user)
      sessionStorage.setItem('currentUser', JSON.stringify(data.user))

      if (data.user.mustChangePassword) {
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
      const response = await fetch("/api/admin/schema")
      if (response.ok) {
        const data = await response.json()
        setSchema(data)
      }
    } catch (error) {
      console.error("获取配置说明失败", error)
    }
  }

  const fetchOperationLogs = async () => {
    try {
      const response = await fetch("/api/admin/operation-logs")
      if (response.ok) {
        const data = await response.json()
        setOperationLogs(data.logs || [])
      }
    } catch (error) {
      console.error("获取操作记录失败", error)
    }
  }

  const fetchConfigs = async () => {
    try {
      const response = await fetch("/api/admin/config")
      if (response.ok) {
        const data = await response.json()
        setConfigs(data)
        setOriginalConfigs(JSON.parse(JSON.stringify(data)))
      } else {
        toast.error("获取配置失败")
      }
    } catch (error) {
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
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "theme",
          data: updatedTheme
        }),
      })

      if (response.ok) {
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

  const handleSave = async (configType: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: configType,
          data: configs[configType as keyof typeof configs]
        }),
      })

      if (response.ok) {
        toast.success("配置提交成功")
        setOriginalConfigs(prev => ({
          ...prev,
          [configType]: JSON.parse(JSON.stringify(configs[configType as keyof typeof configs]))
        }))
        fetchVersionInfos()
        fetchOperationLogs()
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
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      })

      if (response.ok) {
        toast.success("退出成功")
        router.push("/admin")
      }
    } catch (error) {
      toast.error("退出失败")
    }
  }

  const handleViewPreviousVersion = async (configType: string) => {
    try {
      const response = await fetch(`/api/admin/config/version?type=${configType}&action=previous`)
      const data = await response.json()

      if (response.ok && data.success) {
        setPreviousVersionData(data.data)
        setPreviousVersionInfo(data.version)
        setViewingPreviousVersion(configType)
      } else {
        toast.info("当前配置项还没有历史版本记录，提交配置后将创建第一个版本。")
      }
    } catch (error) {
      toast.error("获取上一版本失败")
    }
  }

  const handleRestoreVersion = async (configType: string) => {
    const confirmed = window.confirm("确定要还原到上一版本吗？当前配置将被覆盖。")
    
    if (!confirmed) {
      return
    }

    setRestoringVersion(true)
    try {
      const response = await fetch("/api/admin/config/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: configType
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("版本还原成功")
        await fetchConfigs()
        fetchVersionInfos()
      } else {
        toast.error(data.message || "版本还原失败")
      }
    } catch (error) {
      toast.error("版本还原失败")
    } finally {
      setRestoringVersion(false)
    }
  }

  // 处理菜单点击事件
  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu)
    // 更新URL查询参数
    const url = new URL(window.location.href)
    url.searchParams.set('menu', menu)
    window.history.pushState({}, '', url.toString())
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
      toast.error("未找到用户信息，请重新登录")
      router.push("/admin")
      return
    }

    const currentUser = JSON.parse(currentUserStr)

    setChangePasswordLoading(true)

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: currentUser.username,
          oldPassword,
          newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("密码修改成功")
        setShowChangePassword(false)
        setMustChangePassword(false)
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")

        if (data.user) {
          setCurrentUser(data.user)
          sessionStorage.setItem('currentUser', JSON.stringify(data.user))
        }
        fetchOperationLogs()
      } else {
        toast.error(data.message || "密码修改失败")
      }
    } catch (error) {
      toast.error("密码修改失败，请重试")
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
      toast.error("JSON格式错误，无法格式化")
    }
  }

  const handleEditValueChange = (value: string) => {
    setEditValue(value)
    validateJson(value)
  }

  const handleSaveEdit = () => {
    if (!validateJson(editValue)) {
      toast.error("JSON格式错误，请修正后再提交")
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
      toast.success("配置已更新，请点击提交按钮确认更改")
    } catch (error) {
      toast.error("JSON格式错误")
    }
  }

  const renderConfigCard = (title: string, configType: string, description: string) => {
    const schemaData = schema[configType]
    const versionInfo = versionInfos[configType]

    return (
      <div id="config-container" className={styles.configContainer}>
        <div style={{ width: showSchema ? `${leftWidth}%` : '100%' }} className={styles.configLeft}>
          <Card
            style={{ height: 'calc(100vh - 8rem)' }}
            className={styles.configCard}
            title={
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{title}</span>
                <div className={styles.cardActions}>
                  <Button
                    size="small"
                    type="text"
                    icon={<IconInfoCircle />}
                    onClick={() => setShowSchema(!showSchema)}
                  >
                    {showSchema ? '隐藏说明' : '显示说明'}
                  </Button>
                  <Button
                    size="small"
                    icon={<IconHistory />}
                    onClick={() => handleViewPreviousVersion(configType)}
                  >
                    上一版本
                  </Button>
                  <Button
                    size="small"
                    icon={<IconEye />}
                    onClick={() => handleView(configType)}
                  >
                    查看
                  </Button>
                  <Button
                    size="small"
                    icon={<IconEdit />}
                    onClick={() => handleEdit(configType)}
                  >
                    编辑
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    icon={<IconSave />}
                    loading={loading}
                    onClick={() => handleSave(configType)}
                    disabled={!hasConfigChanges(configType)}
                  >
                    提交
                  </Button>
                </div>
              </div>
            }
          >
            <div className={styles.configContent}>
              <p className={styles.configValue}>{description}</p>
              {versionInfo && (
                <p className={styles.versionInfo}>
                  最后更新时间：{new Date(versionInfo.createdAt).toLocaleString('zh-CN')}
                </p>
              )}
            </div>
            <pre className={styles.jsonViewer} style={{ maxHeight: '24rem', padding: '1rem' }}>
              {JSON.stringify(configs[configType as keyof typeof configs], null, 2)}
            </pre>
          </Card>
        </div>

        {showSchema && (
          <>
            <div
              className={`${styles.resizer} ${isDragging ? styles.resizerActive : ''}`}
              onMouseDown={handleMouseDown}
              style={{ margin: '0 0.5rem' }}
            >
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '0.25rem', height: '3rem', backgroundColor: '#d1d5db', borderRadius: '0.25rem' }} />
            </div>

            <div style={{ width: `${100 - leftWidth}%` }} className={styles.configRight}>
              {schemaData && (
                <Card
                  title={
                    <div className={styles.configItem}>
                      <IconInfoCircle style={{ color: '#2563eb' }} />
                      <span className={styles.cardTitle}>字段说明</span>
                    </div>
                  }
                >
                  <div className={styles.configContent} style={{ maxHeight: '31.25rem', overflow: 'auto' }}>
                    {Object.entries(schemaData).map(([key, value]: [string, any]) => (
                      <div key={key} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h4 className={styles.configLabel}>{key}</h4>
                          {value.required && (
                            <span style={{ padding: '0.125rem 0.375rem', fontSize: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.25rem' }}>必填</span>
                          )}
                          {value.type && (
                            <span style={{ padding: '0.125rem 0.375rem', fontSize: '0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '0.25rem' }}>{value.type}</span>
                          )}
                        </div>
                        <p className={styles.configValue}>{value.description}</p>
                        {value.fields && (
                          <div style={{ marginLeft: '0.5rem', marginTop: '0.25rem' }}>
                            {Object.entries(value.fields).map(([fieldKey, fieldDesc]: [string, any]) => (
                              <div key={fieldKey} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem', fontSize: '0.75rem' }}>
                                <span style={{ fontWeight: 500, color: '#374151', minWidth: '5rem' }}>{fieldKey}:</span>
                                <span className={styles.configValue}>{fieldDesc}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  const handleExportConfig = async () => {
    try {
      const response = await fetch('/api/admin/config/export')
      if (response.ok) {
        const blob = await response.blob()
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

    const formData = new FormData()
    formData.append('file', file)

    const uploadConfig = async () => {
      try {
        const response = await fetch('/api/admin/config/import', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          toast.success('配置导入成功，正在刷新页面...')
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

    const confirmed = window.confirm('确定要导入配置吗？这将覆盖当前的配置版本。')
    
    if (confirmed) {
      uploadConfig()
    }
  }

  const handleResetWebsite = async () => {
    if (!currentUser) {
      toast.error("未找到用户信息，请重新登录")
      return
    }

    const backupConfirmed = window.confirm(
      "⚠️ 一键还原网站配置\n\n" +
      "此操作将把所有配置还原到模版文件状态，建议先备份当前配置。\n\n" +
      "点击'确定'先下载配置备份，点击'取消'放弃操作。"
    )

    if (!backupConfirmed) {
      return
    }

    await handleExportConfig()

    const resetConfirmed = window.confirm(
      "✅ 配置已备份完成\n\n" +
      "现在可以安全地执行一键还原操作。\n\n" +
      "此操作将把所有配置还原到模版文件状态，无法恢复！\n\n" +
      "点击'确定'继续还原，点击'取消'放弃操作。"
    )

    if (!resetConfirmed) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/reset-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: currentUser.username
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("网站配置已成功还原到初始状态")
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast.error(data.message || "还原失败")
      }
    } catch (error) {
      toast.error("还原失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const renderSystemManagement = () => {
    return (
      <div className={styles.content}>
        <Card
          title={
            <div className={styles.configItem}>
              <IconSettings style={{ color: '#2563eb' }} />
              <span className={styles.cardTitle}>系统管理</span>
            </div>
          }
        >
          <div className={styles.configContent}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>性能配置</h3>
              <div className={styles.configContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h4 className={styles.configLabel} style={{ marginBottom: '0.25rem' }}>配置缓存</h4>
                    <p className={styles.configValue}>启用配置缓存可以提高系统性能，但可能导致配置更新延迟</p>
                  </div>
                  <Switch
                    checked={configs.site?.cache?.enabled ?? true}
                    onChange={async (checked: boolean) => {
                      try {
                        const updatedConfig = {
                          ...configs.site,
                          cache: {
                            ...configs.site?.cache,
                            enabled: checked
                          }
                        }
                        
                        const response = await fetch('/api/admin/config', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            type: 'site',
                            data: updatedConfig
                          })
                        })
                        
                        if (response.ok) {
                          toast.success(checked ? '配置缓存已启用' : '配置缓存已禁用')
                          await fetchConfigs()
                        } else {
                          toast.error('更新配置失败')
                        }
                      } catch (error) {
                        toast.error('更新配置失败')
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1rem' }}>配置管理</h3>
              <div className={styles.configContent}>
                <p className={styles.configValue}>通过以下功能可以导出或导入配置，用于备份和恢复系统配置。</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button
                    type="primary"
                    icon={<IconExport />}
                    onClick={handleExportConfig}
                  >
                    导出配置
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleImportConfig}
                      style={{ display: 'none' }}
                      id="config-import"
                    />
                    <label
                      htmlFor="config-import"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 1rem', border: '1px solid transparent', fontSize: '0.875rem', fontWeight: 500, borderRadius: '0.375rem', color: 'white', backgroundColor: '#374151', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                      <IconFile style={{ marginRight: '0.5rem' }} />
                      导入配置
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '2px solid #fecaca' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: '1rem', color: '#991b1b' }}>危险区域</h3>
              <div className={styles.configContent}>
                <Alert
                  type="error"
                  title="警告"
                  content="以下操作具有破坏性，请谨慎使用。建议在执行前先导出配置备份。"
                  className={styles.alertWarning}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button
                    status="danger"
                    icon={<IconUndo />}
                    onClick={handleResetWebsite}
                    loading={loading}
                    style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                  >
                    一键还原网站
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" richColors />

      <div className={styles.container}>
        {mustChangePassword && (
          <div style={{ backgroundColor: '#fef2f2', borderBottom: '2px solid #f87171' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ flexShrink: 0 }}>
                  <svg style={{ height: '1.5rem', width: '1.5rem', color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#991b1b', marginBottom: '0.25rem' }}>
                    安全提示
                  </h3>
                  <p style={{ color: '#b91c1c', marginBottom: '0.5rem' }}>
                    这是您首次登录，请立即修改密码以确保账户安全。
                  </p>
                </div>
                <Button
                  type="primary"
                  status="danger"
                  onClick={() => setShowChangePassword(true)}
                  style={{ flexShrink: 0 }}
                >
                  立即修改密码
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className={styles.header}>
          <div style={{ padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
              <div className={styles.headerLeft}>
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h1 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>管理后台</h1>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>|</span>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>创客AI</p>
                </div>
              </div>
              <div className={styles.headerRight}>
                <Dropdown
                  droplist={
                    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ width: '10rem', height: '10rem', background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e5e7eb' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '8rem', height: '8rem', backgroundColor: 'white', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>客服二维码</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>技术问题可扫码联系客服</p>
                    </div>
                  }
                  trigger="hover"
                  position="br"
                >
                  <Button
                    type="text"
                    style={{ color: '#374151' }}
                    icon={<IconCustomerService />}
                  >
                    联系客服
                  </Button>
                </Dropdown>
                <Button
                  type="text"
                  style={{ color: '#374151' }}
                  icon={<IconQuestionCircle />}
                  onClick={() => window.open('https://help.makerai.com', '_blank')}
                >
                  帮助文档
                </Button>
                <Button
                  style={{ backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' }}
                  onClick={() => window.open('/', '_blank')}
                >
                  打开官网
                </Button>
                <Button
                  style={{ backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' }}
                  icon={<IconLock />}
                  onClick={() => setShowChangePassword(true)}
                >
                  修改密码
                </Button>
                <Button
                  style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                  icon={<IconExport />}
                  onClick={handleLogout}
                >
                  退出登录
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 4rem)' }}>
          <div className={`${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebar}`}>
            <div style={{ height: '100%', overflowY: 'auto' }}>
              <div style={{ padding: '1rem' }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {/* 控制台 */}
                  <button
                    onClick={() => handleMenuClick('accountInfo')}
                    className={`${styles.menuItem} ${activeMenu === 'accountInfo' ? styles.menuItemActive : ''}`}
                  >
                    <IconUser className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>控制台</span>}
                  </button>

                  <div style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                    {!sidebarCollapsed && (
                      <div style={{ padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        站点管理
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleMenuClick('site')}
                    className={`${styles.menuItem} ${activeMenu === 'site' ? styles.menuItemActive : ''}`}
                  >
                    <IconHome className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>站点基础配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('account')}
                    className={`${styles.menuItem} ${activeMenu === 'account' ? styles.menuItemActive : ''}`}
                  >
                    <IconUser className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>站点账号配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('navigation')}
                    className={`${styles.menuItem} ${activeMenu === 'navigation' ? styles.menuItemActive : ''}`}
                  >
                    <IconNav className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>顶部导航配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('footer')}
                    className={`${styles.menuItem} ${activeMenu === 'footer' ? styles.menuItemActive : ''}`}
                  >
                    <IconFile className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>底部页脚配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('seo')}
                    className={`${styles.menuItem} ${activeMenu === 'seo' ? styles.menuItemActive : ''}`}
                  >
                    <IconCode className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>站点SEO配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('common')}
                    className={`${styles.menuItem} ${activeMenu === 'common' ? styles.menuItemActive : ''}`}
                  >
                    <IconStorage className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>站点版本配置</span>}
                  </button>

                  <div style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                    {!sidebarCollapsed && (
                      <div style={{ padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        页面管理
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <button
                      onClick={() => handleMenuClick('home')}
                      className={`${styles.menuItem} ${activeMenu === 'home' ? styles.menuItemActive : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <IconHome className={styles.menuIcon} />
                        {!sidebarCollapsed && <span className={styles.menuText}>首页区块管理</span>}
                      </div>
                    </button>
                    <div style={{ paddingLeft: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <button
                        onClick={() => handleMenuClick('homeOrder')}
                        className={`${styles.menuItem} ${activeMenu === 'homeOrder' ? styles.menuItemActive : ''}`}
                      >
                        {!sidebarCollapsed && <span className={styles.menuText}>区块顺序</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeBanner')}
                        className={`${styles.menuItem} ${activeMenu === 'homeBanner' ? styles.menuItemActive : ''}`}
                      >
                        {!sidebarCollapsed && <span className={styles.menuText}>[区块]Banner信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homePartners')}
                        className={`${styles.menuItem} ${activeMenu === 'homePartners' ? styles.menuItemActive : ''}`}
                      >
                        {!sidebarCollapsed && <span className={styles.menuText}>[区块]伙伴信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeProducts')}
                        className={`${styles.menuItem} ${activeMenu === 'homeProducts' ? styles.menuItemActive : ''}`}
                      >
                        {!sidebarCollapsed && <span className={styles.menuText}>[区块]产品信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeServices')}
                        className={`${styles.menuItem} ${activeMenu === 'homeServices' ? styles.menuItemActive : ''}`}
                      >
                        {!sidebarCollapsed && <span className={styles.menuText}>[区块]服务信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homePricing')}
                        className={`${styles.menuItem} ${activeMenu === 'homePricing' ? styles.menuItemActive : ''}`}
                      >
                        {!sidebarCollapsed && <span className={styles.menuText}>[区块]价格信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeAbout')}
                        className={`${styles.menuItem} ${activeMenu === 'homeAbout' ? styles.menuItemActive : ''}`}
                      >
                        {!sidebarCollapsed && <span className={styles.menuText}>[区块]关于我们</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeContact')}
                        className={`${styles.menuItem} ${activeMenu === 'homeContact' ? styles.menuItemActive : ''}`}
                      >
                        {!sidebarCollapsed && <span className={styles.menuText}>[区块]联系我们</span>}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMenuClick('products')}
                    className={`${styles.menuItem} ${activeMenu === 'products' ? styles.menuItemActive : ''}`}
                  >
                    <IconTrophy className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>产品列表配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('otherPages')}
                    className={`${styles.menuItem} ${activeMenu === 'otherPages' ? styles.menuItemActive : ''}`}
                  >
                    <IconFile className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>自定义页面配置</span>}
                  </button>

                  <button
                    onClick={() => router.push('/admin/articles')}
                    className={`${styles.menuItem} ${activeMenu === 'articles' ? styles.menuItemActive : ''}`}
                  >
                    <IconFile className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>文章管理</span>}
                  </button>

                  <div style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                    {!sidebarCollapsed && (
                      <div style={{ padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        主题管理
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleMenuClick('theme')}
                    className={`${styles.menuItem} ${activeMenu === 'theme' ? styles.menuItemActive : ''}`}
                  >
                    <IconSettings className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>主题皮肤选择</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('custom')}
                    className={`${styles.menuItem} ${activeMenu === 'custom' ? styles.menuItemActive : ''}`}
                  >
                    <IconSettings className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>主题个性化配置</span>}
                  </button>

                  <div style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                    {!sidebarCollapsed && (
                      <div style={{ padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        系统管理
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleMenuClick('system')}
                    className={`${styles.menuItem} ${activeMenu === 'system' ? styles.menuItemActive : ''}`}
                  >
                    <IconSettings className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>配置管理</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('operationLogs')}
                    className={`${styles.menuItem} ${activeMenu === 'operationLogs' ? styles.menuItemActive : ''}`}
                  >
                    <IconClockCircle className={styles.menuIcon} />
                    {!sidebarCollapsed && <span className={styles.menuText}>操作记录</span>}
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className={styles.mainContent}>
            <div style={{ padding: '2rem', height: '100%' }}>
              {activeMenu === 'accountInfo' && (
                <Card>
                  {currentUser && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.5rem' }}>
                      <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                          <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>当前账号</p>
                            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>{currentUser.username}</p>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                          当前登录的管理员账号
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">上次登录</p>
                            <p className="text-lg font-bold text-gray-900">
                              {currentUser.lastLoginTime || '首次登录'}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          上次成功登录的时间
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">当前IP</p>
                            <p className="text-lg font-bold text-gray-900 font-mono">
                              {currentUser.currentLoginIP || '未知'}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          当前登录的IP地址
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {activeMenu === 'site' && renderConfigCard(
                "站点基础配置",
                "site",
                "包含网站名称、描述、联系方式等基础信息"
              )}

              {activeMenu === 'common' && renderConfigCard(
                "站点版本配置",
                "common",
                "包含版本号、最后更新时间等通用配置"
              )}

              {activeMenu === 'account' && renderConfigCard(
                "站点账号配置",
                "account",
                "包含管理员账号、普通用户账号等站点账号配置"
              )}

              {activeMenu === 'navigation' && renderConfigCard(
                "顶部导航配置",
                "navigation",
                "包含主导航、侧边栏导航等导航配置"
              )}

              {activeMenu === 'footer' && renderConfigCard(
                "底部页脚配置",
                "footer",
                "包含页脚描述、社交链接、公司信息等页脚配置"
              )}

              {activeMenu === 'home' && renderConfigCard(
                "首页区块管理",
                "home",
                "管理首页各个区块的整体配置"
              )}

              {activeMenu === 'homeOrder' && renderConfigCard(
                "区块顺序",
                "homeOrder",
                "配置首页区块的显示顺序"
              )}

              {activeMenu === 'homeBanner' && renderConfigCard(
                "[区块]Banner信息",
                "homeBanner",
                "配置首页Banner区域的内容"
              )}

              {activeMenu === 'homePartners' && renderConfigCard(
                "[区块]伙伴信息",
                "homePartners",
                "配置首页伙伴信息区域的内容"
              )}

              {activeMenu === 'homeProducts' && renderConfigCard(
                "[区块]产品信息",
                "homeProducts",
                "配置首页产品信息区域的内容"
              )}

              {activeMenu === 'homeServices' && renderConfigCard(
                "[区块]服务信息",
                "homeServices",
                "配置首页服务信息区域的内容"
              )}

              {activeMenu === 'homePricing' && renderConfigCard(
                "[区块]价格信息",
                "homePricing",
                "配置首页价格信息区域的内容"
              )}

              {activeMenu === 'homeAbout' && renderConfigCard(
                "[区块]关于我们",
                "homeAbout",
                "配置首页关于我们区域的内容"
              )}

              {activeMenu === 'homeContact' && renderConfigCard(
                "[区块]联系我们",
                "homeContact",
                "配置首页联系我们区域的内容"
              )}

              {activeMenu === 'products' && renderConfigCard(
                "产品列表配置",
                "products",
                "包含产品分类、产品列表等产品列表配置"
              )}

              {activeMenu === 'seo' && renderConfigCard(
                "站点SEO配置",
                "seo",
                "包含全局SEO、产品页面SEO等搜索引擎优化配置"
              )}

              {activeMenu === 'custom' && renderConfigCard(
                "主题个性化配置",
                "custom",
                "包含主题、功能开关等个性化配置"
              )}

              {activeMenu === 'theme' && (
                <Card title="主题皮肤选择">
                  <div className="mb-6">
                    <p className="text-sm text-gray-500">选择您喜欢的主题皮肤，不同主题有不同的配色方案和布局风格。</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {configs.theme && configs.theme.themes && Object.entries(configs.theme.themes).map(([key, theme]: [string, any]) => (
                      <div
                        key={key}
                        className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                          configs.theme.currentTheme === key
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleThemeChange(key)}
                      >
                        {configs.theme.currentTheme === key && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <div 
                            className="w-full h-24 rounded-lg mb-3"
                            style={{
                              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
                            }}
                          />
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{theme.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
                        
                        <div className="flex gap-2 flex-wrap">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: theme.colors.primary }}
                            title="主色"
                          />
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: theme.colors.secondary }}
                            title="辅助色"
                          />
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: theme.colors.accent }}
                            title="强调色"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {activeMenu === 'otherPages' && renderConfigCard(
                "自定义页面配置",
                "otherPages",
                "包含关于我们、服务条款、隐私政策等其他页面配置"
              )}

              {activeMenu === 'system' && renderSystemManagement()}

              {activeMenu === 'operationLogs' && (
                <Card title="操作记录">
                  <div className="mb-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            系统最多保留最近50条操作记录，超出后将自动删除最早的记录。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {operationLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">暂无操作记录</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                            <th className="text-center py-5 px-8 font-bold text-gray-800 text-base min-w-[120px]">用户名</th>
                            <th className="text-center py-5 px-8 font-bold text-gray-800 text-base min-w-[140px]">操作类型</th>
                            <th className="text-center py-5 px-8 font-bold text-gray-800 text-base min-w-[200px]">描述</th>
                            <th className="text-center py-5 px-8 font-bold text-gray-800 text-base min-w-[150px]">IP地址</th>
                            <th className="text-center py-5 px-8 font-bold text-gray-800 text-base min-w-[180px]">时间</th>
                          </tr>
                        </thead>
                        <tbody>
                          {operationLogs.map((log, index) => (
                            <tr key={log.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                              <td className="py-5 px-8">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {log.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-gray-900 font-medium">{log.username}</span>
                                </div>
                              </td>
                              <td className="py-5 px-8">
                                <span className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${log.type === 'login' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                    log.type === 'update_config' ? 'bg-green-100 text-green-700 border border-green-200' :
                                      log.type === 'change_password' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                        'bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}>
                                  {log.type === 'login' ? '🔐 登录' :
                                    log.type === 'update_config' ? '⚙️ 更新配置' :
                                      log.type === 'change_password' ? '🔑 修改密码' :
                                        log.type}
                                </span>
                              </td>
                              <td className="py-5 px-8 text-gray-700">{log.description}</td>
                              <td className="py-5 px-8">
                                <span className="inline-flex items-center gap-1 text-gray-600 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                  </svg>
                                  {log.ip}
                                </span>
                              </td>
                              <td className="py-5 px-8">
                                <span className="text-gray-600 text-xs">{log.timestamp}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
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
          <div id="edit-config-container" className="flex gap-0 relative" style={{ maxHeight: '65vh' }}>
            <div style={{ width: showFieldDescription ? `${editLeftWidth}%` : '100%' }} className="flex-shrink-0 overflow-auto">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
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
                  <div className="flex items-center gap-2">
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
                    className="mb-2"
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
                    className="font-mono"
                    status={jsonError ? "error" : undefined}
                  />
                )}


              </div>
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 " style={{
                position: 'absolute',
                bottom: '-70px',
                left: '10px'
              }}>
                <span className="text-xs text-gray-500">输入框高度：</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="mini"
                    onClick={() => setTextareaRows(Math.max(15, textareaRows - 5))}
                    disabled={textareaRows <= 15}
                  >
                    - 5行
                  </Button>
                  <span className="text-xs text-gray-600 min-w-[60px] text-center">{textareaRows} 行</span>
                  <Button
                    size="mini"
                    onClick={() => setTextareaRows(Math.min(50, textareaRows + 5))}
                    disabled={textareaRows >= 50}
                  >
                    + 5行
                  </Button>
                </div>
                <div className="flex items-center gap-1">
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
                  className={`flex-shrink-0 w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors relative group ${isEditDragging ? 'bg-blue-500' : ''}`}
                  onMouseDown={handleEditMouseDown}
                  style={{ margin: '0 8px' }}
                >
                  <div className="absolute inset-y-0 -left-1 -right-1" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-gray-300 rounded group-hover:bg-blue-500 transition-colors" />
                </div>

                <div style={{ width: `${100 - editLeftWidth}%` }} className="flex-shrink-0 overflow-auto">
                  {editingConfig && schema[editingConfig] && (
                    <Card
                      title={
                        <div className="flex items-center gap-2">
                          <IconInfoCircle className="text-blue-600" />
                          <span className="text-base font-semibold">字段说明</span>
                        </div>
                      }
                    >
                      <div className="space-y-3" style={{ maxHeight: '60vh', overflow: 'auto' }}>
                        {Object.entries(schema[editingConfig]).map(([key, value]: [string, any]) => (
                          <div key={key} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">{key}</h4>
                              {value.required && (
                                <span className="px-1.5 py-0.5 text-xs bg-red-50 text-red-600 rounded">必填</span>
                              )}
                              {value.type && (
                                <span className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">{value.type}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{value.description}</p>
                            {value.fields && (
                              <div className="ml-2 mt-1 space-y-0.5">
                                {Object.entries(value.fields).map(([fieldKey, fieldDesc]: [string, any]) => (
                                  <div key={fieldKey} className="flex items-start gap-1 text-xs">
                                    <span className="font-medium text-gray-700 min-w-[80px]">{fieldKey}:</span>
                                    <span className="text-gray-600">{fieldDesc}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
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
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">
                配置内容（只读）
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
            <div className="flex items-center gap-2">
              <IconHistory className="text-blue-600" />
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
            <div className="flex justify-end gap-2">
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
          <div className="mb-4">
            {previousVersionInfo && (
              <Alert
                type="info"
                content={`版本时间：${new Date(previousVersionInfo.createdAt).toLocaleString('zh-CN')}`}
                className="mb-4"
              />
            )}

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
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
          okText="确认修改"
          cancelText="取消"
          okButtonProps={{ loading: changePasswordLoading }}
          style={{ width: 500 }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原密码
              </label>
              <Input.Password
                placeholder="请输入原密码"
                value={oldPassword}
                onChange={setOldPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新密码
              </label>
              <Input.Password
                placeholder="请输入新密码（至少8位）"
                value={newPassword}
                onChange={setNewPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码
              </label>
              <Input.Password
                placeholder="请再次输入新密码"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
