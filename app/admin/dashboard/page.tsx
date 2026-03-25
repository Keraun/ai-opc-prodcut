"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Modal, Input, Alert, Dropdown } from "@arco-design/web-react"
import { IconSave, IconExport, IconEdit, IconLock, IconCheck, IconInfoCircle, IconEye, IconCustomerService, IconQuestionCircle, IconHistory, IconUndo, IconHome, IconSettings, IconUser, IconNav, IconFile, IconStorage, IconCode, IconTrophy, IconClockCircle } from "@arco-design/web-react/icon"
import { toast, Toaster } from "sonner"
import { compareJSON, getLineClass, hasChanges } from "@/lib/json-compare"
import { useTheme } from "@/components/theme-provider"

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
    <div className="bg-gray-50 rounded-lg overflow-auto font-mono text-sm" style={{ maxHeight }}>
      {lines.map((line, index) => {
        const lineNumber = index + 1
        const diffLine = diffLines?.find(d => d.lineNumber === lineNumber)
        const lineClass = diffLine ? getLineClass(diffLine.type) : ''

        return (
          <div key={index} className={`flex ${lineClass}`}>
            <div className="flex-shrink-0 w-12 px-2 py-0.5 text-right text-gray-400 select-none border-r border-gray-200 bg-gray-100">
              {lineNumber}
            </div>
            <div className="flex-1 px-4 py-0.5 whitespace-pre-wrap break-words">
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
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="mb-2 font-semibold text-gray-700">{oldTitle}</div>
        <div className="bg-gray-50 rounded-lg overflow-auto font-mono text-sm" style={{ maxHeight }}>
          {oldLines.map((line, index) => (
            <div key={index} className={`flex ${getLineClass(line.type)}`}>
              <div className="flex-shrink-0 w-12 px-2 py-0.5 text-right text-gray-400 select-none border-r border-gray-200 bg-gray-100">
                {line.lineNumber}
              </div>
              <div className="flex-1 px-4 py-0.5 whitespace-pre-wrap break-words">
                {line.content || ' '}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 font-semibold text-gray-700">{newTitle}</div>
        <div className="bg-gray-50 rounded-lg overflow-auto font-mono text-sm" style={{ maxHeight }}>
          {newLines.map((line, index) => (
            <div key={index} className={`flex ${getLineClass(line.type)}`}>
              <div className="flex-shrink-0 w-12 px-2 py-0.5 text-right text-gray-400 select-none border-r border-gray-200 bg-gray-100">
                {line.lineNumber}
              </div>
              <div className="flex-1 px-4 py-0.5 whitespace-pre-wrap break-words">
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
  const [activeMenu, setActiveMenu] = useState(() => {
    // 从URL查询参数中获取activeMenu，如果没有则使用默认值
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('menu') || 'accountInfo'
  })
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
    Modal.confirm({
      title: "确认还原",
      content: "确定要还原到上一版本吗？当前配置将被覆盖。",
      onOk: async () => {
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
    })
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
      <div id="config-container" className="flex gap-0 mb-4 relative" style={{ height: 'calc(100vh - 64px - 64px)' }}>
        <div style={{ width: showSchema ? `${leftWidth}%` : '100%' }} className="flex-shrink-0">
          <Card
            style={{ height: 'calc(100vh - 64px - 64px)' }}
            title={
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{title}</span>
                <div className="flex gap-2">
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
            <div className="mb-4">
              <p className="text-sm text-gray-500">{description}</p>
              {versionInfo && (
                <p className="text-xs text-gray-400 mt-1">
                  最后更新时间：{new Date(versionInfo.createdAt).toLocaleString('zh-CN')}
                </p>
              )}
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(configs[configType as keyof typeof configs], null, 2)}
            </pre>
          </Card>
        </div>

        {showSchema && (
          <>
            <div
              className={`flex-shrink-0 w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors relative group ${isDragging ? 'bg-blue-500' : ''}`}
              onMouseDown={handleMouseDown}
              style={{ margin: '0 8px' }}
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-gray-300 rounded group-hover:bg-blue-500 transition-colors" />
            </div>

            <div style={{ width: `${100 - leftWidth}%` }} className="flex-shrink-0">
              {schemaData && (
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <IconInfoCircle className="text-blue-600" />
                      <span className="text-lg font-semibold">字段说明</span>
                    </div>
                  }
                >
                  <div className="space-y-4 max-h-[500px] overflow-auto">
                    {Object.entries(schemaData).map(([key, value]: [string, any]) => (
                      <div key={key} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
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
    )
  }

  return (
    <>
      <Toaster position="top-center" richColors />

      <div className="min-h-screen bg-gray-50">
        {mustChangePassword && (
          <div className="bg-red-50 border-b-2 border-red-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-1">
                    安全提示
                  </h3>
                  <p className="text-red-700 mb-2">
                    这是您首次登录，请立即修改密码以确保账户安全。
                  </p>
                </div>
                <Button
                  type="primary"
                  status="danger"
                  onClick={() => setShowChangePassword(true)}
                  className="flex-shrink-0"
                >
                  立即修改密码
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-gray-900">管理后台</h1>
                  <span className="text-xs text-gray-400">|</span>
                  <p className="text-xs text-gray-500">创客AI</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Dropdown
                  droplist={
                    <div className="p-4 bg-white rounded-lg shadow-lg">
                      <div className="w-40 h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                        <div className="text-center">
                          <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-400">客服二维码</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-2">技术问题可扫码联系客服</p>
                    </div>
                  }
                  trigger="hover"
                  position="br"
                >
                  <Button
                    type="text"
                    className="!text-gray-700 hover:!text-blue-600 hover:!bg-blue-50"
                    icon={<IconCustomerService />}
                  >
                    联系客服
                  </Button>
                </Dropdown>
                <Button
                  type="text"
                  className="!text-gray-700 hover:!text-blue-600 hover:!bg-blue-50"
                  icon={<IconQuestionCircle />}
                  onClick={() => window.open('https://help.makerai.com', '_blank')}
                >
                  帮助文档
                </Button>
                <Button
                  className="!bg-blue-500 !text-white hover:!bg-blue-600 !border-blue-500"
                  onClick={() => window.open('/', '_blank')}
                >
                  打开官网
                </Button>
                <Button
                  className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 !border-gray-200"
                  icon={<IconLock />}
                  onClick={() => setShowChangePassword(true)}
                >
                  修改密码
                </Button>
                <Button
                  className="!bg-red-50 !text-red-600 hover:!bg-red-100 !border-red-200"
                  icon={<IconExport />}
                  onClick={handleLogout}
                >
                  退出登录
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 relative`}>
            <div className="h-full overflow-y-auto">
              <div className="p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => handleMenuClick('accountInfo')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'accountInfo'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconUser className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">控制台</span>}
                  </button>

                  <div className="pt-4 pb-2">
                    {!sidebarCollapsed && (
                      <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        站点管理
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleMenuClick('site')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'site'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconHome className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">站点基础配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('common')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'common'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconStorage className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">站点版本配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('account')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'account'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconUser className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">站点账号配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('navigation')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'navigation'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconNav className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">顶部导航配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('footer')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'footer'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconFile className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">底部页脚配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('seo')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'seo'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconCode className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">站点SEO配置</span>}
                  </button>

                  <div className="pt-4 pb-2">
                    {!sidebarCollapsed && (
                      <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        页面管理
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => handleMenuClick('home')}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'home'
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconHome className="text-lg flex-shrink-0" />
                        {!sidebarCollapsed && <span className="text-sm">首页区块管理</span>}
                      </div>
                    </button>
                    <div className="pl-10 space-y-1">
                      <button
                        onClick={() => handleMenuClick('homeOrder')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeMenu === 'homeOrder'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {!sidebarCollapsed && <span className="text-sm">区块顺序</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeBanner')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeMenu === 'homeBanner'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {!sidebarCollapsed && <span className="text-sm">[区块]Banner信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homePartners')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeMenu === 'homePartners'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {!sidebarCollapsed && <span className="text-sm">[区块]伙伴信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeProducts')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeMenu === 'homeProducts'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {!sidebarCollapsed && <span className="text-sm">[区块]产品信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeServices')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeMenu === 'homeServices'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {!sidebarCollapsed && <span className="text-sm">[区块]服务信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homePricing')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeMenu === 'homePricing'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {!sidebarCollapsed && <span className="text-sm">[区块]价格信息</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeAbout')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeMenu === 'homeAbout'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {!sidebarCollapsed && <span className="text-sm">[区块]关于我们</span>}
                      </button>
                      <button
                        onClick={() => handleMenuClick('homeContact')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeMenu === 'homeContact'
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {!sidebarCollapsed && <span className="text-sm">[区块]联系我们</span>}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMenuClick('products')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'products'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconTrophy className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">产品列表配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('otherPages')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'otherPages'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconFile className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">自定义页面配置</span>}
                  </button>

                  <div className="pt-4 pb-2">
                    {!sidebarCollapsed && (
                      <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        主题管理
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleMenuClick('custom')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'custom'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconSettings className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">主题个性化配置</span>}
                  </button>

                  <button
                    onClick={() => handleMenuClick('theme')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'theme'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconSettings className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">主题皮肤选择</span>}
                  </button>

                  <div className="pt-4 pb-2">
                    {!sidebarCollapsed && (
                      <div className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        系统管理
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleMenuClick('operationLogs')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenu === 'operationLogs'
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconClockCircle className="text-lg flex-shrink-0" />
                    {!sidebarCollapsed && <span className="text-sm">操作记录</span>}
                  </button>
                </nav>
              </div>
            </div>


          </div>

          <div className="flex-1 overflow-auto bg-gray-50 h-full">
            <div className="p-8 h-full">
              {activeMenu === 'accountInfo' && (
                <Card>
                  {currentUser && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">当前账号</p>
                            <p className="text-lg font-bold text-gray-900">{currentUser.username}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
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

              {activeMenu === 'operationLogs' && (
                <Card title="操作记录">
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
