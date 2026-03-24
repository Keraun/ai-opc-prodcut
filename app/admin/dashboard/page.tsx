"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Tabs, Message, Modal, Input, Alert } from "@arco-design/web-react"
import { IconSave, IconExport, IconEdit, IconLock, IconCheck, IconInfoCircle, IconEye } from "@arco-design/web-react/icon"

const TabPane = Tabs.TabPane

export default function AdminDashboardPage() {
  const router = useRouter()
  const [configs, setConfigs] = useState({
    site: {},
    common: {},
    seo: {},
    navigation: {},
    footer: {},
    pages: {},
    custom: {},
    account: {}
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
  const [editLeftWidth, setEditLeftWidth] = useState(60)
  const [isEditDragging, setIsEditDragging] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)

  useEffect(() => {
    fetchConfigs()
    fetchSchema()
    
    const currentUserStr = sessionStorage.getItem('currentUser')
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr)
      if (currentUser.mustChangePassword) {
        setMustChangePassword(true)
      }
    }
  }, [])

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

  const fetchConfigs = async () => {
    try {
      const response = await fetch("/api/admin/config")
      if (response.ok) {
        const data = await response.json()
        setConfigs(data)
      } else {
        Message.error("获取配置失败")
      }
    } catch (error) {
      Message.error("获取配置失败")
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
        Message.success("配置保存成功")
      } else {
        Message.error("配置保存失败")
      }
    } catch (error) {
      Message.error("配置保存失败")
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
        Message.success("退出成功")
        router.push("/admin")
      }
    } catch (error) {
      Message.error("退出失败")
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Message.error("请填写所有字段")
      return
    }

    if (newPassword !== confirmPassword) {
      Message.error("两次输入的新密码不一致")
      return
    }

    if (newPassword.length < 8) {
      Message.error("新密码长度至少为8位")
      return
    }

    const currentUserStr = sessionStorage.getItem('currentUser')
    if (!currentUserStr) {
      Message.error("未找到用户信息，请重新登录")
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
        Message.success("密码修改成功")
        setShowChangePassword(false)
        setMustChangePassword(false)
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        
        const updatedUser = {
          ...currentUser,
          mustChangePassword: false
        }
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser))
      } else {
        Message.error(data.message || "密码修改失败")
      }
    } catch (error) {
      Message.error("密码修改失败，请重试")
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
      Message.success("格式化成功")
    } catch (error: any) {
      const errorMessage = error.message || "JSON格式错误"
      setJsonError(errorMessage)
      Message.error("JSON格式错误，无法格式化")
    }
  }

  const handleEditValueChange = (value: string) => {
    setEditValue(value)
    validateJson(value)
  }

  const handleSaveEdit = () => {
    if (!validateJson(editValue)) {
      Message.error("JSON格式错误，请修正后再保存")
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
      Message.success("配置已更新，请点击保存按钮保存到文件")
    } catch (error) {
      Message.error("JSON格式错误")
    }
  }

  const renderConfigCard = (title: string, configType: string, description: string) => {
    const schemaData = schema[configType]
    
    return (
      <div id="config-container" className="flex gap-0 mb-4 relative" style={{ minHeight: '500px' }}>
        <div style={{ width: `${leftWidth}%` }} className="flex-shrink-0">
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{title}</span>
                <div className="flex gap-2">
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
                  >
                    保存
                  </Button>
                </div>
              </div>
            }
          >
            <div className="mb-4">
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(configs[configType as keyof typeof configs], null, 2)}
            </pre>
          </Card>
        </div>
        
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
      </div>
    )
  }

  return (
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">配置管理后台</h1>
            <div className="flex gap-2">
              <Button
                icon={<IconLock />}
                onClick={() => setShowChangePassword(true)}
              >
                修改密码
              </Button>
              <Button
                icon={<IconExport />}
                onClick={handleLogout}
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultActiveTab="site" type="card">
          <TabPane key="site" title="站点配置">
            {renderConfigCard(
              "站点配置",
              "site",
              "包含网站名称、描述、联系方式等基础信息"
            )}
          </TabPane>
          <TabPane key="common" title="通用配置">
            {renderConfigCard(
              "通用配置",
              "common",
              "包含版本号、最后更新时间等通用配置"
            )}
          </TabPane>
          <TabPane key="seo" title="SEO配置">
            {renderConfigCard(
              "SEO配置",
              "seo",
              "包含全局SEO、产品页面SEO等搜索引擎优化配置"
            )}
          </TabPane>
          <TabPane key="navigation" title="导航栏配置">
            {renderConfigCard(
              "导航栏配置",
              "navigation",
              "包含主导航、侧边栏导航等导航配置"
            )}
          </TabPane>
          <TabPane key="footer" title="页面Footer配置">
            {renderConfigCard(
              "页面Footer配置",
              "footer",
              "包含页脚描述、社交链接、公司信息等页脚配置"
            )}
          </TabPane>
          <TabPane key="pages" title="页面配置">
            {renderConfigCard(
              "页面配置",
              "pages",
              "包含产品页面、通用页面等页面配置"
            )}
          </TabPane>
          <TabPane key="custom" title="个性化配置">
            {renderConfigCard(
              "个性化配置",
              "custom",
              "包含主题、功能开关等个性化配置"
            )}
          </TabPane>
          <TabPane key="account" title="账号配置">
            {renderConfigCard(
              "账号配置",
              "account",
              "包含管理员账号、普通用户账号等账号配置"
            )}
          </TabPane>
        </Tabs>
      </div>

      <Modal
        title="编辑配置"
        visible={!!editingConfig}
        onCancel={() => {
          setEditingConfig(null)
          setJsonError("")
        }}
        onOk={handleSaveEdit}
        style={{ width: '90vw', maxWidth: 1200 }}
      >
        <div id="edit-config-container" className="flex gap-0 relative" style={{ maxHeight: '65vh' }}>
          <div style={{ width: `${editLeftWidth}%` }} className="flex-shrink-0 overflow-auto">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">
                  请直接编辑JSON配置内容
                </p>
                <Button
                  size="small"
                  icon={<IconCheck />}
                  onClick={handleFormatJson}
                >
                  格式化
                </Button>
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
              
              <Input.TextArea
                value={editValue}
                onChange={handleEditValueChange}
                rows={textareaRows}
                className="font-mono"
                status={jsonError ? "error" : undefined}
              />
              
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
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
          </div>
          
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
                Message.success("已复制到剪贴板")
              }}
            >
              复制
            </Button>
          </div>
          
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm font-mono whitespace-pre-wrap break-words" style={{ maxHeight: '60vh' }}>
            {viewValue}
          </pre>
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
  )
}
