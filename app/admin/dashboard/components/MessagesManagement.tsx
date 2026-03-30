"use client"

import { useState, useEffect } from "react"
import { ManagementHeader, CommonTable, ActionButton } from "./index"
import { MessageSquare, User, Phone, Mail, CheckCircle, XCircle, Eye } from "lucide-react"
import { Tag as ArcoTag, Modal, Input, Select, Space, Popconfirm } from '@arco-design/web-react'
import styles from "./BaseManagement.module.css"
import { toast } from "sonner"

interface Message {
  id: number
  name: string
  phone: string
  wechat: string
  email: string
  preference: string
  message: string
  ip: string
  region: string
  os: string
  osVersion: string
  browser: string
  browserVersion: string
  deviceModel: string
  status: string
  note: string
  created_at: string
  updated_at: string
}

const statusOptions = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'ignored', label: '已忽略' }
]

const statusColorMap: Record<string, string> = {
  pending: 'orange',
  processing: 'arcoblue',
  completed: 'green',
  ignored: 'gray'
}

export function MessagesManagement() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editStatus, setEditStatus] = useState('')

  const loadMessages = async (page = 1, status = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pagination.pageSize),
        ...(status && { status })
      })
      const response = await fetch(`/api/admin/messages?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setMessages(result.data.list)
        setPagination(prev => ({
          ...prev,
          page: result.data.page,
          total: result.data.total
        }))
      } else {
        toast.error(result.message || '加载失败')
      }
    } catch (error) {
      console.error('加载留言失败:', error)
      toast.error('加载留言失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages(pagination.page, statusFilter)
  }, [])

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    loadMessages(1, value)
  }

  const handleView = (message: Message) => {
    setCurrentMessage(message)
    setEditNote(message.note || '')
    setEditStatus(message.status)
    setViewModalVisible(true)
  }

  const handleUpdate = async () => {
    if (!currentMessage) return
    
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentMessage.id,
          status: editStatus,
          note: editNote
        })
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('更新成功')
        setViewModalVisible(false)
        loadMessages(pagination.page, statusFilter)
      } else {
        toast.error(result.message || '更新失败')
      }
    } catch (error) {
      console.error('更新失败:', error)
      toast.error('更新失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('删除成功')
        loadMessages(pagination.page, statusFilter)
      } else {
        toast.error(result.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  const columns = [
    {
      title: '用户信息',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (_: any, record: Message) => (
        <div className={styles.productInfo}>
          <div className={styles.productName}>{record.name}</div>
          <div className={styles.productDesc}>
            {record.phone && <span><Phone size={12} /> {record.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      title: '留言内容',
      dataIndex: 'message',
      key: 'message',
      width: 250,
      render: (text: string) => (
        <div style={{ 
          maxWidth: 250, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        }}>
          {text}
        </div>
      ),
    },
    {
      title: '设备信息',
      key: 'device',
      width: 150,
      render: (_: any, record: Message) => (
        <div className={styles.productInfo}>
          <div className={styles.productName}>{record.os} {record.osVersion}</div>
          <div className={styles.productDesc}>{record.deviceModel}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = statusOptions.find(s => s.value === status)
        return (
          <ArcoTag color={statusColorMap[status] || 'gray'}>
            {statusConfig?.label || status}
          </ArcoTag>
        )
      },
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: Message) => (
        <Space size="small">
          <ActionButton
            type="primary"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleView(record)}
          >
            查看
          </ActionButton>
          <Popconfirm
            title="确定要删除这条留言吗？"
            onOk={() => handleDelete(record.id)}
          >
            <ActionButton
              type="danger"
              size="small"
            >
              删除
            </ActionButton>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.management}>
      <ManagementHeader
        title="留言管理"
        description="查看和管理用户提交的留言信息"
      />
      
      <div className={styles.filterBar}>
        <Select
          placeholder="筛选状态"
          style={{ width: 150 }}
          allowClear
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          {statusOptions.map(opt => (
            <Select.Option key={opt.value} value={opt.value}>
              {opt.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      <CommonTable
        columns={columns}
        data={messages}
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => loadMessages(page, statusFilter),
        }}
        emptyIcon={<MessageSquare size={48} />}
        emptyText="暂无留言数据"
      />

      <Modal
        title="留言详情"
        visible={viewModalVisible}
        onOk={handleUpdate}
        onCancel={() => setViewModalVisible(false)}
        okText="保存"
        cancelText="关闭"
        width={700}
      >
        {currentMessage && (
          <div className={styles.modalContent}>
            <div className={styles.detailSection}>
              <h4 className={styles.detailTitle}>基本信息</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>姓名:</span>
                  <span className={styles.detailValue}>{currentMessage.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>电话:</span>
                  <span className={styles.detailValue}>{currentMessage.phone || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>微信:</span>
                  <span className={styles.detailValue}>{currentMessage.wechat || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>邮箱:</span>
                  <span className={styles.detailValue}>{currentMessage.email || '-'}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.detailTitle}>留言内容</h4>
              <div className={styles.messageContent}>
                {currentMessage.message}
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.detailTitle}>设备信息</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>操作系统:</span>
                  <span className={styles.detailValue}>{currentMessage.os} {currentMessage.osVersion}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>浏览器:</span>
                  <span className={styles.detailValue}>{currentMessage.browser} {currentMessage.browserVersion}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>设备机型:</span>
                  <span className={styles.detailValue}>{currentMessage.deviceModel}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>IP地址:</span>
                  <span className={styles.detailValue}>{currentMessage.ip}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.detailTitle}>处理信息</h4>
              <div className={styles.editForm}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>状态</label>
                  <Select
                    value={editStatus}
                    onChange={setEditStatus}
                    style={{ width: '100%' }}
                  >
                    {statusOptions.map(opt => (
                      <Select.Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>备注</label>
                  <Input.TextArea
                    value={editNote}
                    onChange={setEditNote}
                    placeholder="添加处理备注..."
                    rows={3}
                  />
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>提交时间:</span>
                  <span className={styles.detailValue}>{new Date(currentMessage.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
