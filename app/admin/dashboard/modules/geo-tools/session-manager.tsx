"use client"

import { useState, useEffect, useRef } from "react"
import { Button, Card, Modal, Input, Tag, Tooltip } from "@arco-design/web-react"
import { toast } from "sonner"
import { ExternalLink, Edit, Trash2, Copy, Info, RefreshCw, X } from "lucide-react"
import styles from "./session-manager.module.css"

interface SessionData {
  siteId: string
  name: string
  url: string
  sessionData: {
    cookies: string
    storage: Record<string, string>
  }
  sessionRules: {
    use_cookies: boolean
    storage_key: string[]
  }
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
  { id: "deepseek", name: "DeepSeek", url: "https://chat.deepseek.com/", description: "DeepSeek AI 深度求索", storageType: "localStorage", storageKey: ["userToken"] },
  { id: "openai", name: "OpenAI (ChatGPT)", url: "https://chat.openai.com/", description: "OpenAI 对话模型", storageType: "cookie", storageKey: [] },
  { id: "doubao", name: "豆包", url: "https://www.doubao.com/", description: "字节跳动大模型", storageType: "cookie", storageKey: [] },
  { id: "kimi", name: "Kimi", url: "https://kimi.moonshot.cn/", description: "月之暗面大模型", storageType: "cookie", storageKey: ["access_token", "refresh_token"] },
  { id: "qwen", name: "通义千问", url: "https://tongyi.aliyun.com/", description: "阿里云大语言模型", storageType: "cookie", storageKey: [] },
  { id: "zhipu", name: "智谱AI (GLM)", url: "https://chatglm.cn/", description: "智谱清言对话模型", storageType: "cookie", storageKey: [] },
  { id: "minimax", name: "MiniMax", url: "https://www.minimaxi.com/", description: "MiniMax 大模型", storageType: "cookie", storageKey: [] },
  { id: "claude", name: "Claude (Anthropic)", url: "https://claude.ai/", description: "Anthropic 对话模型", storageType: "cookie", storageKey: [] },
  { id: "wenxin", name: "文心一言", url: "https://yiyan.baidu.com/", description: "百度文心大模型", storageType: "cookie", storageKey: [] },
]

export function SessionManager() {
  const [sessionData, setSessionData] = useState<Record<string, SessionData>>({})
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null)
  const [tempCookieValue, setTempCookieValue] = useState("")
  const [tempStorageValue, setTempStorageValue] = useState<any>({})
  const [extractionStatuses, setExtractionStatuses] = useState<Record<string, ExtractionStatus>>({})
  const [validationStatuses, setValidationStatuses] = useState<Record<string, ValidationStatus>>({})
  const [expiringSoon, setExpiringSoon] = useState<string[]>([])
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [confirmData, setConfirmData] = useState<{ siteId: string, site: any, cookie_data: string | null, storage_data: Record<string, string> | null } | null>(null)
  const pollingRef = useRef<Record<string, NodeJS.Timeout>>({})
  const validationPollingRef = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    return () => {
      Object.values(pollingRef.current).forEach(clearInterval)
      Object.values(validationPollingRef.current).forEach(clearInterval)
    }
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/admin/geo-tools/cookies")
      const result = await response.json()
      if (result.success) {
        setSessionData(result.data || {})
        checkExpiring(result.data || {})
      }
    } catch (error) {
      console.error("Fetch sessions error:", error)
    }
  }

  const checkExpiring = (data: Record<string, SessionData>) => {
    const expiring: string[] = []
    const now = new Date()

    Object.entries(data).forEach(([siteId, session]) => {
      if (session.expiresAt) {
        const expiresDate = new Date(session.expiresAt)
        const daysUntilExpiry = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
          expiring.push(siteId)
        }
      }
    })

    setExpiringSoon(expiring)
  }

  const saveSessionsToDb = async (newData: Record<string, SessionData>) => {
    try {
      const response = await fetch("/api/admin/geo-tools/cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
      })
      const result = await response.json()
      if (result.success) {
        setSessionData(newData)
        checkExpiring(newData)
      }
    } catch (error) {
      console.error("Save sessions error:", error)
      toast.error("保存失败")
    }
  }

  const deleteSessionFromDb = async (siteId: string) => {
    try {
      const response = await fetch(`/api/admin/geo-tools/cookies?siteId=${siteId}`, {
        method: "DELETE"
      })
      const result = await response.json()
      if (result.success) {
        const newData = { ...sessionData }
        delete newData[siteId]
        setSessionData(newData)
        checkExpiring(newData)
      }
    } catch (error) {
      console.error("Delete session error:", error)
      toast.error("删除失败")
    }
  }

  const openSite = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const openEditModal = (siteId: string) => {
    setEditingSiteId(siteId)
    setTempCookieValue(sessionData[siteId]?.sessionData?.cookies || "")
    setTempStorageValue(sessionData[siteId]?.sessionData?.storage || {})
    setEditModalVisible(true)
  }

  const handleSaveSession = () => {
    if (!editingSiteId) return

    const site = LLM_SITES.find(s => s.id === editingSiteId)
    if (!site) return

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const newData = {
      ...sessionData,
      [editingSiteId]: {
        siteId: editingSiteId,
        name: site.name,
        url: site.url,
        sessionData: {
          cookies: tempCookieValue,
          storage: tempStorageValue
        },
        sessionRules: sessionData?.sessionRules || {
          use_cookies: false,
          storage_key: []
        },
        updatedAt: new Date().toLocaleString("zh-CN"),
        expiresAt: expiresAt.toISOString()
      }
    }

    saveSessionsToDb(newData)
    setEditModalVisible(false)
    toast.success("会话信息已保存")
  }

  const handleDeleteSession = (siteId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个会话信息吗？",
      onOk: () => {
        deleteSessionFromDb(siteId)
        toast.success("会话信息已删除")
      }
    })
  }

  const handleCopySession = (siteId: string) => {
    const data = sessionData[siteId]
    if (data?.sessionData?.cookies) {
      navigator.clipboard.writeText(data.sessionData.cookies)
        .then(() => toast.success("会话信息已复制到剪贴板"))
        .catch(() => toast.error("复制失败"))
    } else if (data?.sessionData?.storage && Object.keys(data.sessionData.storage).length > 0) {
      navigator.clipboard.writeText(JSON.stringify(data.sessionData.storage, null, 2))
        .then(() => toast.success("LocalStorage 数据已复制到剪贴板"))
        .catch(() => toast.error("复制失败"))
    } else {
      toast.warning("没有可复制的会话信息")
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
            const { status, cookies, storage_data, error } = statusResult.data

            setExtractionStatuses(prev => ({
              ...prev,
              [siteId]: { ...prev[siteId], status, error }
            }))

            if ((cookies || storage_data)) {
              const site = LLM_SITES.find(s => s.id === siteId)
              if (site) {
                // 更新确认数据
                setConfirmData({
                  siteId,
                  site,
                  cookie_data: cookies,
                  storage_data: storage_data
                })
                // 如果弹窗还没显示，显示弹窗
                if (!confirmModalVisible) {
                  setConfirmModalVisible(true)
                }
              }
            }

            if (status === "error") {
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

  const validateSession = async (siteId: string, siteUrl: string) => {
    const sessionDataItem = sessionData[siteId]
    if (!sessionDataItem?.sessionData?.cookies && (!sessionDataItem?.sessionData?.storage || Object.keys(sessionDataItem.sessionData.storage).length === 0)) {
      toast.warning("没有可验证的会话信息")
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
          cookies: sessionDataItem.sessionData.cookies,
          storage_data: sessionDataItem.sessionData.storage,
          session_rules: sessionDataItem.sessionRules
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
                toast.success("会话信息验证成功，登录状态正常")
              } else {
                toast.error("会话信息已失效，请重新获取")
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
      console.error("Validate session error:", error)
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

  const getExpiryTag = (_siteId: string, expiresAt?: string) => {
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

  const handleConfirmSave = async () => {
    if (!confirmData) return

    const { siteId, site, cookie_data, storage_data } = confirmData
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const newData = {
      ...sessionData,
      [siteId]: {
        siteId,
        name: site.name,
        url: site.url,
        sessionData: {
          cookies: cookie_data || "",
          storage: storage_data || {}
        },
        sessionRules: {
          use_cookies: true,
          storage_key: Array.isArray(site.storageKey) ? site.storageKey : (site.storageKey ? [site.storageKey] : [])
        },
        updatedAt: new Date().toLocaleString("zh-CN"),
        expiresAt: expiresAt.toISOString()
      }
    }

    saveSessionsToDb(newData)

    // 停止抓取过程
    const status = extractionStatuses[siteId]
    if (status?.sessionId) {
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
      } catch (error) {
        console.error("Stop extraction error:", error)
      }
    }

    setConfirmModalVisible(false)
    setConfirmData(null)
    toast.success("会话信息已保存")
  }

  const handleConfirmCancel = async () => {
    // 停止抓取过程
    if (confirmData) {
      const { siteId } = confirmData
      const status = extractionStatuses[siteId]
      if (status?.sessionId) {
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
        } catch (error) {
          console.error("Stop extraction error:", error)
        }
      }
    }

    setConfirmModalVisible(false)
    setConfirmData(null)
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
          点击下方大模型官网链接进行登录，登录后根据不同大模型的存储方式获取会话信息：
        </p>
        <ul className={styles.introList}>
          <li><strong>DeepSeek</strong>：登录后在浏览器控制台执行 <code>localStorage.getItem('userToken')</code> 获取</li>
          <li><strong>其他大模型</strong>：登录后在浏览器开发者工具的 Network 或 Application 面板复制 Cookie</li>
        </ul>
        <p className={styles.introText}>
          获取到的会话信息保存到这里，方便后续使用 Playwright 调用官网生成内容。
        </p>
      </div>

      <div className={styles.sitesGrid}>
        {LLM_SITES.map((site) => {
          const savedData = sessionData[site.id]
          const hasCookie = !!savedData?.sessionData?.cookies || (savedData?.sessionData?.storage && Object.keys(savedData.sessionData.storage).length > 0)
          const storageType = site.storageType || 'cookie'
          const storageLabel = storageType === 'localStorage' ? 'LocalStorage' : 'Cookie'

          return (
            <Card key={site.id} className={styles.siteCard}>
              <div className={styles.siteHeader}>
                <div className={styles.siteInfo}>
                  <div className={styles.siteName}>{site.name}</div>
                  <div className={styles.siteDesc}>{site.description}</div>
                  <Tag size="small" className={styles.storageTag}>
                    {storageLabel}
                  </Tag>
                </div>
                <div className={styles.siteStatus}>
                  {extractionStatuses[site.id]?.sessionId ? (
                    <Tag color={getStatusColor(extractionStatuses[site.id].status)} size="small">
                      {getStatusText(extractionStatuses[site.id].status)}
                    </Tag>
                  ) : hasCookie ? (
                    <>
                      <Tag color="green" size="small">已配置</Tag>
                      {getExpiryTag(site.id, savedData?.expiresAt)}
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
                        onClick={() => validateSession(site.id, site.url)}
                      >
                        验证会话
                      </Button>
                    )}
                    <Tooltip content="复制会话信息">
                      <Button
                        type="text"
                        size="small"
                        icon={<Copy size={16} />}
                        onClick={() => handleCopySession(site.id)}
                      />
                    </Tooltip>
                    <Tooltip content="删除">
                      <Button
                        type="text"
                        size="small"
                        status="danger"
                        icon={<Trash2 size={16} />}
                        onClick={() => handleDeleteSession(site.id)}
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
        title="编辑会话信息"
        visible={editModalVisible}
        onOk={handleSaveSession}
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
            autoSize={{ minRows: 6, maxRows: 12 }}
          />

          <div className={styles.dataSection} style={{ marginTop: 20 }}>
            <div className={styles.dataTitle}>LocalStorage 数据：</div>
            <Input.TextArea
              value={Object.keys(tempStorageValue).length > 0 ? JSON.stringify(tempStorageValue, null, 2) : ""}
              onChange={(value: string) => {
                try {
                  setTempStorageValue(value ? JSON.parse(value) : {})
                } catch (error) {
                  toast.warning("LocalStorage 数据格式错误，请输入有效的 JSON")
                }
              }}
              placeholder="请输入 LocalStorage 数据（JSON 格式）..."
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="确认保存会话信息"
        visible={confirmModalVisible}
        onOk={handleConfirmSave}
        onCancel={handleConfirmCancel}
        autoFocus={false}
        focusLock={true}
        style={{ width: 600 }}
      >
        {confirmData && (
          <div className={styles.modalContent}>
            <div className={styles.modalTip}>
              已成功抓取到 <strong>{confirmData.site.name}</strong> 的会话信息，请确认是否保存：
            </div>

            {confirmData.cookie_data && (
              <div className={styles.dataSection}>
                <div className={styles.dataTitle}>Cookie 数据：</div>
                <Input.TextArea
                  value={confirmData.cookie_data}
                  readOnly
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  className={styles.dataTextarea}
                />
              </div>
            )}

            {confirmData.storage_data && Object.keys(confirmData.storage_data).length > 0 && (
              <div className={styles.dataSection}>
                <div className={styles.dataTitle}>LocalStorage 数据：</div>
                <Input.TextArea
                  value={JSON.stringify(confirmData.storage_data, null, 2)}
                  readOnly
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  className={styles.dataTextarea}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
