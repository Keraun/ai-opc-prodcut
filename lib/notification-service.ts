import { readConfig } from './config-manager'
import nodemailer from 'nodemailer'

interface NotificationConfig {
  pushplus?: {
    enabled: boolean
    token: string
    wechatEnabled: boolean
    feishuEnabled: boolean
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
  clawbot?: {
    enabled: boolean
    appId: string
    appSecret: string
    templateId: string
    openId: string
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
    if (!config.pushplus?.enabled || !config.pushplus.token) {
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

  async sendEmailNotification(data: MessageData): Promise<boolean> {
    const config = this.getConfig()
    if (!config.email?.enabled || !config.pushplus?.enabled || !config.pushplus.token) {
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
          channel: 'mail'
        })
      })

      if (!response.ok) {
        console.warn('PushPlus邮件通知发送失败:', await response.text())
        return false
      }

      console.log('PushPlus邮件通知发送成功')
      return true
    } catch (error) {
      console.error('PushPlus邮件通知发送失败:', error)
      return false
    }
  }

  async sendSmsNotification(data: MessageData): Promise<boolean> {
    const config = this.getConfig()
    if (!config.sms?.enabled || !config.pushplus?.enabled || !config.pushplus.token) {
      return false
    }

    try {
      const template = config.notificationTemplate || '收到新留言：姓名：{name}，电话：{phone}，内容：{message}'
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

  async sendClawBotNotification(data: MessageData): Promise<boolean> {
    const config = this.getConfig()
    if (!config.clawbot?.enabled || !config.clawbot.appId || !config.clawbot.appSecret || !config.clawbot.templateId || !config.clawbot.openId) {
      return false
    }

    try {
      // 获取微信 access_token
      const tokenResponse = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.clawbot.appId}&secret=${config.clawbot.appSecret}`)
      const tokenData = await tokenResponse.json()
      
      if (!tokenData.access_token) {
        console.warn('获取微信 access_token 失败:', tokenData)
        return false
      }

      // 渲染模板
      const template = config.notificationTemplate || '收到新留言：\n姓名：{name}\n电话：{phone}\n内容：{message}'
      const content = this.renderTemplate(template, data)

      // 发送模板消息
      const messageResponse = await fetch(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${tokenData.access_token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          touser: config.clawbot.openId,
          template_id: config.clawbot.templateId,
          data: {
            first: {
              value: '新留言通知',
              color: '#173177'
            },
            keyword1: {
              value: data.name || '未提供',
              color: '#173177'
            },
            keyword2: {
              value: data.phone || '未提供',
              color: '#173177'
            },
            keyword3: {
              value: (data.message || '').substring(0, 50) + ((data.message || '').length > 50 ? '...' : ''),
              color: '#173177'
            },
            keyword4: {
              value: data.created_at || new Date().toISOString(),
              color: '#173177'
            },
            remark: {
              value: '请及时处理',
              color: '#173177'
            }
          }
        })
      })

      const messageData = await messageResponse.json()
      
      if (messageData.errcode !== 0) {
        console.warn('发送微信模板消息失败:', messageData)
        return false
      }

      console.log('微信ClawBot通知发送成功')
      return true
    } catch (error) {
      console.error('微信ClawBot通知发送失败:', error)
      return false
    }
  }

  async sendNotifications(data: MessageData): Promise<void> {
    const config = this.getConfig()

    const notifications = []

    // 发送 PushPlus 通知
    if (config.pushplus?.enabled) {
      if (config.pushplus.wechatEnabled) {
        notifications.push(this.sendPushPlusNotification(data, 'wechat'))
      }

      if (config.pushplus.feishuEnabled) {
        notifications.push(this.sendPushPlusNotification(data, 'feishu'))
      }
    }

    // 发送邮件通知
    if (config.email?.enabled) {
      notifications.push(this.sendEmailNotification(data))
    }

    // 发送短信通知
    if (config.sms?.enabled) {
      notifications.push(this.sendSmsNotification(data))
    }

    // 发送微信ClawBot通知
    if (config.clawbot?.enabled) {
      notifications.push(this.sendClawBotNotification(data))
    }

    await Promise.all(notifications)
  }
}

export const notificationService = new NotificationService()