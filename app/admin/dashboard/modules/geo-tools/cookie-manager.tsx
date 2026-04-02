"use client"

import { useState, useEffect } from "react"
import { Button, Card, Modal, Input, Tag, Message, Tooltip } from "@arco-design/web-react"
import { IconLaunch, IconEdit, IconDelete, IconCopy, IconInfoCircle } from "@arco-design/web-react/icon"
import styles from "./cookie-manager.module.css"

interface CookieData {
  name: string
  url: string
  cookies: string
  updatedAt: string
}

const LLM_SITES = [
  { id: "qwen", name: "通义千问", url: "https://tongyi.aliyun.com/", description: "阿里云大语言模型" },
  { id: "openai", name: "OpenAI (ChatGPT)", url: "https://chat.openai.com/", description: "OpenAI 对话模型" },
  { id: "zhipu", name: "智谱AI (GLM)", url: "https://chatglm.cn/", description: "智谱清言对话模型" },
  { id: "minimax", name: "MiniMax", url: "https://www.minimaxi.com/", description: "MiniMax 大模型" },
  { id: "claude", name: "Claude (Anthropic)", url: "https://claude.ai/", description: "Anthropic 对话模型" },
  { id: "doubao", name: "豆包", url: "https://www.doubao.com/", description: "字节跳动大模型" },
  { id: "wenxin", name: "文心一言", url: "https://yiyan.baidu.com/", description: "百度文心大模型" },
  { id: "kimi", name: "Kimi", url: "https://kimi.moonshot.cn/", description: "月之暗面大模型" },
]

export function CookieManager() {
  const [cookiesData, setCookiesData] = useState<Record<string, CookieData>>({})
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null)
  const [tempCookieValue, setTempCookieValue] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("llm-cookies")
    if (saved) {
      setCookiesData(JSON.parse(saved))
    }
  }, [])

  const saveCookies = (newData: Record<string, CookieData>) => {
    setCookiesData(newData)
    localStorage.setItem("llm-cookies", JSON.stringify(newData))
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

    const newData = {
      ...cookiesData,
      [editingSiteId]: {
        name: site.name,
        url: site.url,
        cookies: tempCookieValue,
        updatedAt: new Date().toLocaleString("zh-CN")
      }
    }

    saveCookies(newData)
    setEditModalVisible(false)
    Message.success("Cookie 已保存")
  }

  const handleDeleteCookie = (siteId: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个 Cookie 吗？",
      onOk: () => {
        const newData = { ...cookiesData }
        delete newData[siteId]
        saveCookies(newData)
        Message.success("Cookie 已删除")
      }
    })
  }

  const handleCopyCookie = (siteId: string) => {
    const data = cookiesData[siteId]
    if (data?.cookies) {
      navigator.clipboard.writeText(data.cookies)
        .then(() => Message.success("Cookie 已复制到剪贴板"))
        .catch(() => Message.error("复制失败"))
    } else {
      Message.warning("没有可复制的 Cookie")
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.introCard}>
        <div className={styles.introHeader}>
          <IconInfoCircle className={styles.introIcon} />
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
                  {hasCookie ? (
                    <Tag color="green">已配置</Tag>
                  ) : (
                    <Tag color="gray">未配置</Tag>
                  )}
                </div>
              </div>

              <div className={styles.siteActions}>
                <Button
                  type="outline"
                  size="small"
                  icon={<IconLaunch />}
                  onClick={() => openSite(site.url)}
                >
                  打开官网
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<IconEdit />}
                  onClick={() => openEditModal(site.id)}
                >
                  {hasCookie ? "编辑" : "添加"}
                </Button>
                {hasCookie && (
                  <>
                    <Tooltip content="复制 Cookie">
                      <Button
                        type="text"
                        size="small"
                        icon={<IconCopy />}
                        onClick={() => handleCopyCookie(site.id)}
                      />
                    </Tooltip>
                    <Tooltip content="删除">
                      <Button
                        type="text"
                        size="small"
                        status="danger"
                        icon={<IconDelete />}
                        onClick={() => handleDeleteCookie(site.id)}
                      />
                    </Tooltip>
                  </>
                )}
              </div>

              {hasCookie && (
                <div className={styles.cookiePreview}>
                  <div className={styles.cookieMeta}>
                    <span className={styles.cookieLabel}>Cookie 预览</span>
                    <span className={styles.cookieTime}>更新于: {savedData.updatedAt}</span>
                  </div>
                  <div className={styles.cookieText}>
                    {savedData.cookies.length > 100
                      ? savedData.cookies.substring(0, 100) + "..."
                      : savedData.cookies}
                  </div>
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
