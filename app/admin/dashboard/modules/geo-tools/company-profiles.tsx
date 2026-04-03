"use client"

import { useState, useEffect } from "react"
import { Button, Input, Card, Table, Tag, Space, Message, Popconfirm } from "@arco-design/web-react"
import { IconPlus, IconEdit, IconDelete, IconCheck } from "@arco-design/web-react/icon"

import styles from "./api-config.module.css"

interface CompanyProfile {
  id: number
  name: string
  company_name: string
  industry: string
  company_advantages?: string
  key_data?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export function CompanyProfiles() {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Partial<CompanyProfile> | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/geo-tools/company-profiles")
      const result = await response.json()
      if (result.success && result.data) {
        setProfiles(result.data)
      } else {
        Message.error("获取企业画像列表失败")
      }
    } catch (error) {
      console.error("获取企业画像列表失败:", error)
      Message.error("获取企业画像列表失败")
    } finally {
      setLoading(false)
    }
  }

  const handleAddProfile = () => {
    setEditingProfile({
      name: "",
      company_name: "",
      industry: "",
      company_advantages: "",
      key_data: "",
      is_default: false
    })
    setIsModalVisible(true)
  }

  const handleEditProfile = (profile: CompanyProfile) => {
    setEditingProfile({ ...profile })
    setIsModalVisible(true)
  }

  const handleSaveProfile = async () => {
    if (!editingProfile) return

    if (!editingProfile.name?.trim()) {
      Message.warning("请输入画像名称")
      return
    }

    if (!editingProfile.company_name?.trim()) {
      Message.warning("请输入企业名称")
      return
    }

    if (!editingProfile.industry?.trim()) {
      Message.warning("请输入所属行业")
      return
    }

    try {
      let response
      if (editingProfile.id) {
        response = await fetch("/api/admin/geo-tools/company-profiles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingProfile)
        })
      } else {
        response = await fetch("/api/admin/geo-tools/company-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editingProfile,
            is_default: false
          })
        })
      }
      const result = await response.json()
      if (result.success) {
        Message.success(editingProfile.id ? "企业画像更新成功" : "企业画像添加成功")
        setIsModalVisible(false)
        fetchProfiles()
      } else {
        Message.error(result.message || "保存失败")
      }
    } catch (error) {
      console.error("保存企业画像失败:", error)
      Message.error("保存企业画像失败")
    }
  }

  const handleDeleteProfile = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/geo-tools/company-profiles?id=${id}`, {
        method: "DELETE"
      })
      const result = await response.json()
      if (result.success) {
        Message.success("企业画像删除成功")
        fetchProfiles()
      } else {
        Message.error(result.message || "删除失败")
      }
    } catch (error) {
      console.error("删除企业画像失败:", error)
      Message.error("删除企业画像失败")
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      const response = await fetch("/api/admin/geo-tools/company-profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      const result = await response.json()
      if (result.success) {
        Message.success("默认企业画像设置成功")
        fetchProfiles()
      } else {
        Message.error(result.message || "设置失败")
      }
    } catch (error) {
      console.error("设置默认企业画像失败:", error)
      Message.error("设置默认企业画像失败")
    }
  }

  const handleCancelDefault = async (id: number) => {
    try {
      const response = await fetch("/api/admin/geo-tools/company-profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cancelDefault: true })
      })
      const result = await response.json()
      if (result.success) {
        Message.success("已取消默认企业画像")
        fetchProfiles()
      } else {
        Message.error(result.message || "操作失败")
      }
    } catch (error) {
      console.error("取消默认企业画像失败:", error)
      Message.error("取消默认企业画像失败")
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
      title: "画像名称",
      dataIndex: "name",
      key: "name",
      width: 150
    },
    {
      title: "企业名称",
      dataIndex: "company_name",
      key: "company_name",
      width: 200
    },
    {
      title: "所属行业",
      dataIndex: "industry",
      key: "industry",
      width: 150
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
      render: (_: any, record: CompanyProfile) => (
        <Space size={12}>
          {record.is_default ? (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleCancelDefault(record.id)
              }}
            >
              取消默认
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              icon={<IconCheck />}
              onClick={(e) => {
                e.stopPropagation()
                handleSetDefault(record.id)
              }}
            >
              设为默认
            </Button>
          )}
          <Button
            size="small"
            icon={<IconEdit />}
            onClick={(e) => {
              e.stopPropagation()
              handleEditProfile(record)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个企业画像吗？"
            onConfirm={() => handleDeleteProfile(record.id)}
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
            <span>企业画像列表管理</span>
            <Button
              type="primary"
              icon={<IconPlus />}
              onClick={handleAddProfile}
            >
              新增企业画像
            </Button>
          </div>
        }
        className={styles.configCard}
        loading={loading}
      >
        <Table
          columns={columns}
          data={profiles}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          onRow={(record: CompanyProfile) => ({
            onClick: () => handleEditProfile(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      {isModalVisible && (
        <div className={styles.modalOverlay} onClick={() => setIsModalVisible(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingProfile?.id ? "编辑企业画像" : "新增企业画像"}</h3>
              <button className={styles.modalClose} onClick={() => setIsModalVisible(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  画像名称 <span className={styles.required}>*</span>
                </label>
                <Input
                  value={editingProfile?.name}
                  onChange={(value) => editingProfile && setEditingProfile({ ...editingProfile, name: value })}
                  placeholder="请输入画像名称"
                  className={styles.input}
                />
              </div>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  企业名称 <span className={styles.required}>*</span>
                </label>
                <Input
                  value={editingProfile?.company_name}
                  onChange={(value) => editingProfile && setEditingProfile({ ...editingProfile, company_name: value })}
                  placeholder="请输入企业名称"
                  className={styles.input}
                />
              </div>
              <div className={styles.formItem}>
                <label className={styles.label}>
                  所属行业 <span className={styles.required}>*</span>
                </label>
                <Input
                  value={editingProfile?.industry}
                  onChange={(value) => editingProfile && setEditingProfile({ ...editingProfile, industry: value })}
                  placeholder="请输入所属行业"
                  className={styles.input}
                />
              </div>
              <div className={styles.formItem}>
                <label className={styles.label}>企业优势</label>
                <Input.TextArea
                  value={editingProfile?.company_advantages}
                  onChange={(value) => editingProfile && setEditingProfile({ ...editingProfile, company_advantages: value })}
                  placeholder="请输入企业优势"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  className={styles.input}
                />
              </div>
              <div className={styles.formItem}>
                <label className={styles.label}>关键数据</label>
                <Input.TextArea
                  value={editingProfile?.key_data}
                  onChange={(value) => editingProfile && setEditingProfile({ ...editingProfile, key_data: value })}
                  placeholder="请输入关键数据"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={handleSaveProfile}>
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
