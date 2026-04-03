"use client"

import { useState, useEffect } from "react"
import { Button, Card, Input, Select, Message } from "@arco-design/web-react"
import { IconSave, IconSettings } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "./api-config.module.css"

const LLM_OPTIONS = [
  { label: "Qwen/Qwen3.5-122B-A10B", value: "Qwen/Qwen3.5-122B-A10B" },
]

interface ApiConfigData {
  apiKey: string
  baseUrl: string
}

const DEFAULT_CONFIG: ApiConfigData = {
  apiKey: "",
  baseUrl: "https://api.siliconflow.cn/v1",
}

export function ApiConfig() {
  const [config, setConfig] = useState<ApiConfigData>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/geo-tools/api-config")
      const result = await response.json()
      if (result.success && result.data) {
        setConfig({
          ...DEFAULT_CONFIG,
          apiKey: result.data.apiKey || "",
          baseUrl: result.data.baseUrl || "https://api.siliconflow.cn/v1",
        })
      }
    } catch (error) {
      console.error("获取配置失败:", error)
      toast.error("获取配置失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config.apiKey.trim()) {
      toast.warning("请输入API密钥")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/geo-tools/api-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success("配置保存成功")
      } else {
        toast.error(result.message || "保存失败")
      }
    } catch (error) {
      console.error("保存配置失败:", error)
      toast.error("保存失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <Card
        title={
          <div className={styles.cardTitle}>
            <IconSettings className={styles.titleIcon} />
            <span>API配置</span>
          </div>
        }
        className={styles.configCard}
        loading={loading}
      >
        <div className={styles.form}>
          <div className={styles.formItem}>
            <label className={styles.label}>
              API 密钥 <span className={styles.required}>*</span>
            </label>
            <Input.Password
              value={config.apiKey}
              onChange={(value) => setConfig({ ...config, apiKey: value })}
              placeholder="请输入您的 API 密钥"
              className={styles.input}
            />
            <div className={styles.hint}>
              您的 API 密钥将被安全存储，仅用于文章生成调用
            </div>
          </div>

          <div className={styles.formItem}>
            <label className={styles.label}>API 基础地址</label>
            <Input
              value={config.baseUrl}
              onChange={(value) => setConfig({ ...config, baseUrl: value })}
              placeholder="https://api.siliconflow.cn/v1"
              className={styles.input}
            />
            <div className={styles.hint}>
              默认使用硅基流动 API 地址，如需使用其他服务请修改
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              type="primary"
              icon={<IconSave />}
              loading={saving}
              onClick={handleSave}
              className={styles.saveButton}
            >
              保存配置
            </Button>
          </div>
        </div>
      </Card>

      <Card title="使用说明" className={styles.helpCard}>
        <div className={styles.helpContent}>
          <h4>如何获取 API 密钥</h4>
          <ol>
            <li>访问硅基流动官网：https://siliconflow.cn</li>
            <li>注册并登录您的账号</li>
            <li>进入控制台，找到 API 密钥管理</li>
            <li>创建新的 API 密钥并复制</li>
            <li>将密钥粘贴到上方的输入框中保存</li>
          </ol>

          <h4>支持的模型</h4>
          <ul>
            <li>DeepSeek-V2.5 - 深度求索大模型</li>
            <li>Qwen2.5 - 阿里通义千问</li>
            <li>以及其他 SiliconFlow 支持的模型</li>
          </ul>

          <h4>注意事项</h4>
          <ul>
            <li>请妥善保管您的 API 密钥，不要泄露给他人</li>
            <li>文章生成会消耗 API 调用额度，请注意用量</li>
            <li>如遇到问题，请检查 API 密钥是否正确且额度充足</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
