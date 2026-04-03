"use client"

import { useState, useRef } from "react"
import { Button, Input, Card, Collapse, Select, Modal } from "@arco-design/web-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { IconCopy, IconFile, IconBulb, IconBook, IconRobot } from "@arco-design/web-react/icon"
import { toast } from "sonner"

import styles from "./article-generator.module.css"

const CollapseItem = Collapse.Item

const LLM_OPTIONS = [
  { label: "DeepSeek", value: "deepseek" },
  { label: "OpenAI (ChatGPT)", value: "openai" },
  { label: "豆包", value: "doubao" },
  { label: "Kimi", value: "kimi" },
  { label: "通义千问", value: "qwen" },
  { label: "智谱AI (GLM)", value: "zhipu" },
  { label: "MiniMax", value: "minimax" },
  { label: "Claude", value: "claude" },
  { label: "文心一言", value: "wenxin" },
]

interface GenerationSession {
  status: "idle" | "initializing" | "generating" | "completed" | "error"
  sessionId: string | null
  answer: string | null
  error: string | null
}

export function ArticleGenerator() {
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [companyAdvantages, setCompanyAdvantages] = useState("")
  const [keyData, setKeyData] = useState("")
  const [strategyResult, setStrategyResult] = useState<string | null>(null)
  const [articleResult, setArticleResult] = useState<string | null>(null)
  const [loadingStrategy, setLoadingStrategy] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false)
  const [selectedLLM, setSelectedLLM] = useState<string>("deepseek")
  const [llmSelectVisible, setLlmSelectVisible] = useState(false)
  const [generationSession, setGenerationSession] = useState<GenerationSession>({
    status: "idle",
    sessionId: null,
    answer: null,
    error: null
  })
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

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
        keyData
      })
      setStrategyResult(prompt)
      setLoadingStrategy(false)
      toast.success("提示词生成成功！现在可以生成文章了")
    }, 1000)
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

    try {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }

      setGenerationSession({
        status: "initializing",
        sessionId: null,
        answer: null,
        error: null
      })
      setLoadingArticle(true)

      const response = await fetch("/api/admin/geo-tools/article-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          llmId: selectedLLM,
          prompt: strategyResult
        })
      })

      const result = await response.json()

      if (!result.success) {
        if (response.status === 501) {
          toast.error("服务器环境不支持浏览器自动化")
        } else {
          toast.error(result.message || "启动生成失败")
        }
        setGenerationSession({
          status: "error",
          sessionId: null,
          answer: null,
          error: result.message || "启动生成失败"
        })
        setLoadingArticle(false)
        return
      }

      const sessionId = result.data.sessionId

      setGenerationSession({
        status: "initializing",
        sessionId,
        answer: null,
        error: null
      })

      toast.success("浏览器已启动，正在生成文章...")

      pollingRef.current = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/admin/geo-tools/article-generate?sessionId=${sessionId}`
          )
          const statusResult = await statusResponse.json()

          if (statusResult.success) {
            const { status, answer, error } = statusResult.data

            setGenerationSession({
              status,
              sessionId,
              answer,
              error
            })

            if (status === "completed") {
              clearInterval(pollingRef.current!)
              pollingRef.current = null
              setLoadingArticle(false)
              
              if (answer) {
                setArticleResult(answer)
                toast.success("文章生成成功！")
              } else {
                toast.error("未获取到有效答案")
              }
            } else if (status === "error") {
              clearInterval(pollingRef.current!)
              pollingRef.current = null
              setLoadingArticle(false)
              toast.error(error || "生成失败")
            }
          }
        } catch (error) {
          console.error("Poll generation status error:", error)
        }
      }, 2000)

    } catch (error) {
      console.error("Generate article error:", error)
      toast.error("生成失败")
      setLoadingArticle(false)
      setGenerationSession({
        status: "error",
        sessionId: null,
        answer: null,
        error: "生成失败"
      })
    }
  }

  const handleCopyStrategy = () => {
    if (!strategyResult) {
      toast.warning("请先生成提示词")
      return
    }

    navigator.clipboard.writeText(strategyResult)
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

    navigator.clipboard.writeText(articleResult)
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
                <label className={styles.label}>企业名称 <span className={styles.required}>*</span></label>
                <Input
                  value={companyName}
                  onChange={setCompanyName}
                  placeholder="请输入企业名称"
                />
              </div>
              <div className={styles.formItem}>
                <label className={styles.label}>所属行业领域 <span className={styles.required}>*</span></label>
                <Input
                  value={industry}
                  onChange={setIndustry}
                  placeholder="请输入行业领域"
                />
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
            <Button
              type="primary"
              loading={loadingStrategy}
              onClick={handleGenerateStrategy}
            >
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
              loading={loadingArticle}
              disabled={!strategyResult}
              onClick={handleGenerateArticle}
            >
              生成文章
            </Button>
          </div>
          {generationSession.sessionId && (
            <div style={{ marginTop: 12, padding: 12, background: "#f7f8fa", borderRadius: 4 }}>
              <div style={{ fontSize: 14, color: "#666" }}>
                {generationSession.status === "initializing" && "正在启动浏览器..."}
                {generationSession.status === "generating" && "正在生成文章，请稍候..."}
                {generationSession.status === "completed" && "✓ 文章生成完成"}
                {generationSession.status === "error" && `生成失败: ${generationSession.error}`}
              </div>
            </div>
          )}
        </Card>
      </div>

      {strategyResult && (
        <Card className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTitle}>提示词预览</div>
            <Button
              type="outline"
              size="small"
              icon={<IconCopy />}
              onClick={handleCopyStrategy}
            >
              复制提示词
            </Button>
          </div>
          <div className={styles.markdownContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {strategyResult}
            </ReactMarkdown>
          </div>
        </Card>
      )}

      {articleResult && (
        <Card className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTitle}>高捕获率文章</div>
            <Button
              type="outline"
              size="small"
              icon={<IconCopy />}
              onClick={handleCopyArticle}
            >
              复制文章
            </Button>
          </div>
          <div className={styles.markdownContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {articleResult}
            </ReactMarkdown>
          </div>
        </Card>
      )}

      <Modal
        title="选择大模型"
        visible={llmSelectVisible}
        onOk={handleConfirmLLM}
        onCancel={() => setLlmSelectVisible(false)}
        autoFocus={false}
        focusLock={true}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>请选择要使用的大模型：</div>
          <Select
            value={selectedLLM}
            onChange={setSelectedLLM}
            style={{ width: "100%" }}
            placeholder="请选择大模型"
          >
            {LLM_OPTIONS.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
          <div style={{ marginTop: 8, fontSize: 12, color: "#86909c" }}>
            注意：请确保已在 Cookie 管理中配置了所选大模型的 Cookie
          </div>
        </div>
      </Modal>
    </div>
  )
}
