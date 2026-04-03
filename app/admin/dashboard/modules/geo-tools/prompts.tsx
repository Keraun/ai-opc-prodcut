"use client"

import { useState, useEffect } from "react"
import { Button, Input, Card, Table, Tag, Space, Message, Popconfirm } from "@arco-design/web-react"
import { IconPlus, IconEdit, IconDelete, IconCheck } from "@arco-design/web-react/icon"

import styles from "./api-config.module.css"

interface Prompt {
  id: number
  name: string
  prompt_content: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export function Prompts() {
  
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/geo-tools/prompts")
      const result = await response.json()
      if (result.success && result.data) {
        setPrompts(result.data)
      } else {
        Message.error("获取提示词列表失败")
      }
    } catch (error) {
      console.error("获取提示词列表失败:", error)
      Message.error("获取提示词列表失败")
    } finally {
      setLoading(false)
    }
  }

  const handleAddPrompt = () => {
    setEditingPrompt({
      name: "",
      prompt_content: "",
      is_default: false
    })
    setIsModalVisible(true)
  }

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt({ ...prompt })
    setIsModalVisible(true)
  }

  const handleSavePrompt = async () => {
    if (!editingPrompt) return

    if (!editingPrompt.name?.trim()) {
      Message.warning("请输入提示词名称")
      return
    }

    if (!editingPrompt.prompt_content?.trim()) {
      Message.warning("请输入提示词内容")
      return
    }

    try {
      let response
      if (editingPrompt.id) {
        response = await fetch("/api/admin/geo-tools/prompts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingPrompt)
        })
      } else {
        response = await fetch("/api/admin/geo-tools/prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editingPrompt,
            is_default: false
          })
        })
      }
      const result = await response.json()
      if (result.success) {
        Message.success(editingPrompt.id ? "提示词更新成功" : "提示词添加成功")
        setIsModalVisible(false)
        fetchPrompts()
      } else {
        Message.error(result.message || "保存失败")
      }
    } catch (error) {
      console.error("保存提示词失败:", error)
      Message.error("保存提示词失败")
    }
  }

  const handleDeletePrompt = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/geo-tools/prompts?id=${id}`, {
        method: "DELETE"
      })
      const result = await response.json()
      if (result.success) {
        Message.success("提示词删除成功")
        fetchPrompts()
      } else {
        Message.error(result.message || "删除失败")
      }
    } catch (error) {
      console.error("删除提示词失败:", error)
      Message.error("删除提示词失败")
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      const response = await fetch("/api/admin/geo-tools/prompts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      const result = await response.json()
      if (result.success) {
        Message.success("默认提示词设置成功")
        fetchPrompts()
      } else {
        Message.error(result.message || "设置失败")
      }
    } catch (error) {
      console.error("设置默认提示词失败:", error)
      Message.error("设置默认提示词失败")
    }
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60
    },
    {
      title: "提示词名称",
      dataIndex: "name",
      key: "name",
      width: 200
    },
    {
      title: "提示词内容",
      dataIndex: "prompt_content",
      key: "prompt_content",
      width: 400,
      render: (content: string) => (
        <div style={{ 
          maxWidth: '400px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        }}>
          {content}
        </div>
      )
    },
    {
      title: "状态",
      dataIndex: "is_default",
      key: "is_default",
      width: 80,
      render: (isDefault: boolean) => (
        <Tag color={isDefault ? "green" : "gray"}>
          {isDefault ? "默认" : "普通"}
        </Tag>
      )
    },
    {
      title: "操作",
      key: "action",
      width: 250,
      render: (_: any, record: Prompt) => (
        <Space size={12}>
          <Button
            type="primary"
            size="small"
            icon={<IconCheck />}
            onClick={(e) => {
              e.stopPropagation()
              handleSetDefault(record.id)
            }}
            disabled={record.is_default}
          >
            设为默认
          </Button>
          <Button
            size="small"
            icon={<IconEdit />}
            onClick={(e) => {
              e.stopPropagation()
              handleEditPrompt(record)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个提示词吗？"
            onConfirm={() => handleDeletePrompt(record.id)}
          >
            <Button size="small" icon={<IconDelete />} status="danger" onClick={(e) => e.stopPropagation()}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <Card
        title={
          <div className={styles.cardTitle}>
            <span>提示词列表管理</span>
            <Button
              type="primary"
              icon={<IconPlus />}
              onClick={handleAddPrompt}
            >
              新增提示词
            </Button>
          </div>
        }
        className={styles.configCard}
        loading={loading}
      >
        <Table
          columns={columns}
          data={prompts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          onRow={(record: Prompt) => ({
            onClick: () => handleEditPrompt(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      {isModalVisible && (
        <div className={styles.modalOverlay} onClick={() => setIsModalVisible(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingPrompt?.id ? "编辑提示词" : "新增提示词"}</h3>
              <button className={styles.modalClose} onClick={() => setIsModalVisible(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  提示词名称 <span className={styles.required}>*</span>
                </label>
                <Input
                  value={editingPrompt?.name}
                  onChange={(value) => editingPrompt && setEditingPrompt({ ...editingPrompt, name: value })}
                  placeholder="请输入提示词名称"
                  className={styles.input}
                />
              </div>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  提示词内容 <span className={styles.required}>*</span>
                </label>
                <Input.TextArea
                  value={editingPrompt?.prompt_content}
                  onChange={(value) => editingPrompt && setEditingPrompt({ ...editingPrompt, prompt_content: value })}
                  placeholder="请输入提示词内容"
                  autoSize={{ minRows: 10, maxRows: 20 }}
                  className={styles.input}
                />
                <div className={styles.hint}>
                  可用占位符：{"{{companyName}}"} - 企业名称，{"{{industry}}"} - 所属行业，{"{{companyAdvantages}}"} - 企业优势，{"{{keyData}}"} - 关键数据
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={handleSavePrompt}>
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
