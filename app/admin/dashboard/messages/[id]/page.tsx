"use client"

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ManagementHeader } from '@/app/admin/dashboard/components'
import { Tag, Select, Input, Button } from '@arco-design/web-react'
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Phone, Mail, Globe, Laptop, Monitor, Wifi, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { checkAuthStatus } from '@/lib/api-client'
import styles from './message-detail.module.css'

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

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<string>('')
  const [editNote, setEditNote] = useState<string>('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        setAuthLoading(true)
        setAuthError(null)
        
        // 构建认证检查的 URL，包含会话验证参数
        const params = new URLSearchParams()
        const token = searchParams.get('token')
        const sessionId = searchParams.get('sessionId')
        
        if (token) params.set('token', token)
        if (sessionId) params.set('sessionId', sessionId)

        // 检查认证状态
        const authResult = await checkAuthStatus()
        
        if (!authResult.authenticated) {
          setAuthError('认证失败，请登录后访问')
          toast.error('认证失败，请登录后访问')
          // 跳转到登录页面
          router.push('/admin')
          return
        }

        // 认证成功，加载留言详情
        await loadMessageDetail()
      } catch (error) {
        console.error('认证失败:', error)
        setAuthError('认证失败，请登录后访问')
        toast.error('认证失败，请登录后访问')
        router.push('/admin')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuthAndLoad()
  }, [id, searchParams, router])

  const loadMessageDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 构建请求参数，包括会话验证参数
      const params = new URLSearchParams()
      const token = searchParams.get('token')
      const sessionId = searchParams.get('sessionId')
      
      if (token) params.set('token', token)
      if (sessionId) params.set('sessionId', sessionId)

      const response = await fetch(`/api/admin/messages?id=${id}&${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setMessage(result.data)
        setEditStatus(result.data.status)
        setEditNote(result.data.note || '')
      } else {
        setError(result.message || '加载失败')
        toast.error(result.message || '加载失败')
      }
    } catch (error) {
      console.error('加载留言详情失败:', error)
      setError('加载失败，请稍后重试')
      toast.error('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleUpdate = async () => {
    if (!message) return
    
    try {
      setUpdating(true)
      
      // 构建请求参数，包括会话验证参数
      const params = new URLSearchParams()
      const token = searchParams.get('token')
      const sessionId = searchParams.get('sessionId')
      
      if (token) params.set('token', token)
      if (sessionId) params.set('sessionId', sessionId)

      const response = await fetch(`/api/admin/messages?${params.toString()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: message.id,
          status: editStatus,
          note: editNote
        })
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('更新成功')
        // 重新加载留言详情
        await loadMessageDetail()
      } else {
        toast.error(result.message || '更新失败')
      }
    } catch (error) {
      console.error('更新失败:', error)
      toast.error('更新失败，请稍后重试')
    } finally {
      setUpdating(false)
    }
  }

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>认证中...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{authError}</p>
          <button className={styles.backButton} onClick={handleBack}>
            返回
          </button>
        </div>
      </div>
    )
  }

  if (error || !message) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || '留言不存在'}</p>
          <button className={styles.backButton} onClick={handleBack}>
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={16} />
          返回
        </button>
        <h1 className={styles.title}>留言详情</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>基本信息</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <User size={14} />
                <span>姓名</span>
              </div>
              <div className={styles.infoValue}>{message.name}</div>
            </div>
            {message.phone && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  <Phone size={14} />
                  <span>电话</span>
                </div>
                <div className={styles.infoValue}>{message.phone}</div>
              </div>
            )}
            {message.wechat && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M8 14c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1z" />
                    <path d="M16 14c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1z" />
                  </svg>
                  <span>微信</span>
                </div>
                <div className={styles.infoValue}>{message.wechat}</div>
              </div>
            )}
            {message.email && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  <Mail size={14} />
                  <span>邮箱</span>
                </div>
                <div className={styles.infoValue}>{message.email}</div>
              </div>
            )}
            {message.llmModel && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  <Globe size={14} />
                  <span>大模型</span>
                </div>
                <div className={styles.infoValue}>{message.llmModel}</div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>留言内容</h2>
          <div className={styles.messageContent}>
            {message.message}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>设备信息</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <Laptop size={14} />
                <span>操作系统</span>
              </div>
              <div className={styles.infoValue}>{message.os} {message.osVersion}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <Monitor size={14} />
                <span>浏览器</span>
              </div>
              <div className={styles.infoValue}>{message.browser} {message.browserVersion}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <Wifi size={14} />
                <span>设备机型</span>
              </div>
              <div className={styles.infoValue}>{message.deviceModel}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <Globe size={14} />
                <span>IP地址</span>
              </div>
              <div className={styles.infoValue}>{message.ip}</div>
            </div>
            {message.region && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>
                  <Globe size={14} />
                  <span>地区</span>
                </div>
                <div className={styles.infoValue}>{message.region}</div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>处理信息</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <CheckCircle size={14} />
                <span>状态</span>
              </div>
              <div className={styles.infoValue}>
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
            </div>
            <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.infoLabel}>
                <Clock size={14} />
                <span>备注</span>
              </div>
              <div className={styles.infoValue}>
                <Input.TextArea
                  value={editNote}
                  onChange={setEditNote}
                  placeholder="添加处理备注..."
                  rows={3}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <Calendar size={14} />
                <span>提交时间</span>
              </div>
              <div className={styles.infoValue}>{new Date(message.created_at).toLocaleString('zh-CN')}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <Calendar size={14} />
                <span>更新时间</span>
              </div>
              <div className={styles.infoValue}>{new Date(message.updated_at).toLocaleString('zh-CN')}</div>
            </div>
          </div>
          <div className={styles.actionBar}>
            <Button
              type="primary"
              onClick={handleUpdate}
              loading={updating}
            >
              保存更新
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
