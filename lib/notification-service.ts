import { readConfig } from './config-manager'

interface NotificationConfig {
  enabled: boolean
  wechat?: {
    enabled: boolean
    webhookUrl: string
  }
  feishu?: {
    enabled: boolean
    webhookUrl: string
  }
  notificationTemplate?: string
}

interface MessageData {
  name: string
  phone: string
  wechat?: string
  email?: string
  message: string
  preference?: string
  created_at: string
}

export class NotificationService {
  private config: NotificationConfig

  constructor() {
    this.config = readConfig('notification') as NotificationConfig
  }

  private renderTemplate(template: string, data: MessageData): string {
    return template
      .replace('{name}', data.name)
      .replace('{phone}', data.phone)
      .replace('{wechat}', data.wechat || '-')
      .replace('{email}', data.email || '-')
      .replace('{message}', data.message)
      .replace('{preference}', data.preference || '-')
      .replace('{created_at}', data.created_at)
  }

  async sendWechatNotification(data: MessageData): Promise<boolean> {
    if (!this.config.enabled || !this.config.wechat?.enabled || !this.config.wechat.webhookUrl) {
      return false
    }

    try {
      const template = this.config.notificationTemplate || '收到新留言：\n姓名：{name}\n电话：{phone}\n内容：{message}'
      const content = this.renderTemplate(template, data)

      const response = await fetch(this.config.wechat.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msgtype: 'text',
          text: {
            content
          }
        })
      })

      if (!response.ok) {
        console.warn('微信通知发送失败:', await response.text())
        return false
      }

      console.log('微信通知发送成功')
      return true
    } catch (error) {
      console.error('微信通知发送失败:', error)
      return false
    }
  }

  async sendFeishuNotification(data: MessageData): Promise<boolean> {
    if (!this.config.enabled || !this.config.feishu?.enabled || !this.config.feishu.webhookUrl) {
      return false
    }

    try {
      const template = this.config.notificationTemplate || '收到新留言：\n姓名：{name}\n电话：{phone}\n内容：{message}'
      const content = this.renderTemplate(template, data)

      const response = await fetch(this.config.feishu.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msg_type: 'text',
          content: {
            text: content
          }
        })
      })

      if (!response.ok) {
        console.warn('飞书通知发送失败:', await response.text())
        return false
      }

      console.log('飞书通知发送成功')
      return true
    } catch (error) {
      console.error('飞书通知发送失败:', error)
      return false
    }
  }

  async sendNotifications(data: MessageData): Promise<void> {
    await Promise.all([
      this.sendWechatNotification(data),
      this.sendFeishuNotification(data)
    ])
  }
}

export const notificationService = new NotificationService()