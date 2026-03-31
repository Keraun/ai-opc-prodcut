import { readConfig } from './config-manager'

interface NotificationConfig {
  enabled: boolean
  pushplus?: {
    enabled: boolean
    token: string
    wechatEnabled: boolean
    feishuEnabled: boolean
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
  llmModel?: string
  created_at: string
}

export class NotificationService {
  private getConfig(): NotificationConfig {
    return readConfig('notification') as NotificationConfig
  }

  private renderTemplate(template: string, data: MessageData): string {
    return template
      .replace('{name}', data.name)
      .replace('{phone}', data.phone)
      .replace('{wechat}', data.wechat || '-')
      .replace('{email}', data.email || '-')
      .replace('{message}', data.message)
      .replace('{preference}', data.preference || '-')
      .replace('{llmModel}', data.llmModel || '-')
      .replace('{created_at}', data.created_at)
  }

  async sendPushPlusNotification(data: MessageData, channel: string): Promise<boolean> {
    const config = this.getConfig()
    if (!config.enabled || !config.pushplus?.enabled || !config.pushplus.token) {
      return false
    }

    try {
      const template = config.notificationTemplate || '收到新留言：\n姓名：{name}\n电话：{phone}\n内容：{message}'
      const content = this.renderTemplate(template, data)

      const response = await fetch('https://www.pushplus.plus/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: config.pushplus.token,
          title: '新留言通知',
          content: content,
          template: 'txt',
          channel: channel
        })
      })

      if (!response.ok) {
        console.warn('PushPlus通知发送失败:', await response.text())
        return false
      }

      console.log(`PushPlus ${channel}通知发送成功`)
      return true
    } catch (error) {
      console.error('PushPlus通知发送失败:', error)
      return false
    }
  }

  async sendNotifications(data: MessageData): Promise<void> {
    const config = this.getConfig()
    if (!config.enabled || !config.pushplus?.enabled) {
      return
    }

    const notifications = []

    if (config.pushplus.wechatEnabled) {
      notifications.push(this.sendPushPlusNotification(data, 'wechat'))
    }

    if (config.pushplus.feishuEnabled) {
      notifications.push(this.sendPushPlusNotification(data, 'feishu'))
    }

    await Promise.all(notifications)
  }
}

export const notificationService = new NotificationService()