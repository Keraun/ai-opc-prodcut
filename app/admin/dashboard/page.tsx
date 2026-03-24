"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Tabs, Message, Modal, Input, Alert } from "@arco-design/web-react"
import { IconSave, IconExport, IconEdit, IconLock, IconCheck } from "@arco-design/web-react/icon"

const TabPane = Tabs.TabPane

export default function AdminDashboardPage() {
  const router = useRouter()
  const [configs, setConfigs] = useState({
    site: {},
    common: {},
    pages: {},
    custom: {}
  })
  const [loading, setLoading] = useState(false)
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [jsonError, setJsonError] = useState<string>("")

  useEffect(() => {
    fetchConfigs()
  }, [])

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

  const renderConfigCard = (title: string, configType: string, description: string) => (
    <Card
      className="mb-4"
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{title}</span>
          <div className="flex gap-2">
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
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">配置管理后台</h1>
            <div className="flex gap-2">
              <Button
                icon={<IconLock />}
                onClick={() => router.push("/admin/change-password")}
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
              "包含SEO、导航、页脚等通用配置"
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
              "包含管理员账号、主题、功能开关等个性化配置"
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
        style={{ width: 800 }}
      >
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
            rows={20}
            className="font-mono"
            status={jsonError ? "error" : undefined}
          />
        </div>
      </Modal>
    </div>
  )
}
