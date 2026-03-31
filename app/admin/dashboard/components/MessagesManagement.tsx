"use client"

import { useState, useEffect } from "react"
import { ManagementHeader, CommonTable, ActionButton } from "./index"
import { MessageSquare, User, Phone, Mail, CheckCircle, XCircle, Eye, Settings, Bell, Save, Code } from "lucide-react"
import { Tag as ArcoTag, Modal, Input, Select, Space, Popconfirm, Tabs, Form, Switch, Button, Card, Tooltip } from '@arco-design/web-react'
import styles from "./BaseManagement.module.css"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { useConfig } from '../common/hooks/useConfig'

const TabPane = Tabs.TabPane
const FormItem = Form.Item

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

interface NotificationConfig {
  pushplus?: {
    enabled?: boolean
    token?: string
    wechatEnabled?: boolean
    feishuEnabled?: boolean
  }
  notificationTemplate?: string
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

const templateOptions = [
  {
    name: '默认模板',
    content: '【新留言通知】\n\n用户信息：\n姓名：{name}\n电话：{phone || \'\'}\n微信：{wechat || \'\'}\n邮箱：{email || \'\'}\n\n留言内容：\n{message}\n\n设备信息：\nIP地址：{ip}\n地区：{region || \'\'}\n操作系统：{os} {osVersion}\n浏览器：{browser} {browserVersion}\n设备机型：{deviceModel}\n\n提交时间：{created_at}\n\n查看详情：{detail_link}\n\n请及时处理！'
  },
  {
    name: '简洁模板',
    content: '【新留言】\n\n姓名：{name}\n电话：{phone || \'\'}\n内容：{message}\n\n提交时间：{created_at}\n\n查看详情：{detail_link}'
  },
  {
    name: '详细模板',
    content: '【重要通知】新留言提醒\n\n尊敬的管理员：\n\n您收到了一条新的用户留言，详情如下：\n\n用户信息\n姓名：{name}\n联系电话：{phone || \'未提供\'}\n微信：{wechat || \'未提供\'}\n邮箱：{email || \'未提供\'}\n\n留言内容\n{message}\n\n设备信息\nIP地址：{ip}\n地区：{region || \'未知\'}\n操作系统：{os} {osVersion}\n浏览器：{browser} {browserVersion}\n设备：{deviceModel}\n\n提交时间：{created_at}\n\n查看详情：{detail_link}\n\n请及时处理此留言。\n\n系统自动发送，请勿回复。'
  }
]

export function MessagesManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'messages')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const { configs, loading: configLoading, saveConfig, hasChanges, fetchConfigs } = useConfig()

  // 通知管理表单状态
  const [notificationForm] = Form.useForm()
  const [notificationSubmitting, setNotificationSubmitting] = useState(false)
  const [showJsonPreview, setShowJsonPreview] = useState(false)

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
    fetchConfigs()
  }, [])

  // 当配置数据加载完成后，设置表单初始值
  useEffect(() => {
    if (configs.notification) {
      notificationForm.setFieldsValue({
        enabled: configs.notification?.pushplus?.enabled || false,
        token: configs.notification?.pushplus?.token || '',
        wechatEnabled: configs.notification?.pushplus?.wechatEnabled || false,
        feishuEnabled: configs.notification?.pushplus?.feishuEnabled || false,
        notificationTemplate: configs.notification?.notificationTemplate || ''
      })
    }
  }, [configs.notification, notificationForm])

  // 处理 Tab 切换，同时更新 URL
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    // 更新 URL，保留当前 Tab 状态
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', key)
    router.push(`?${params.toString()}`, { scroll: false })
  }

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
      } else {
        toast.error(result.message || '更新失败')
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      toast.error('更新失败')
    }
  }

  // 处理通知配置保存
  const handleNotificationSubmit = async (values: any) => {
    setNotificationSubmitting(true)
    try {
      const configData = {
        pushplus: {
          enabled: values.enabled,
          token: values.token,
          wechatEnabled: values.wechatEnabled,
          feishuEnabled: values.feishuEnabled
        },
        notificationTemplate: values.notificationTemplate
      }
      await saveConfig('notification', configData)
      toast.success('配置保存成功')
    } catch (error) {
      console.error('保存配置失败:', error)
      toast.error('配置保存失败')
    } finally {
      setNotificationSubmitting(false)
    }
  }

  // 选择模板
  const handleSelectTemplate = (content: string) => {
    notificationForm.setFieldValue('notificationTemplate', content)
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
      render: (status: string, record: Message) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record, newStatus)}
          allowClear
          style={{ width: 110 }}
        >
          {statusOptions.map(opt => (
            <Select.Option key={opt.value} value={opt.value}>
              {opt.label}
            </Select.Option>
          ))}
        </Select>
      ),
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
    <div className={styles.management}>
      <ManagementHeader
        title="留言管理"
        description="查看和管理用户提交的留言信息"
      />
      
      <Tabs activeTab={activeTab} onChange={handleTabChange} type="card">
        <TabPane key="messages" title="留言列表">
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
        </TabPane>
        
        {/* 通知管理 - 硬编码表单 */}
        <TabPane key="notification" title="通知管理">
          <div style={{ padding: '24px' }}>
            <ManagementHeader
              title="通知管理"
              description="配置用户提交留言时的消息通知功能"
              actions={
                <>
                  <Button
                    icon={<Code size={16} />}
                    onClick={() => setShowJsonPreview(true)}
                    style={{ marginRight: 8 }}
                  >
                    查看JSON
                  </Button>
                  <Button
                    type="primary"
                    icon={<Save size={16} />}
                    loading={notificationSubmitting}
                    onClick={() => notificationForm.submit()}
                  >
                    保存配置
                  </Button>
                </>
              }
            />

            <Card style={{ marginTop: 16 }}>
              <Form
                form={notificationForm}
                layout="vertical"
                onSubmit={handleNotificationSubmit}
                autoComplete="off"
              >
                {/* PushPlus 配置区域 */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>PushPlus配置</h4>
                  
                  <FormItem
                    label="启用通知"
                    field="enabled"
                    triggerPropName="checked"
                  >
                    <Switch />
                  </FormItem>

                  <FormItem
                    label="PushPlus Token"
                    field="token"
                    extra={<div>PushPlus的Token，用于发送消息。获取方式：登录PushPlus官网(<a style={{ color: 'blue' }}  href='https://www.pushplus.plus/' target='_blank'>https://www.pushplus.plus/</a>)，注册账号后在个人中心获取Token。</div>}
                  >
                    <Input.Password placeholder="请输入PushPlus Token" allowClear style={{ width: '100%' }} />
                  </FormItem>

                  <FormItem
                    label="启用微信通知"
                    field="wechatEnabled"
                    triggerPropName="checked"
                    extra="是否通过PushPlus发送微信通知"
                  >
                    <Switch />
                  </FormItem>

                  <FormItem
                    label="启用飞书通知"
                    field="feishuEnabled"
                    triggerPropName="checked"
                    extra="是否通过PushPlus发送飞书通知"
                  >
                    <Switch />
                  </FormItem>
                </div>

                {/* 通知模板区域 */}
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
                  <FormItem
                    label="通知模板"
                    field="notificationTemplate"
                    extra={
                      <div style={{ marginTop: 8 }}>
                        消息通知的模板内容，可使用以下变量：<br/>
                        {'{name}'} - 姓名 {'{phone}'} - 电话 {'{wechat}'} - 微信 {'{email}'} - 邮箱<br/>
                        {'{message}'} - 留言内容 {'{ip}'} - IP地址 {'{region}'} - 地区<br/>
                        {'{os}'} - 操作系统 {'{osVersion}'} - 操作系统版本 {'{browser}'} - 浏览器<br/>
                        {'{browserVersion}'} - 浏览器版本 {'{deviceModel}'} - 设备机型 {'{created_at}'} - 提交时间<br/>
                        {'{detail_link}'} - 留言详情链接（带会话验证）
                      </div>
                    }
                  >
                    <Input.TextArea
                      placeholder="请输入通知模板"
                      rows={15}
                      allowClear
                      style={{ width: '100%', minHeight: '400px', fontFamily: 'monospace' }}
                    />
                  </FormItem>

                  {/* 模板选择 */}
                  <div style={{ marginTop: 16 }}>
                    <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 500 }}>模板选择</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {templateOptions.map((template, index) => (
                        <Button
                          key={index}
                          onClick={() => handleSelectTemplate(template.content)}
                          style={{ flex: '1 1 calc(33.333% - 8px)', minWidth: '200px' }}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Form>
            </Card>
          </div>

          {/* JSON 预览弹窗 */}
          <Modal
            title="JSON预览"
            visible={showJsonPreview}
            onCancel={() => setShowJsonPreview(false)}
            footer={[
              <Button key="close" onClick={() => setShowJsonPreview(false)}>
                关闭
              </Button>,
              <Button
                key="copy"
                type="primary"
                onClick={() => {
                  const values = notificationForm.getFieldsValue()
                  navigator.clipboard.writeText(JSON.stringify({
                    pushplus: {
                      enabled: values.enabled,
                      token: values.token,
                      wechatEnabled: values.wechatEnabled,
                      feishuEnabled: values.feishuEnabled
                    },
                    notificationTemplate: values.notificationTemplate
                  }, null, 2))
                  toast.success('已复制到剪贴板')
                }}
              >
                复制
              </Button>
            ]}
            style={{ width: 800 }}
          >
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: 16, 
              borderRadius: 4, 
              overflow: 'auto',
              maxHeight: 500,
              fontSize: 12
            }}>
              {JSON.stringify({
                pushplus: {
                  enabled: notificationForm.getFieldValue('enabled'),
                  token: notificationForm.getFieldValue('token'),
                  wechatEnabled: notificationForm.getFieldValue('wechatEnabled'),
                  feishuEnabled: notificationForm.getFieldValue('feishuEnabled')
                },
                notificationTemplate: notificationForm.getFieldValue('notificationTemplate')
              }, null, 2)}
            </pre>
          </Modal>
        </TabPane>
      </Tabs>
    </div>
  )
}
