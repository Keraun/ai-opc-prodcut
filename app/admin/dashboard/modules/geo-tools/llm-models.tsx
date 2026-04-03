"use client"

import { useState, useEffect } from "react"
import { Button, Input, Card, Table, Tag, Space, Message, Popconfirm } from "@arco-design/web-react"
import { IconPlus, IconEdit, IconDelete, IconCheck } from "@arco-design/web-react/icon"

import styles from "./api-config.module.css"

export function LLMModels() {
  const [models, setModels] = useState<Array<{
    id: number
    name: string
    value: string
    is_default: boolean
    created_at: string
    updated_at: string
  }>>([])
  const [loading, setLoading] = useState(false)
  const [editingModel, setEditingModel] = useState<{
    id?: number
    name: string
    value: string
  } | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/geo-tools/llm-models")
      const result = await response.json()
      if (result.success && result.data) {
        setModels(result.data)
      } else {
        Message.error("获取大模型列表失败")
      }
    } catch (error) {
      console.error("获取大模型列表失败:", error)
      Message.error("获取大模型列表失败")
    } finally {
      setLoading(false)
    }
  }

  const handleAddModel = () => {
    setEditingModel({ name: "", value: "" })
    setIsModalVisible(true)
  }

  const handleEditModel = (model: any) => {
    setEditingModel({ id: model.id, name: model.name, value: model.value })
    setIsModalVisible(true)
  }

  const handleSaveModel = async () => {
    if (!editingModel || !editingModel.name.trim() || !editingModel.value.trim()) {
      Message.warning("请输入模型名称和值")
      return
    }

    try {
      let response
      if (editingModel.id) {
        // 更新模型
        response = await fetch("/api/admin/geo-tools/llm-models", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingModel.id,
            name: editingModel.name.trim(),
            value: editingModel.value.trim()
          })
        })
      } else {
        // 新增模型
        response = await fetch("/api/admin/geo-tools/llm-models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editingModel.name.trim(),
            value: editingModel.value.trim(),
            is_default: false
          })
        })
      }
      const result = await response.json()
      if (result.success) {
        Message.success(editingModel.id ? "模型更新成功" : "模型添加成功")
        setIsModalVisible(false)
        fetchModels()
      } else {
        Message.error(result.message || "保存失败")
      }
    } catch (error) {
      console.error("保存模型失败:", error)
      Message.error("保存模型失败")
    }
  }

  const handleDeleteModel = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/geo-tools/llm-models?id=${id}`, {
        method: "DELETE"
      })
      const result = await response.json()
      if (result.success) {
        Message.success("模型删除成功")
        fetchModels()
      } else {
        Message.error(result.message || "删除失败")
      }
    } catch (error) {
      console.error("删除模型失败:", error)
      Message.error("删除模型失败")
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      const response = await fetch("/api/admin/geo-tools/llm-models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      const result = await response.json()
      if (result.success) {
        Message.success("默认模型设置成功")
        fetchModels()
      } else {
        Message.error(result.message || "设置失败")
      }
    } catch (error) {
      console.error("设置默认模型失败:", error)
      Message.error("设置默认模型失败")
    }
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id"
    },
    {
      title: "模型名称",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "模型值",
      dataIndex: "value",
      key: "value"
    },
    {
      title: "状态",
      dataIndex: "is_default",
      key: "is_default",
      render: (isDefault: boolean) => (
        <Tag color={isDefault ? "green" : "gray"}>
          {isDefault ? "默认" : "普通"}
        </Tag>
      )
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: any) => (
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
              handleEditModel(record)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个模型吗？"
            onConfirm={(e) => {
              e?.stopPropagation()
              handleDeleteModel(record.id)
            }}
          >
            <Button size="small" icon={<IconDelete />} status="danger">
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
            <span>大模型列表管理</span>
            <Button
              type="primary"
              icon={<IconPlus />}
              onClick={handleAddModel}
            >
              新增模型
            </Button>
          </div>
        }
        className={styles.configCard}
        loading={loading}
      >
        <Table
          columns={columns}
          data={models}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          onRow={(record: any) => ({
            onClick: () => handleEditModel(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      {isModalVisible && (
        <div className={styles.modalOverlay} onClick={() => setIsModalVisible(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingModel?.id ? "编辑模型" : "新增模型"}</h3>
              <button className={styles.modalClose} onClick={() => setIsModalVisible(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  模型名称 <span className={styles.required}>*</span>
                </label>
                <Input
                  value={editingModel?.name}
                  onChange={(value) => editingModel && setEditingModel({ ...editingModel, name: value })}
                  placeholder="请输入模型名称"
                  className={styles.input}
                />
              </div>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  模型值 <span className={styles.required}>*</span>
                </label>
                <Input
                  value={editingModel?.value}
                  onChange={(value) => editingModel && setEditingModel({ ...editingModel, value: value })}
                  placeholder="请输入模型值"
                  className={styles.input}
                />
                <div className={styles.hint}>
                  模型值是调用API时使用的模型标识，例如：deepseek-ai/DeepSeek-V2.5
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={handleSaveModel}>
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
