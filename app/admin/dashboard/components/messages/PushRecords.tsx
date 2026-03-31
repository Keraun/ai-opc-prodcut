"use client"

import { useState, useEffect } from "react"
import { CommonTable, ActionButton } from "../index"
import { Bell, CheckCircle, XCircle, Eye, Clock } from "lucide-react"
import { Select, Space, Modal, Tooltip } from '@arco-design/web-react'
import styles from "../BaseManagement.module.css"
import { toast } from "sonner"

interface PushRecord {
  id: number
  messageId: number
  channel: string
  status: string
  content: string
  response: string
  error: string
  created_at: string
  updated_at: string
}

const channelOptions = [
  { value: 'wechat', label: '微信通知' },
  { value: 'webhook', label: 'WebHook通知' },
  { value: 'voice', label: '语音通知' },
  { value: 'email', label: '邮件通知' },
  { value: 'sms', label: '短信通知' },
  { value: 'wxClawBot', label: '微信ClawBot' }
]

const statusOptions = [
  { value: 'pending', label: '待推送' },
  { value: 'success', label: '推送成功' },
  { value: 'failed', label: '推送失败' },
  { value: 'retrying', label: '重试中' }
]

const statusColorMap: Record<string, string> = {
  pending: 'orange',
  success: 'green',
  failed: 'red',
  retrying: 'arcoblue'
}

const statusIconMap: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  success: <CheckCircle size={14} />,
  failed: <XCircle size={14} />,
  retrying: <Clock size={14} />
}

export function PushRecords() {
  const [records, setRecords] = useState<PushRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [channelFilter, setChannelFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<PushRecord | null>(null)

  const loadRecords = async (page = 1, channel = '', status = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pagination.pageSize),
        ...(channel && { channel }),
        ...(status && { status })
      })
      const response = await fetch(`/api/admin/push-records?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setRecords(result.data.list)
        setPagination(prev => ({
          ...prev,
          page: result.data.page,
          total: result.data.total
        }))
      } else {
        toast.error(result.message || '加载失败')
      }
    } catch (error) {
      console.error('加载推送记录失败:', error)
      toast.error('加载推送记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords(pagination.page, channelFilter, statusFilter)
  }, [])

  const handleChannelFilterChange = (value: string) => {
    setChannelFilter(value)
    loadRecords(1, value, statusFilter)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    loadRecords(1, channelFilter, value)
  }

  const handleView = (record: PushRecord) => {
    setCurrentRecord(record)
    setViewModalVisible(true)
  }

  const handleRetry = async (id: number) => {
    try {
      const response = await fetch('/api/admin/push-records/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const result = await response.json()

      if (result.success) {
        toast.success('重试推送成功')
        loadRecords(pagination.page, channelFilter, statusFilter)
      } else {
        toast.error(result.message || '重试失败')
      }
    } catch (error) {
      console.error('重试推送失败:', error)
      toast.error('重试失败')
    }
  }

  const columns = [
    {
      title: '推送时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '留言ID',
      dataIndex: 'messageId',
      key: 'messageId',
      width: 100,
    },
    {
      title: '推送渠道',
      dataIndex: 'channel',
      key: 'channel',
      width: 120,
      render: (channel: string) => {
        const option = channelOptions.find(opt => opt.value === channel)
        return option ? option.label : channel
      },
    },
    {
      title: '推送状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const option = statusOptions.find(opt => opt.value === status)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {statusIconMap[status]}
            <span style={{ color: statusColorMap[status] }}>
              {option ? option.label : status}
            </span>
          </div>
        )
      },
    },
    {
      title: '推送内容',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (text: string) => (
        <Tooltip content={text} position="top">
          <div style={{
            maxWidth: 300,
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
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: PushRecord) => (
        <Space>
          <ActionButton
            type="primary"
            icon={<Eye size={14} />}
            onClick={() => handleView(record)}
          >
            查看
          </ActionButton>
          {record.status === 'failed' && (
            <ActionButton
              type="warning"
              onClick={() => handleRetry(record.id)}
            >
              重试
            </ActionButton>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className={styles.filterBar}>
        筛选渠道:
        <Select
          placeholder="筛选渠道"
          style={{ width: 150, marginRight: 12 }}
          allowClear
          value={channelFilter}
          onChange={handleChannelFilterChange}
        >
          {channelOptions.map(opt => (
            <Select.Option key={opt.value} value={opt.value}>
              {opt.label}
            </Select.Option>
          ))}
        </Select>
        筛选状态:
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
        data={records}
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page: number) => loadRecords(page, channelFilter, statusFilter),
        }}
        emptyIcon={<Bell size={48} />}
        emptyText="暂无推送记录"
      />

      <Modal
        title="推送详情"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        okText="关闭"
        onOk={() => setViewModalVisible(false)}
        style={{ width: 800 }}
      >
        {currentRecord && (
          <div className={styles.modalContent}>
            <div className={styles.detailSection}>
              <h4 className={styles.detailTitle}>基本信息</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>推送时间:</span>
                  <span className={styles.detailValue}>{new Date(currentRecord.created_at).toLocaleString('zh-CN')}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>留言ID:</span>
                  <span className={styles.detailValue}>{currentRecord.messageId}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>推送渠道:</span>
                  <span className={styles.detailValue}>
                    {channelOptions.find(opt => opt.value === currentRecord.channel)?.label || currentRecord.channel}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>推送状态:</span>
                  <span className={styles.detailValue} style={{ color: statusColorMap[currentRecord.status] }}>
                    {statusOptions.find(opt => opt.value === currentRecord.status)?.label || currentRecord.status}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.detailTitle}>推送内容</h4>
              <div className={styles.messageContent} style={{ whiteSpace: 'pre-wrap' }}>
                {currentRecord.content}
              </div>
            </div>

            {currentRecord.response && (
              <div className={styles.detailSection}>
                <h4 className={styles.detailTitle}>响应结果</h4>
                <div className={styles.messageContent} style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>
                  {currentRecord.response}
                </div>
              </div>
            )}

            {currentRecord.error && (
              <div className={styles.detailSection}>
                <h4 className={styles.detailTitle}>错误信息</h4>
                <div className={styles.messageContent} style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff2f0', padding: 12, borderRadius: 4, fontSize: 12, fontFamily: 'monospace', color: '#f5222d' }}>
                  {currentRecord.error}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}