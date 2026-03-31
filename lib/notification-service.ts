import { readConfig } from './config-manager'

// 通知配置接口
export interface NotificationConfig {
  pushplus?: {
    enabled: boolean
    token: string
    wechatEnabled: boolean
    webHookEnabled: boolean
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
  wxClawBot?: {
    enabled: boolean
    appId: string
    appSecret: string
    templateId: string
    openId: string
  }
  notificationTemplate?: string
  notificationTemplateType?: 'txt' | 'html'
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
      const templateType = this.config.notificationTemplateType || 'html' // 默认使用html类型
      const content = this.renderTemplate(template, data, templateType)

      const response = await fetch('https://www.pushplus.plus/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: this.config.pushplus.token,
          title: '新留言通知',
          content: content,
          template: templateType,
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

  protected detectTemplateType(template: string): 'txt' | 'html' {
    // 简单检测模板是否包含HTML标签
    const htmlPattern = /<[^>]+>/g
    return htmlPattern.test(template) ? 'html' : 'txt'
  }

  protected renderTemplate(template: string, data: MessageData, templateType: 'txt' | 'html'): string {
    // 确保message字段中的换行符被正确处理
    const processedMessage = templateType === 'html' 
      ? data.message.replace(/\n/g, '<br/>')
      : data.message
    
    // 替换所有变量
    let content = template
      .replace(/{name}/g, data.name)
      .replace(/{phone}/g, data.phone)
      .replace(/{wechat}/g, data.wechat || '-')
      .replace(/{email}/g, data.email || '-')
      .replace(/{message}/g, processedMessage)
      .replace(/{preference}/g, data.preference || '-')
      .replace(/{llmModel}/g, data.llmModel || '-')
      .replace(/{ip}/g, data.ip || '-')
      .replace(/{region}/g, data.region || '-')
      .replace(/{os}/g, data.os || '-')
      .replace(/{osVersion}/g, data.osVersion || '-')
      .replace(/{browser}/g, data.browser || '-')
      .replace(/{browserVersion}/g, data.browserVersion || '-')
      .replace(/{deviceModel}/g, data.deviceModel || '-')
      .replace(/{created_at}/g, this.formatDate(data.created_at))

    // 处理 detail_link
    if (data.detail_link) {
      if (templateType === 'html') {
        content = content.replace(
          /查看详情：{detail_link}/g,
          `<a href="${data.detail_link}" style="color: #165DFF; text-decoration: underline;">查看详情</a>`
        )
        // 也处理没有"查看详情："前缀的情况
        content = content.replace(
          /{detail_link}/g,
          `<a href="${data.detail_link}" style="color: #165DFF; text-decoration: underline;">查看详情</a>`
        )
      } else {
        content = content.replace(/{detail_link}/g, data.detail_link)
      }
    } else {
      content = content.replace(/查看详情：{detail_link}/g, '查看详情：-')
      content = content.replace(/{detail_link}/g, '-')
    }

    // 如果是HTML格式，添加基本的HTML结构
    if (templateType === 'html' && !content.includes('<html') && !content.includes('<body') && !content.includes('<div')) {
      content = this.convertToHtml(content)
    }

    return content
  }

  protected convertToHtml(text: string): string {
    // 将换行符转换为 <br/>
    let html = text.replace(/\n/g, '<br/>')
    
    // 将连续的 <br/><br/> 转换为段落
    html = html.replace(/<br\/><br\/>/g, '</p><p>')
    
    // 包装在段落标签中
    html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333;">
<p>${html}</p>
</div>`
    
    return html
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
    return super.isEnabled() && this.config.pushplus?.webHookEnabled || false
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
      const templateType = this.config.notificationTemplateType || 'html' // 默认使用html类型
      const content = this.renderTemplate(template, data, templateType)

      const response = await fetch('https://www.pushplus.plus/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: this.config.pushplus.token,
          title: '新留言通知',
          content: content,
          template: templateType,
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

// WxClawBot通知渠道
class WxClawBotChannel extends PushPlusChannel {
  isEnabled(): boolean {
    return this.config.wxClawBot?.enabled || false
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
      new WxClawBotChannel(config, 'clawbot')
    ]

    // 发送所有启用的通知
    const notifications = channels
      .filter(channel => channel.isEnabled())
      .map(channel => channel.send(data))

    await Promise.all(notifications)
  }
}

export const notificationService = new NotificationService()