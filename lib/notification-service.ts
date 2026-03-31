import { readConfig } from './config-manager'

// 通知配置接口
export interface NotificationConfig {
  pushplus?: {
    enabled: boolean
    token: string
    wechatEnabled: boolean
    feishuEnabled: boolean
    voiceEnabled: boolean
  }
  email?: {
    enabled: boolean
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    fromEmail: string
    toEmail: string
  }
  sms?: {
    enabled: boolean
  }
  clawbot?: {
    enabled: boolean
    appId: string
    appSecret: string
    templateId: string
    openId: string
  }
  notificationTemplate?: string
}

// 消息数据接口
export interface MessageData {
  name: string
  phone: string
  wechat?: string
  email?: string
  message: string
  preference?: string
  llmModel?: string
  ip?: string
  region?: string
  os?: string
  osVersion?: string
  browser?: string
  browserVersion?: string
  deviceModel?: string
  detail_link?: string
  created_at: string
}

// 通知渠道接口
interface NotificationChannel {
  send(data: MessageData): Promise<boolean>
  isEnabled(): boolean
}

// PushPlus通知渠道基类
class PushPlusChannel implements NotificationChannel {
  protected config: NotificationConfig
  protected channel: string

  constructor(config: NotificationConfig, channel: string) {
    this.config = config
    this.channel = channel
  }

  isEnabled(): boolean {
    return this.config.pushplus?.enabled || false
  }

  async send(data: MessageData): Promise<boolean> {
    if (!this.config.pushplus?.token) {
      return false
    }

    try {
      const template = this.config.notificationTemplate || '收到新留言：\n姓名：{name}\n电话：{phone}\n内容：{message}'
      const content = this.renderTemplate(template, data)

      const response = await fetch('https://www.pushplus.plus/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: this.config.pushplus.token,
          title: '新留言通知',
          content: content,
          template: 'txt',
          channel: this.channel
        })
      })

      if (!response.ok) {
        console.warn(`PushPlus ${this.channel}通知发送失败:`, await response.text())
        return false
      }

      console.log(`PushPlus ${this.channel}通知发送成功`)
      return true
    } catch (error) {
      console.error(`PushPlus ${this.channel}通知发送失败:`, error)
      return false
    }
  }

  protected renderTemplate(template: string, data: MessageData): string {
    // 确保message字段中的换行符被正确处理
    const processedMessage = data.message.replace(/\n/g, '\n')
    
    return template
      .replace('{name}', data.name)
      .replace('{phone}', data.phone)
      .replace('{wechat}', data.wechat || '-')
      .replace('{email}', data.email || '-')
      .replace('{message}', processedMessage)
      .replace('{preference}', data.preference || '-')
      .replace('{llmModel}', data.llmModel || '-')
      .replace('{ip}', data.ip || '-')
      .replace('{region}', data.region || '-')
      .replace('{os}', data.os || '-')
      .replace('{osVersion}', data.osVersion || '-')
      .replace('{browser}', data.browser || '-')
      .replace('{browserVersion}', data.browserVersion || '-')
      .replace('{deviceModel}', data.deviceModel || '-')
      .replace('{detail_link}', data.detail_link || '-')
      .replace('{created_at}', this.formatDate(data.created_at))
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
}

// 微信通知渠道
class WechatChannel extends PushPlusChannel {
  isEnabled(): boolean {
    return super.isEnabled() && this.config.pushplus?.wechatEnabled || false
  }
}

// 飞书通知渠道
class FeishuChannel extends PushPlusChannel {
  isEnabled(): boolean {
    return super.isEnabled() && this.config.pushplus?.feishuEnabled || false
  }
}

// 语音通知渠道
class VoiceChannel extends PushPlusChannel {
  isEnabled(): boolean {
    return super.isEnabled() && this.config.pushplus?.voiceEnabled || false
  }
}

// 邮件通知渠道
class EmailChannel extends PushPlusChannel {
  isEnabled(): boolean {
    return this.config.email?.enabled || false
  }
}

// 短信通知渠道
class SmsChannel extends PushPlusChannel {
  isEnabled(): boolean {
    return this.config.sms?.enabled || false
  }

  async send(data: MessageData): Promise<boolean> {
    if (!this.config.pushplus?.token) {
      return false
    }

    try {
      // 短信模板需要更简洁
      const template = this.config.notificationTemplate || '收到新留言：姓名：{name}，电话：{phone}，内容：{message}'
      const content = this.renderTemplate(template, data)

      const response = await fetch('https://www.pushplus.plus/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: this.config.pushplus.token,
          title: '新留言通知',
          content: content,
          template: 'txt',
          channel: 'sms'
        })
      })

      if (!response.ok) {
        console.warn('PushPlus短信通知发送失败:', await response.text())
        return false
      }

      console.log('PushPlus短信通知发送成功')
      return true
    } catch (error) {
      console.error('PushPlus短信通知发送失败:', error)
      return false
    }
  }
}

// ClawBot通知渠道
class ClawBotChannel extends PushPlusChannel {
  isEnabled(): boolean {
    return this.config.clawbot?.enabled || false
  }
}

// 通知服务类
export class NotificationService {
  private getConfig(): NotificationConfig {
    return readConfig('notification') as NotificationConfig
  }

  async sendNotifications(data: MessageData): Promise<void> {
    const config = this.getConfig()
    
    // 创建通知渠道实例
    const channels: NotificationChannel[] = [
      new WechatChannel(config, 'wechat'),
      new FeishuChannel(config, 'feishu'),
      new VoiceChannel(config, 'voice'),
      new EmailChannel(config, 'mail'),
      new SmsChannel(config, 'sms'),
      new ClawBotChannel(config, 'clawbot')
    ]

    // 发送所有启用的通知
    const notifications = channels
      .filter(channel => channel.isEnabled())
      .map(channel => channel.send(data))

    await Promise.all(notifications)
  }
}

export const notificationService = new NotificationService()