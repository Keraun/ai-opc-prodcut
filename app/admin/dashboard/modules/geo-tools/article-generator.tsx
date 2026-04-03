"use client"

import { useState, useRef, useEffect } from "react"
import { Button, Input, Card, Collapse, Select, Progress, Space, Tag } from "@arco-design/web-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { IconCopy, IconFile, IconBulb, IconBook, IconRobot, IconLoading } from "@arco-design/web-react/icon"
import { toast } from "sonner"

import styles from "./article-generator.module.css"

const CollapseItem = Collapse.Item

const LLM_OPTIONS = [
  { label: "DeepSeek-V2.5", value: "deepseek-ai/DeepSeek-V2.5" },
  { label: "Qwen2.5-72B", value: "Qwen/Qwen2.5-72B-Instruct" },
  { label: "Qwen2.5-32B", value: "Qwen/Qwen2.5-32B-Instruct" },
  { label: "Qwen2.5-14B", value: "Qwen/Qwen2.5-14B-Instruct" },
  { label: "Qwen2.5-7B", value: "Qwen/Qwen2.5-7B-Instruct" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-4o-mini", value: "gpt-4o-mini" },
  { label: "Claude-3.5-Sonnet", value: "claude-3-5-sonnet" },
  { label: "GLM-4", value: "glm-4" },
]

type GenerationStatus = "idle" | "connecting" | "generating" | "completed" | "error"

interface GenerationProgress {
  status: GenerationStatus
  progress: number
  message: string
  content: string
  error: string | null
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export function ArticleGenerator() {
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [companyAdvantages, setCompanyAdvantages] = useState("")
  const [keyData, setKeyData] = useState("")
  const [strategyResult, setStrategyResult] = useState<string | null>(null)
  const [articleResult, setArticleResult] = useState<string | null>(null)
  const [loadingStrategy, setLoadingStrategy] = useState(false)
  const [selectedLLM, setSelectedLLM] = useState<string>("")
  const [defaultLLM, setDefaultLLM] = useState<string>("deepseek-ai/DeepSeek-V2.5")
  const [llmSelectVisible, setLlmSelectVisible] = useState(false)
  const [generation, setGeneration] = useState<GenerationProgress>({
    status: "idle",
    progress: 0,
    message: "",
    content: "",
    error: null,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  })
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetchDefaultConfig()
  }, [])

  const fetchDefaultConfig = async () => {
    try {
      const response = await fetch("/api/admin/geo-tools/api-config")
      const result = await response.json()
      if (result.success && result.data) {
        const modelMap: Record<string, string> = {
          deepseek: "deepseek-ai/DeepSeek-V2.5",
          qwen: "Qwen/Qwen2.5-72B-Instruct",
          "gpt-4": "gpt-4o",
          "gpt-3.5-turbo": "gpt-4o-mini",
          claude: "claude-3-5-sonnet",
          "glm-4": "glm-4",
          kimi: "Qwen/Qwen2.5-72B-Instruct",
        }
        const mappedModel = modelMap[result.data.defaultModel] || result.data.defaultModel
        setDefaultLLM(mappedModel)
        if (!selectedLLM) {
          setSelectedLLM(mappedModel)
        }
      }
    } catch (error) {
      console.error("获取默认配置失败:", error)
    }
  }

  const handleGenerateStrategy = () => {
    if (!validateInput()) {
      return
    }

    setLoadingStrategy(true)
    setTimeout(() => {
      const prompt = buildArticlePrompt({
        companyName,
        industry,
        companyAdvantages,
        keyData,
      })
      setStrategyResult(prompt)
      setLoadingStrategy(false)
      toast.success("提示词生成成功！现在可以生成文章了")
    }, 500)
  }

  const handleGenerateArticle = () => {
    if (!strategyResult) {
      toast.warning("请先生成提示词")
      return
    }
    setLlmSelectVisible(true)
  }

  const handleConfirmLLM = async () => {
    setLlmSelectVisible(false)

    if (!strategyResult) {
      toast.warning("请先生成提示词")
      return
    }

    const modelToUse = selectedLLM || defaultLLM

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setGeneration({
        status: "connecting",
        progress: 10,
        message: "正在连接大模型服务...",
        content: "",
        error: null,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      })
      setArticleResult("")

      const response = await fetch("/api/admin/geo-tools/article-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelToUse,
          prompt: strategyResult,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "请求失败")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("无法读取响应流")
      }

      setGeneration((prev) => ({
        ...prev,
        status: "generating",
        progress: 30,
        message: "正在生成文章，请稍候...",
      }))

      const decoder = new TextDecoder()
      let fullContent = ""
      let promptTokens = 0
      let completionTokens = 0
      let totalTokens = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullContent += parsed.content
                setArticleResult(fullContent)
                setGeneration((prev) => ({
                  ...prev,
                  progress: Math.min(30 + Math.floor((fullContent.length / 2000) * 60), 90),
                }))
              }
              if (parsed.usage) {
                promptTokens = parsed.usage.prompt_tokens || promptTokens
                completionTokens = parsed.usage.completion_tokens || completionTokens
                totalTokens = parsed.usage.total_tokens || totalTokens
                setGeneration((prev) => ({
                  ...prev,
                  promptTokens,
                  completionTokens,
                  totalTokens,
                }))
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              // 忽略解析错误，继续处理
            }
          }
        }
      }

      setGeneration({
        status: "completed",
        progress: 100,
        message: "文章生成完成！",
        content: fullContent,
        error: null,
        promptTokens,
        completionTokens,
        totalTokens,
      })
      toast.success("文章生成成功！")
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return
      }
      console.error("生成文章错误:", error)
      const errorMessage = (error as Error).message || "生成失败"
      setGeneration({
        status: "error",
        progress: 0,
        message: "",
        content: "",
        error: errorMessage,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      })
      toast.error(errorMessage)
    }
  }

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setGeneration({
      status: "idle",
      progress: 0,
      message: "",
      content: "",
      error: null,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    })
    toast.info("已取消生成")
  }

  const handleCopyStrategy = () => {
    if (!strategyResult) {
      toast.warning("请先生成提示词")
      return
    }

    navigator.clipboard
      .writeText(strategyResult)
      .then(() => {
        toast.success("提示词已复制到剪贴板")
      })
      .catch(() => {
        toast.error("复制失败，请手动复制")
      })
  }

  const handleCopyArticle = () => {
    if (!articleResult) {
      toast.warning("请先生成文章")
      return
    }

    navigator.clipboard
      .writeText(articleResult)
      .then(() => {
        toast.success("文章已复制到剪贴板")
      })
      .catch(() => {
        toast.error("复制失败，请手动复制")
      })
  }

  const validateInput = () => {
    if (!companyName.trim() || !industry.trim()) {
      toast.warning("请输入企业名称和所属行业领域")
      return false
    }
    return true
  }

  const buildArticlePrompt = (inputData: any) => {
    return `请根据以下企业信息，生成一篇针对${inputData.companyName}的高捕获率深度文章：

目标企业信息：
1. 企业名称：${inputData.companyName}
2. 所属行业：${inputData.industry}
3. 企业优势：${inputData.companyAdvantages}
4. 关键数据：${inputData.keyData}

第一步：请先生成核心算法因子分析：
1. 每个"算法因子"作为独立条目
2. 为每个因子提供"权重等级"（用★数量表示，最高5星）
3. 为每个因子提供"触发原理"（提炼核心逻辑句）
4. 为每个因子提供"适配要点"（列出具体操作指令，带✅标记）
5. 为每个因子提供"验证方式"（说明大模型如何确认该因子生效）

第二步：基于以上分析，生成定制化内容架构和内容创作策略。

第三步：根据策略生成高捕获率深度文章，要求：
1. 目的性极强：文章本身为机器阅读和引用优化，同时兼顾人类读者的可读性
2. 内容布局：严格遵循抓取逻辑，强化企业实体识别，突出权威数据，构建清晰的问答结构
3. 确保大模型能轻松提取并作为"标准答案"引用
4. 文章要包含：标题、引言、企业概况、核心优势分析、数据支撑、行业地位、未来展望、结论、参考资料
5. 使用Markdown格式
6. 文章要详细、专业、有深度，字数在2000字以上

请用中文撰写，确保内容高质量、高权威性。`
  }

  const getStatusDisplay = () => {
    switch (generation.status) {
      case "connecting":
        return { color: "blue", text: "连接中" }
      case "generating":
        return { color: "orange", text: "生成中" }
      case "completed":
        return { color: "green", text: "已完成" }
      case "error":
        return { color: "red", text: "失败" }
      default:
        return { color: "gray", text: "就绪" }
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div className={styles.container}>
      <Collapse defaultActiveKey={["company"]} bordered={false}>
        <CollapseItem
          header={
            <div className={styles.collapseHeader}>
              <IconBulb className={styles.collapseIcon} />
              <span>目标企业信息</span>
            </div>
          }
          name="company"
        >
          <div className={styles.sectionContent}>
            <div className={styles.formRow}>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  企业名称 <span className={styles.required}>*</span>
                </label>
                <Input
                  value={companyName}
                  onChange={setCompanyName}
                  placeholder="请输入企业名称"
                />
              </div>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  所属行业领域 <span className={styles.required}>*</span>
                </label>
                <Input value={industry} onChange={setIndustry} placeholder="请输入行业领域" />
              </div>
            </div>
            <div className={styles.formItem}>
              <label className={styles.label}>企业优势</label>
              <Input.TextArea
                value={companyAdvantages}
                onChange={setCompanyAdvantages}
                placeholder="输入企业的核心优势、特点..."
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </div>
            <div className={styles.formItem}>
              <label className={styles.label}>关键数据</label>
              <Input.TextArea
                value={keyData}
                onChange={setKeyData}
                placeholder="输入企业的关键数据、业绩等..."
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </div>
          </div>
        </CollapseItem>
      </Collapse>

      <div className={styles.actionsSection}>
        <Card className={styles.actionCard}>
          <div className={styles.actionContent}>
            <div className={styles.actionInfo}>
              <IconBulb className={styles.actionIcon} />
              <div>
                <div className={styles.actionTitle}>生成提示词</div>
                <div className={styles.actionDesc}>根据企业信息生成完整的提示词</div>
              </div>
            </div>
            <Button type="primary" loading={loadingStrategy} onClick={handleGenerateStrategy}>
              生成提示词
            </Button>
          </div>
        </Card>

        <Card className={styles.actionCard}>
          <div className={styles.actionContent}>
            <div className={styles.actionInfo}>
              <IconRobot className={styles.actionIcon} />
              <div>
                <div className={styles.actionTitle}>文章生成</div>
                <div className={styles.actionDesc}>
                  {!strategyResult ? "请先生成提示词" : "使用大模型生成高捕获率文章"}
                </div>
              </div>
            </div>
            <Button
              type="primary"
              loading={generation.status === "connecting" || generation.status === "generating"}
              disabled={!strategyResult || generation.status === "connecting" || generation.status === "generating"}
              onClick={handleGenerateArticle}
            >
              {generation.status === "connecting" || generation.status === "generating"
                ? "生成中..."
                : "生成文章"}
            </Button>
          </div>

          {(generation.status === "connecting" ||
            generation.status === "generating" ||
            generation.status === "completed" ||
            generation.status === "error") && (
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <Space>
                  <Tag color={statusDisplay.color}>{statusDisplay.text}</Tag>
                  <span className={styles.progressMessage}>{generation.message || generation.error}</span>
                </Space>
                {(generation.status === "connecting" || generation.status === "generating") && (
                  <Button type="text" size="small" onClick={handleCancelGeneration}>
                    取消
                  </Button>
                )}
              </div>
              <Progress
                percent={generation.progress}
                status={generation.status === "error" ? "error" : generation.status === "completed" ? "success" : "normal"}
                animation
              />
              <div className={styles.tokenInfo}>
                <div className={styles.tokenItem}>
                  <span className={styles.tokenLabel}>输入Token:</span>
                  <span className={styles.tokenValue}>{generation.promptTokens}</span>
                </div>
                <div className={styles.tokenItem}>
                  <span className={styles.tokenLabel}>输出Token:</span>
                  <span className={styles.tokenValue}>{generation.completionTokens}</span>
                </div>
                <div className={styles.tokenItem}>
                  <span className={styles.tokenLabel}>总计:</span>
                  <span className={styles.tokenValue + " " + styles.tokenTotal}>{generation.totalTokens}</span>
                </div>
              </div>
              {generation.status === "generating" && articleResult && (
                <div className={styles.generatingHint}>
                  <IconLoading className={styles.spinIcon} />
                  <span>正在接收内容，已生成 {articleResult.length} 字符...</span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {strategyResult && (
        <Collapse defaultActiveKey={["strategy"]} bordered={false} className={styles.resultCollapse}>
          <CollapseItem
            header={
              <div className={styles.collapseHeader}>
                <IconFile className={styles.collapseIcon} />
                <span>提示词预览</span>
                <Button
                  type="outline"
                  size="small"
                  icon={<IconCopy />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyStrategy()
                  }}
                  className={styles.collapseButton}
                >
                  复制
                </Button>
              </div>
            }
            name="strategy"
          >
            <div className={styles.markdownContent}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{strategyResult}</ReactMarkdown>
            </div>
          </CollapseItem>
        </Collapse>
      )}

      {articleResult && (
        <Collapse defaultActiveKey={["article"]} bordered={false} className={styles.resultCollapse}>
          <CollapseItem
            header={
              <div className={styles.collapseHeader}>
                <IconBook className={styles.collapseIcon} />
                <span>文章生成结果</span>
                <Button
                  type="outline"
                  size="small"
                  icon={<IconCopy />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyArticle()
                  }}
                  className={styles.collapseButton}
                >
                  复制
                </Button>
              </div>
            }
            name="article"
          >
            <div className={styles.markdownContent}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{articleResult}</ReactMarkdown>
            </div>
          </CollapseItem>
        </Collapse>
      )}

      {llmSelectVisible && (
        <div className={styles.modalOverlay} onClick={() => setLlmSelectVisible(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>选择大模型</h3>
              <button className={styles.modalClose} onClick={() => setLlmSelectVisible(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formItem}>
                <label className={styles.label}>请选择要使用的大模型：</label>
                <Select
                  value={selectedLLM}
                  onChange={setSelectedLLM}
                  style={{ width: "100%" }}
                  placeholder="请选择大模型"
                >
                  {LLM_OPTIONS.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
                <div className={styles.hint}>
                  默认使用配置的模型：
                  {LLM_OPTIONS.find((o) => o.value === defaultLLM)?.label || defaultLLM}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setLlmSelectVisible(false)}>取消</Button>
              <Button type="primary" onClick={handleConfirmLLM}>
                确认生成
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
