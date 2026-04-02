"use client"

import { useState, useEffect } from "react"
import { CommonTable, ActionButton } from "../index"
import { MessageSquare, Phone, Mail, Eye, Download, Trash2 } from "lucide-react"
import { Select, Space, Popconfirm, Modal, Input, Tooltip, Tag, Button, Checkbox } from '@arco-design/web-react'
import styles from "../BaseManagement.module.css"
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
  llmModel?: string
}

const statusOptions = [
  { value: 'pending', label: '待处理', color: 'warning' },
  { value: 'processing', label: '处理中', color: 'arcoblue' },
  { value: 'completed', label: '已完成', color: 'success' },
  { value: 'ignored', label: '已忽略', color: 'gray' }
]

interface MessageListProps {
  onStatusChange?: (id: number, status: string) => void
}

export function MessageList({ onStatusChange }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

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
        if (onStatusChange) {
          onStatusChange(currentMessage.id, editStatus)
        }
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

  const handleStatusChange = async (record: Message, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: record.id,
          status: newStatus,
          note: record.note
        })
      })
      const result = await response.json()

      if (result.success) {
        toast.success('状态更新成功')
        loadMessages(pagination.page, statusFilter)
        if (onStatusChange) {
          onStatusChange(record.id, newStatus)
        }
      } else {
        toast.error(result.message || '更新失败')
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      toast.error('更新失败')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/messages?export=true&status=${statusFilter}`)
      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        exportToCSV(result.data)
      } else {
        toast.error('没有可导出的数据')
      }
    } catch (error) {
      console.error('导出失败:', error)
      toast.error('导出失败')
    }
  }

  const handleBatchExport = () => {
    if (selectedRowKeys.length === 0) {
      toast.error('请先选择要导出的留言')
      return
    }
    const selectedMessages = messages.filter(msg => selectedRowKeys.includes(msg.id))
    exportToCSV(selectedMessages)
    toast.success(`已导出 ${selectedRowKeys.length} 条留言`)
  }

  const exportToCSV = (data: Message[]) => {
    if (data.length === 0) {
      toast.error('没有可导出的数据')
      return
    }

    const headers = ['姓名', '电话', '微信', '邮箱', '留言内容', '大模型', '状态', '备注', 'IP地址', '地区', '操作系统', '浏览器', '设备机型', '提交时间']
    const rows = data.map((msg: Message) => [
      msg.name,
      msg.phone || '',
      msg.wechat || '',
      msg.email || '',
      `"${msg.message.replace(/"/g, '""')}"`,
      msg.llmModel || '',
      msg.status,
      `"${(msg.note || '').replace(/"/g, '""')}"`,
      msg.ip,
      msg.region,
      `${msg.os} ${msg.osVersion}`,
      `${msg.browser} ${msg.browserVersion}`,
      msg.deviceModel,
      new Date(msg.created_at).toLocaleString('zh-CN')
    ])

    const csvContent = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `留言导出_${new Date().toLocaleDateString('zh-CN')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('导出成功')
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      toast.error('请先选择要删除的留言')
      return
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条留言吗？此操作不可恢复！`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { status: 'danger' },
      onOk: async () => {
        try {
          const response = await fetch('/api/admin/messages/batch', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selectedRowKeys })
          })
          const result = await response.json()

          if (result.success) {
            toast.success(`成功删除 ${selectedRowKeys.length} 条留言`)
            setSelectedRowKeys([])
            loadMessages(pagination.page, statusFilter)
          } else {
            toast.error(result.message || '批量删除失败')
          }
        } catch (error) {
          console.error('批量删除失败:', error)
          toast.error('批量删除失败')
        }
      }
    })
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: any[]) => {
      setSelectedRowKeys(keys as number[])
    }
  }

  const columns = [
    {
      title: '用户信息',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (_: any, record: Message) => (
        <div className={styles.productInfo}>
          <div className={styles.productName}>{record.name}</div>
        </div>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 220,
      render: (_: any, record: Message) => (
        <div className={styles.productInfo}>
          {record.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <Phone size={12} />
              <span>{record.phone}</span>
            </div>
          )}
          {record.wechat && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 14c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1z" />
                <path d="M16 14c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1z" />
              </svg>
              <span>{record.wechat}</span>
            </div>
          )}
          {record.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <Mail size={12} />
              <span>{record.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '留言内容',
      dataIndex: 'message',
      key: 'message',
      width: 220,
      render: (text: string) => (
        <Tooltip content={text} position="top">
          <div style={{
            maxWidth: 220,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '1.5',
            fontSize: '13px',
            cursor: 'pointer'
          }}>
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '大模型',
      key: 'llmModel',
      width: 80,
      render: (_: any, record: Message) => (
        <div className={styles.productInfo}>
          <div className={styles.productName} style={{ fontSize: 12 }}>{record.llmModel || '-'}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string, record: Message) => {
        const statusColorMap = {
          pending: 'warning',
          processing: 'arcoblue',
          completed: 'success',
          ignored: 'gray'
        }
        const statusLabelMap = {
          pending: '待处理',
          processing: '处理中',
          completed: '已完成',
          ignored: '已忽略'
        }
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Select
              value={status}
              onChange={(newStatus) => handleStatusChange(record, newStatus)}
              allowClear
              style={{ width: 110 }}
            >
              {statusOptions.map(opt => (
                <Select.Option key={opt.value} value={opt.value} style={{ color: opt.color === 'arcoblue' ? '#165DFF' : opt.color === 'warning' ? '#F5A623' : opt.color === 'success' ? '#00B42A' : '#86909C' }}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        )
      },
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      width: 160,
      render: (text: string) => (
        <div style={{
          maxWidth: 160,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.5',
          fontSize: '13px',
          color: text ? '#666' : '#999'
        }}>
          {text || '-'}
        </div>
      ),
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
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Message) => (
        <Space>
          <ActionButton
            type="primary"
            icon={<Eye size={14} />}
            onClick={() => handleView(record)}
          >
            查看
          </ActionButton>
          <Popconfirm
            title="确定要删除这条留言吗？"
            onOk={() => handleDelete(record.id)}
          >
            <ActionButton type="danger">
              删除
            </ActionButton>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>筛选状态:</span>
          <Select
            placeholder="筛选状态"
            style={{ width: 150 }}
            allowClear
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            {statusOptions.map(opt => (
              <Select.Option key={opt.value} value={opt.value} style={{ color: opt.color === 'arcoblue' ? '#165DFF' : opt.color === 'warning' ? '#F5A623' : opt.color === 'success' ? '#00B42A' : '#86909C' }}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<Download size={14} />}
            onClick={handleExport}
          >
            导出全部
          </Button>
        </Space>
      </div>

      {selectedRowKeys.length > 0 && (
        <div style={{
          padding: '12px 16px',
          marginBottom: 16,
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#0369a1', fontSize: 14 }}>
            已选择 <strong>{selectedRowKeys.length}</strong> 条留言
          </span>
          <Space>
            <Button
              type="primary"
              status="danger"
              icon={<Trash2 size={14} />}
              onClick={handleBatchDelete}
            >
              批量删除
            </Button>
            <Button
              type="secondary"
              icon={<Download size={14} />}
              onClick={handleBatchExport}
            >
              导出选中
            </Button>
          </Space>
        </div>
      )}

      <CommonTable
        columns={columns}
        data={messages}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page: number) => loadMessages(page, statusFilter),
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
        style={{ width: 700 }}
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
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>大模型:</span>
                  <span className={styles.detailValue}>{currentMessage.llmModel || '-'}</span>
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
                    allowClear
                    style={{ width: '100%' }}
                  >
                    {statusOptions.map(opt => (
                      <Select.Option key={opt.value} value={opt.value} style={{ color: opt.color === 'arcoblue' ? '#165DFF' : opt.color === 'warning' ? '#F5A623' : opt.color === 'success' ? '#00B42A' : '#86909C' }}>
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
                    allowClear
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