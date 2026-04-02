"use client"

import { useState } from "react"
import { Button, Input, Card, Collapse, Message } from "@arco-design/web-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { IconCopy, IconFile, IconBulb, IconBook } from "@arco-design/web-react/icon"
import styles from "./article-generator.module.css"

const CollapseItem = Collapse.Item

const DEFAULT_LOGIC_LIBRARY = {
  searchMechanism: "通义千问：基于语义理解的向量搜索，优先匹配实体和关键词\nChatGPT：利用嵌入向量进行语义检索，注重上下文相关性\nPerplexity：结合网络搜索和自身知识库，强调信息时效性和准确性"
}

export function ArticleGenerator() {
  const [searchMechanism, setSearchMechanism] = useState(DEFAULT_LOGIC_LIBRARY.searchMechanism)
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [companyAdvantages, setCompanyAdvantages] = useState("")
  const [keyData, setKeyData] = useState("")
  const [strategyResult, setStrategyResult] = useState<string | null>(null)
  const [articleResult, setArticleResult] = useState<string | null>(null)
  const [loadingStrategy, setLoadingStrategy] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false)

  const handleGenerateStrategy = () => {
    if (!validateInput()) {
      return
    }

    setLoadingStrategy(true)
    setTimeout(() => {
      const prompt = buildStrategyPrompt({
        searchMechanism,
        companyName,
        industry,
        companyAdvantages,
        keyData
      })
      setStrategyResult(prompt)
      setLoadingStrategy(false)
    }, 1000)
  }

  const handleGenerateArticle = () => {
    if (!validateInput()) {
      return
    }

    setLoadingArticle(true)
    setTimeout(() => {
      const prompt = buildArticlePrompt({
        searchMechanism,
        companyName,
        industry,
        companyAdvantages,
        keyData
      })
      setArticleResult(prompt)
      setLoadingArticle(false)
    }, 1000)
  }

  const handleCopyStrategy = () => {
    if (!strategyResult) {
      Message.warning("请先生成策略")
      return
    }

    navigator.clipboard.writeText(strategyResult)
      .then(() => {
        Message.success("策略已复制到剪贴板")
      })
      .catch(() => {
        Message.error("复制失败，请手动复制")
      })
  }

  const handleCopyArticle = () => {
    if (!articleResult) {
      Message.warning("请先生成文章")
      return
    }

    navigator.clipboard.writeText(articleResult)
      .then(() => {
        Message.success("文章已复制到剪贴板")
      })
      .catch(() => {
        Message.error("复制失败，请手动复制")
      })
  }

  const validateInput = () => {
    if (!companyName.trim() || !industry.trim()) {
      Message.warning("请输入企业名称和所属行业领域")
      return false
    }
    return true
  }

  const buildStrategyPrompt = (inputData: any) => {
    return `请根据以下抓取逻辑库和企业信息，生成高捕获率内容创作策略：

抓取逻辑库：
1. 大模型搜索检索机制：${inputData.searchMechanism}

目标企业信息：
1. 企业名称：${inputData.companyName}
2. 所属行业：${inputData.industry}
3. 企业优势：${inputData.companyAdvantages}
4. 关键数据：${inputData.keyData}

请按照以下要求生成核心算法因子分析：
1. 每个"算法因子"作为独立条目
2. 为每个因子提供"权重等级"（用★数量表示，最高5星）
3. 为每个因子提供"触发原理"（提炼核心逻辑句）
4. 为每个因子提供"适配要点"（列出具体操作指令，带✅标记）
5. 为每个因子提供"验证方式"（说明大模型如何确认该因子生效）

请最终输出两个部分：
1. Markdown 表格版（便于人类阅读）
2. JSON 数组版（便于程序调用，字段名：factor, weight_stars, trigger_logic, adaptation_points, verification_method）

另外，请生成定制化内容架构和内容创作策略。

请用中文回答，内容要详细、专业、可操作。`
  }

  const buildArticlePrompt = (inputData: any) => {
    return `请根据以下抓取逻辑库和企业信息，生成一篇针对${inputData.companyName}的高捕获率深度文章：

抓取逻辑库：
1. 大模型搜索检索机制：${inputData.searchMechanism}

目标企业信息：
1. 企业名称：${inputData.companyName}
2. 所属行业：${inputData.industry}
3. 企业优势：${inputData.companyAdvantages}
4. 关键数据：${inputData.keyData}

文章要求：
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
      <Collapse defaultActiveKey={["logic", "company"]} bordered={false}>
        <CollapseItem
          header={
            <div className={styles.collapseHeader}>
              <IconBook className={styles.collapseIcon} />
              <span>抓取逻辑库</span>
            </div>
          }
          name="logic"
        >
          <div className={styles.sectionContent}>
            <div className={styles.formItem}>
              <label className={styles.label}>大模型搜索检索机制</label>
              <Input.TextArea
                value={searchMechanism}
                onChange={setSearchMechanism}
                placeholder="输入各大主流大模型的搜索检索机制..."
                autoSize={{ minRows: 4, maxRows: 8 }}
              />
            </div>
          </div>
        </CollapseItem>

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
                <div className={styles.actionTitle}>分析与策略</div>
                <div className={styles.actionDesc}>根据企业信息生成内容创作策略</div>
              </div>
            </div>
            <Button
              type="primary"
              loading={loadingStrategy}
              onClick={handleGenerateStrategy}
            >
              生成策略
            </Button>
          </div>
        </Card>

        <Card className={styles.actionCard}>
          <div className={styles.actionContent}>
            <div className={styles.actionInfo}>
              <IconFile className={styles.actionIcon} />
              <div>
                <div className={styles.actionTitle}>文章生成</div>
                <div className={styles.actionDesc}>生成高捕获率深度文章</div>
              </div>
            </div>
            <Button
              type="primary"
              loading={loadingArticle}
              onClick={handleGenerateArticle}
            >
              生成文章
            </Button>
          </div>
        </Card>
      </div>

      {strategyResult && (
        <Card className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTitle}>策略结果</div>
            <Button
              type="outline"
              size="small"
              icon={<IconCopy />}
              onClick={handleCopyStrategy}
            >
              复制策略
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
    </div>
  )
}
