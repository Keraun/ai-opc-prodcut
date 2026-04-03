"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Card, Modal, Input, Tag, Tooltip } from "@arco-design/web-react"
import { toast } from "sonner"
import { ExternalLink, Edit, Trash2, Copy, Info, RefreshCw, X } from "lucide-react"
import styles from "./cookie-manager.module.css"

interface CookieData {
  siteId: string
  name: string
  url: string
  cookies: string
  updatedAt: string
  expiresAt?: string
}

interface ExtractionStatus {
  status: "idle" | "initializing" | "waiting" | "extracting" | "completed" | "error"
  sessionId: string | null
  error: string | null
}

interface ValidationStatus {
  status: "idle" | "initializing" | "validating" | "completed" | "error"
  sessionId: string | null
  isValid: boolean | null
  error: string | null
}

const LLM_SITES = [
  { id: "deepseek", name: "DeepSeek", url: "https://chat.deepseek.com/", description: "DeepSeek AI 深度求索" },
  { id: "openai", name: "OpenAI (ChatGPT)", url: "https://chat.openai.com/", description: "OpenAI 对话模型" },
  { id: "doubao", name: "豆包", url: "https://www.doubao.com/", description: "字节跳动大模型" },
  { id: "kimi", name: "Kimi", url: "https://kimi.moonshot.cn/", description: "月之暗面大模型" },
  { id: "qwen", name: "通义千问", url: "https://tongyi.aliyun.com/", description: "阿里云大语言模型" },
  { id: "zhipu", name: "智谱AI (GLM)", url: "https://chatglm.cn/", description: "智谱清言对话模型" },
  { id: "minimax", name: "MiniMax", url: "https://www.minimaxi.com/", description: "MiniMax 大模型" },
  { id: "claude", name: "Claude (Anthropic)", url: "https://claude.ai/", description: "Anthropic 对话模型" },
  { id: "wenxin", name: "文心一言", url: "https://yiyan.baidu.com/", description: "百度文心大模型" },
]

export function CookieManager() {
  const [cookiesData, setCookiesData] = useState<Record<string, CookieData>>({})
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null)
  const [tempCookieValue, setTempCookieValue] = useState("")
  const [extractionStatuses, setExtractionStatuses] = useState<Record<string, ExtractionStatus>>({})
  const [validationStatuses, setValidationStatuses] = useState<Record<string, ValidationStatus>>({})
  const [expiringSoon, setExpiringSoon] = useState<string[]>([])
  const pollingRef = useRef<Record<string, NodeJS.Timeout>>({})
  const validationPollingRef = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    fetchCookies()
  }, [])

  useEffect(() => {
    return () => {
      Object.values(pollingRef.current).forEach(clearInterval)
      Object.values(validationPollingRef.current).forEach(clearInterval)
    }
  }, [])

  const fetchCookies = async () => {
    try {
      const response = await fetch("/api/admin/geo-tools/cookies")
      const result = await response.json()
      if (result.success) {
        setCookiesData(result.data || {})
        checkExpiring(result.data || {})
      }
    } catch (error) {
      console.error("Fetch cookies error:", error)
    }
  }

  const checkExpiring = (data: Record<string, CookieData>) => {
    const expiring: string[] = []
    const now = new Date()
    
    Object.entries(data).forEach(([siteId, cookie]) => {
      if (cookie.expiresAt) {
        const expiresDate = new Date(cookie.expiresAt)
        const daysUntilExpiry = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
          expiring.push(siteId)
        }
      }
    })
    
    setExpiringSoon(expiring)
  }

  const saveCookiesToDb = async (newData: Record<string, CookieData>) => {
    try {
      const response = await fetch("/api/admin/geo-tools/cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
      })
      const result = await response.json()
      if (result.success) {
        setCookiesData(newData)
        checkExpiring(newData)
      }
    } catch (error) {
      console.error("Save cookies error:", error)
      toast.error("保存失败")
    }
  }

  const deleteCookieFromDb = async (siteId: string) => {
    try {
      const response = await fetch(`/api/admin/geo-tools/cookies?siteId=${siteId}`, {
        method: "DELETE"
      })
      const result = await response.json()
      if (result.success) {
        const newData = { ...cookiesData }
        delete newData[siteId]
        setCookiesData(newData)
        checkExpiring(newData)
      }
    } catch (error) {
      console.error("Delete cookie error:", error)
      toast.error("删除失败")
    }
  }

  const openSite = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const openEditModal = (siteId: string) => {
    setEditingSiteId(siteId)
    setTempCookieValue(cookiesData[siteId]?.cookies || "")
    setEditModalVisible(true)
  }

  const handleSaveCookie = () => {
    if (!editingSiteId) return

    const site = LLM_SITES.find(s => s.id === editingSiteId)
    if (!site) return

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const newData = {
      ...cookiesData,
      [editingSiteId]: {
        siteId: editingSiteId,
        name: site.name,
        url: site.url,
        cookies: tempCookieValue,
        updatedAt: new Date().toLocaleString("zh-CN"),
        expiresAt: expiresAt.toISOString()
      }
    }

    saveCookiesToDb(newData)
    setEditModalVisible(false)
    toast.success("Cookie 已保存")
  }

  const handleDeleteCookie = (siteId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个 Cookie 吗？",
      onOk: () => {
        deleteCookieFromDb(siteId)
        toast.success("Cookie 已删除")
      }
    })
  }

  const handleCopyCookie = (siteId: string) => {
    const data = cookiesData[siteId]
    if (data?.cookies) {
      navigator.clipboard.writeText(data.cookies)
        .then(() => toast.success("Cookie 已复制到剪贴板"))
        .catch(() => toast.error("复制失败"))
    } else {
      toast.warning("没有可复制的 Cookie")
    }
  }

  const startAutoExtraction = async (siteId: string, siteUrl: string) => {
    try {
      setExtractionStatuses(prev => ({
        ...prev,
        [siteId]: { status: "initializing", sessionId: null, error: null }
      }))

      const response = await fetch("/api/admin/geo-tools/cookie-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, siteUrl })
      })

      const result = await response.json()

      if (!result.success) {
        if (response.status === 501) {
          toast.warning(result.error || "服务器环境不支持自动抓取，请使用手动方式")
          openEditModal(siteId)
          setExtractionStatuses(prev => {
            const newStatuses = { ...prev }
            delete newStatuses[siteId]
            return newStatuses
          })
          return
        }
        throw new Error(result.error || "启动失败")
      }

      const sessionId = result.data.sessionId

      setExtractionStatuses(prev => ({
        ...prev,
        [siteId]: { status: "waiting", sessionId, error: null }
      }))

      toast.info("浏览器已启动，请在弹出的窗口中登录")

      pollingRef.current[siteId] = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/admin/geo-tools/cookie-extract?sessionId=${sessionId}`
          )
          const statusResult = await statusResponse.json()

          if (statusResult.success) {
            const { status, cookies, error } = statusResult.data

            setExtractionStatuses(prev => ({
              ...prev,
              [siteId]: { ...prev[siteId], status, error }
            }))

            if (status === "completed" && cookies) {
              clearInterval(pollingRef.current[siteId])
              delete pollingRef.current[siteId]

              const site = LLM_SITES.find(s => s.id === siteId)
              if (site) {
                const expiresAt = new Date()
                expiresAt.setDate(expiresAt.getDate() + 7)

                const newData = {
                  ...cookiesData,
                  [siteId]: {
                    siteId,
                    name: site.name,
                    url: site.url,
                    cookies,
                    updatedAt: new Date().toLocaleString("zh-CN"),
                    expiresAt: expiresAt.toISOString()
                  }
                }
                saveCookiesToDb(newData)
                toast.success("Cookie 已自动抓取并保存")
              }
            } else if (status === "error") {
              clearInterval(pollingRef.current[siteId])
              delete pollingRef.current[siteId]
              toast.error(error || "抓取失败")
            }
          }
        } catch (error) {
          console.error("Polling error:", error)
        }
      }, 2000)

    } catch (error) {
      console.error("Start extraction error:", error)
      setExtractionStatuses(prev => ({
        ...prev,
        [siteId]: { status: "error", sessionId: null, error: (error as Error).message }
      }))
      toast.error("启动自动抓取失败: " + (error as Error).message)
    }
  }

  const stopExtraction = async (siteId: string) => {
    const status = extractionStatuses[siteId]
    if (!status?.sessionId) return

    try {
      if (pollingRef.current[siteId]) {
        clearInterval(pollingRef.current[siteId])
        delete pollingRef.current[siteId]
      }

      await fetch(
        `/api/admin/geo-tools/cookie-extract?sessionId=${status.sessionId}`,
        { method: "DELETE" }
      )

      setExtractionStatuses(prev => {
        const newStatuses = { ...prev }
        delete newStatuses[siteId]
        return newStatuses
      })

      toast.success("抓取已停止")
    } catch (error) {
      console.error("Stop extraction error:", error)
      toast.error("停止失败")
    }
  }

  const validateCookie = async (siteId: string, siteUrl: string) => {
    const cookieData = cookiesData[siteId]
    if (!cookieData?.cookies) {
      toast.warning("没有可验证的 Cookie")
      return
    }

    try {
      if (validationPollingRef.current[siteId]) {
        clearInterval(validationPollingRef.current[siteId])
        delete validationPollingRef.current[siteId]
      }

      setValidationStatuses(prev => ({
        ...prev,
        [siteId]: {
          status: "initializing",
          sessionId: null,
          isValid: null,
          error: null
        }
      }))

      const response = await fetch("/api/admin/geo-tools/cookie-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          siteUrl,
          cookies: cookieData.cookies
        })
      })

      const result = await response.json()

      if (!result.success) {
        if (response.status === 501) {
          toast.error("服务器环境不支持浏览器自动化")
        } else {
          toast.error(result.message || "启动验证失败")
        }
        setValidationStatuses(prev => ({
          ...prev,
          [siteId]: {
            status: "error",
            sessionId: null,
            isValid: null,
            error: result.message || "启动验证失败"
          }
        }))
        return
      }

      const sessionId = result.data.sessionId

      setValidationStatuses(prev => ({
        ...prev,
        [siteId]: {
          status: "initializing",
          sessionId,
          isValid: null,
          error: null
        }
      }))

      toast.success("浏览器已启动，请在浏览器窗口中查看登录状态")

      validationPollingRef.current[siteId] = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/admin/geo-tools/cookie-validate?sessionId=${sessionId}`
          )
          const statusResult = await statusResponse.json()

          if (statusResult.success) {
            const { status, isValid, error } = statusResult.data

            setValidationStatuses(prev => ({
              ...prev,
              [siteId]: {
                status,
                sessionId,
                isValid,
                error
              }
            }))

            if (status === "completed") {
              clearInterval(validationPollingRef.current[siteId])
              delete validationPollingRef.current[siteId]
              
              if (isValid) {
                toast.success("Cookie 验证成功，登录状态正常")
              } else {
                toast.error("Cookie 已失效，请重新获取")
              }
            } else if (status === "error") {
              clearInterval(validationPollingRef.current[siteId])
              delete validationPollingRef.current[siteId]
              toast.error(error || "验证失败")
            }
          }
        } catch (error) {
          console.error("Poll validation status error:", error)
        }
      }, 2000)

    } catch (error) {
      console.error("Validate cookie error:", error)
      toast.error("验证失败")
      setValidationStatuses(prev => ({
        ...prev,
        [siteId]: {
          status: "error",
          sessionId: null,
          isValid: null,
          error: "验证失败"
        }
      }))
    }
  }

  const stopValidation = async (siteId: string) => {
    const validationStatus = validationStatuses[siteId]
    if (!validationStatus?.sessionId) return

    try {
      if (validationPollingRef.current[siteId]) {
        clearInterval(validationPollingRef.current[siteId])
        delete validationPollingRef.current[siteId]
      }

      await fetch(
        `/api/admin/geo-tools/cookie-validate?sessionId=${validationStatus.sessionId}`,
        { method: "DELETE" }
      )

      setValidationStatuses(prev => {
        const newStatuses = { ...prev }
        delete newStatuses[siteId]
        return newStatuses
      })

      toast.success("验证已停止")
    } catch (error) {
      console.error("Stop validation error:", error)
      toast.error("停止失败")
    }
  }

  const getStatusText = (status: ExtractionStatus["status"]) => {
    const statusMap = {
      idle: "未开始",
      initializing: "正在启动浏览器...",
      waiting: "等待登录中...",
      extracting: "正在提取Cookie...",
      completed: "已完成",
      error: "出错"
    }
    return statusMap[status]
  }

  const getStatusColor = (status: ExtractionStatus["status"]) => {
    const colorMap: Record<string, string> = {
      idle: "gray",
      initializing: "orange",
      waiting: "blue",
      extracting: "cyan",
      completed: "green",
      error: "red"
    }
    return colorMap[status]
  }

  const getExpiryTag = (siteId: string, expiresAt?: string) => {
    if (!expiresAt) return null
    
    const now = new Date()
    const expiresDate = new Date(expiresAt)
    const daysUntilExpiry = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry <= 0) {
      return <Tag color="red" size="small">已过期</Tag>
    } else if (daysUntilExpiry <= 3) {
      return <Tag color="orange" size="small">即将过期</Tag>
    } else if (daysUntilExpiry <= 7) {
      return <Tag color="blue" size="small">{daysUntilExpiry}天后过期</Tag>
    }
    return null
  }

  return (
    <div className={styles.container}>
      {expiringSoon.length > 0 && (
        <div className={styles.warningCard}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <span>Cookie 即将过期提醒</span>
          </div>
          <div className={styles.warningText}>
            以下网站的 Cookie 将在3天内过期，请及时更新：
            {expiringSoon.map(id => {
              const site = LLM_SITES.find(s => s.id === id)
              return site ? site.name : id
            }).join("、")}
          </div>
        </div>
      )}

      <div className={styles.introCard}>
        <div className={styles.introHeader}>
          <Info className={styles.introIcon} />
          <span className={styles.introTitle}>使用说明</span>
        </div>
        <p className={styles.introText}>
          点击下方大模型官网链接进行登录，登录后将浏览器中的 Cookie 复制并保存到这里，方便后续使用 Playwright 调用官网生成内容。
        </p>
      </div>

      <div className={styles.sitesGrid}>
        {LLM_SITES.map((site) => {
          const savedData = cookiesData[site.id]
          const hasCookie = !!savedData?.cookies

          return (
            <Card key={site.id} className={styles.siteCard}>
              <div className={styles.siteHeader}>
                <div className={styles.siteInfo}>
                  <div className={styles.siteName}>{site.name}</div>
                  <div className={styles.siteDesc}>{site.description}</div>
                </div>
                <div className={styles.siteStatus}>
                  {extractionStatuses[site.id]?.sessionId ? (
                    <Tag color={getStatusColor(extractionStatuses[site.id].status)} size="small">
                      {getStatusText(extractionStatuses[site.id].status)}
                    </Tag>
                  ) : hasCookie ? (
                    <>
                      <Tag color="green" size="small">已配置</Tag>
                      {getExpiryTag(site.id, savedData.expiresAt)}
                    </>
                  ) : (
                    <Tag color="gray" size="small">未配置</Tag>
                  )}
                </div>
              </div>

              <div className={styles.siteActions}>
                <Button
                  type="outline"
                  size="small"
                  icon={<ExternalLink size={16} />}
                  onClick={() => openSite(site.url)}
                >
                  打开官网
                </Button>
                
                {extractionStatuses[site.id]?.sessionId ? (
                  <Button
                    type="outline"
                    status="danger"
                    size="small"
                    icon={<X size={16} />}
                    onClick={() => stopExtraction(site.id)}
                  >
                    停止
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    status="success"
                    size="small"
                    icon={<RefreshCw size={16} />}
                    onClick={() => startAutoExtraction(site.id, site.url)}
                  >
                    自动抓取
                  </Button>
                )}
                
                <Button
                  type="primary"
                  size="small"
                  icon={<Edit size={16} />}
                  onClick={() => openEditModal(site.id)}
                >
                  {hasCookie ? "编辑" : "添加"}
                </Button>

                {hasCookie && (
                  <div className={styles.actionGroup}>
                    {validationStatuses[site.id]?.sessionId ? (
                      <Button
                        type="text"
                        size="small"
                        status="warning"
                        icon={<X size={16} />}
                        onClick={() => stopValidation(site.id)}
                      >
                        停止验证
                      </Button>
                    ) : (
                      <Button
                        type="text"
                        size="small"
                        onClick={() => validateCookie(site.id, site.url)}
                      >
                        验证 Cookie
                      </Button>
                    )}
                    <Tooltip content="复制 Cookie">
                      <Button
                        type="text"
                        size="small"
                        icon={<Copy size={16} />}
                        onClick={() => handleCopyCookie(site.id)}
                      />
                    </Tooltip>
                    <Tooltip content="删除">
                      <Button
                        type="text"
                        size="small"
                        status="danger"
                        icon={<Trash2 size={16} />}
                        onClick={() => handleDeleteCookie(site.id)}
                      />
                    </Tooltip>
                  </div>
                )}
              </div>

              {extractionStatuses[site.id]?.sessionId && (
                <div className={styles.extractionTip}>
                  请在弹出的浏览器窗口中完成登录
                </div>
              )}

              {validationStatuses[site.id]?.sessionId && (
                <div className={styles.extractionTip}>
                  {validationStatuses[site.id].status === "initializing" && "正在启动浏览器..."}
                  {validationStatuses[site.id].status === "validating" && "正在验证Cookie，请在浏览器窗口中查看登录状态"}
                  {validationStatuses[site.id].status === "completed" && (
                    <span style={{ color: validationStatuses[site.id].isValid ? "#52c41a" : "#f5222d" }}>
                      {validationStatuses[site.id].isValid ? "✓ Cookie验证成功" : "✗ Cookie已失效"}
                    </span>
                  )}
                  {validationStatuses[site.id].status === "error" && `验证失败: ${validationStatuses[site.id].error}`}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Modal
        title="编辑 Cookie"
        visible={editModalVisible}
        onOk={handleSaveCookie}
        onCancel={() => setEditModalVisible(false)}
        autoFocus={false}
        focusLock={true}
        style={{ width: 600 }}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalTip}>
            请在浏览器中打开官网并登录，然后按 F12 打开开发者工具，在 Application/存储 → Cookies 中复制 Cookie 内容。
          </div>
          <Input.TextArea
            value={tempCookieValue}
            onChange={setTempCookieValue}
            placeholder="请粘贴浏览器 Cookie 内容..."
            autoSize={{ minRows: 8, maxRows: 16 }}
          />
        </div>
      </Modal>
    </div>
  )
}
