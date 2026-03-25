"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, Table, Input, Upload, Modal, Form, Select, Alert, Message } from "@arco-design/web-react"
import { IconPlus, IconDelete, IconEdit, IconSave, IconClose, IconFile, IconImage, IconCalendar, IconTags } from "@arco-design/web-react/icon"
import { toast, Toaster } from "sonner"
import { useTheme } from "@/components/theme-provider"
import styles from "./articles.module.css"

interface Article {
  id: string
  title: string
  slug: string
  summary: string
  date: string
  contentFormat: 'html' | 'markdown'
  author?: string
  tags?: string[]
  image?: string
  status: 'published' | 'draft'
}

export default function ArticlesPage() {
  const router = useRouter()
  const { themeConfig } = useTheme()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [form] = Form.useForm()

  // 模拟文章数据
  const mockArticles: Article[] = [
    {
      id: '1',
      title: '2026化工行业发展趋势观察，实战案例解读',
      slug: 'chemical-industry-trends-2026',
      summary: '化工行业作为国民经济的压舱石，正站在技术迭代、绿色转型、格局重构三重变革的交汇点...',
      date: '2026-03-19',
      contentFormat: 'markdown',
      author: '行业分析师',
      tags: ['化工', '行业趋势', '2026'],
      status: 'published'
    },
    {
      id: '2',
      title: '管理咨询公司：助力企业构建高效敏捷的供应链管理体系',
      slug: 'supply-chain-management-consulting',
      summary: '在全球化深入推进与供应链结构愈发复杂的当下，市场环境瞬息万变...',
      date: '2026-02-05',
      contentFormat: 'html',
      author: '供应链专家',
      tags: ['供应链', '管理咨询', '企业管理'],
      status: 'published'
    }
  ]

  useEffect(() => {
    // 从API加载文章列表
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/articles')
        if (response.ok) {
          const data = await response.json()
          setArticles(data)
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
        toast.error('获取文章列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const handleAddArticle = () => {
    setCurrentArticle(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditArticle = (article: Article) => {
    setCurrentArticle(article)
    form.setFieldsValue(article)
    setModalVisible(true)
  }

  const handleDeleteArticle = async (article: Article) => {
    if (confirm(`确定要删除文章 "${article.title}" 吗？`)) {
      try {
        const response = await fetch(`/api/articles?id=${article.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setArticles(articles.filter(a => a.id !== article.id))
          toast.success('文章删除成功')
        } else {
          toast.error('删除文章失败')
        }
      } catch (error) {
        console.error('Failed to delete article:', error)
        toast.error('删除文章失败')
      }
    }
  }

  const handleSaveArticle = async () => {
    try {
      const values = await form.validate()
      
      let response
      if (currentArticle) {
        // 编辑现有文章
        response = await fetch('/api/articles', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        })
      } else {
        // 创建新文章
        response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        })
      }
      
      if (response.ok) {
        const savedArticle = await response.json()
        if (currentArticle) {
          setArticles(articles.map(article => 
            article.id === currentArticle.id ? savedArticle : article
          ))
          toast.success('文章更新成功')
        } else {
          setArticles([...articles, savedArticle])
          toast.success('文章创建成功')
        }
        setModalVisible(false)
      } else {
        toast.error('保存文章失败')
      }
    } catch (error) {
      console.error('Failed to save article:', error)
      toast.error('保存文章失败')
    }
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Article) => (
        <div className={styles.titleCell}>{text}</div>
      )
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      render: (text: string) => (
        <div className={styles.summaryCell}>{text}</div>
      )
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <span className={`${styles.statusBadge} ${status === 'published' ? styles.statusPublished : styles.statusDraft}`}>
          {status === 'published' ? '已发布' : '草稿'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Article) => (
        <div className={styles.actionButtons}>
          <Button
            type="primary"
            size="small"
            icon={<IconEdit />}
            onClick={() => handleEditArticle(record)}
          >
            编辑
          </Button>
          <Button
            status="danger"
            size="small"
            icon={<IconDelete />}
            onClick={() => handleDeleteArticle(record)}
          >
            删除
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <Toaster />
      
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>文章管理</h1>
          <Button
            type="primary"
            icon={<IconPlus />}
            onClick={handleAddArticle}
          >
            新建文章
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <Card className={styles.tableCard}>
          <Table
            columns={columns}
            data={articles}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>

      {/* Modal */}
      <Modal
        title={currentArticle ? '编辑文章' : '新建文章'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveArticle}>
            保存
          </Button>
        ]}
        style={{ width: 800 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="标题"
            field="title"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item
            label="Slug"
            field="slug"
            rules={[{ required: true, message: '请输入文章slug' }]}
          >
            <Input placeholder="请输入文章slug（用于URL）" />
          </Form.Item>

          <Form.Item
            label="摘要"
            field="summary"
            rules={[{ required: true, message: '请输入文章摘要' }]}
          >
            <Input.TextArea placeholder="请输入文章摘要" rows={3} />
          </Form.Item>

          <Form.Item
            label="日期"
            field="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            label="内容格式"
            field="contentFormat"
            rules={[{ required: true, message: '请选择内容格式' }]}
          >
            <Select>
              <Select.Option value="markdown">Markdown</Select.Option>
              <Select.Option value="html">HTML</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="作者"
            field="author"
          >
            <Input placeholder="请输入作者名称" />
          </Form.Item>

          <Form.Item
            label="标签"
            field="tags"
          >
            <Input placeholder="请输入标签，用逗号分隔" />
          </Form.Item>

          <Form.Item
            label="文章内容"
            field="content"
            rules={[{ required: true, message: '请输入文章内容' }]}
          >
            <Input.TextArea placeholder="请输入文章内容" rows={10} />
          </Form.Item>

          <Form.Item
            label="封面图片"
            field="image"
          >
            <Upload
              action="/api/upload"
              accept="image/*"
              multiple={false}
              showUploadList
            >
              <Button icon={<IconImage />}>上传图片</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
