import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    console.warn('SMTP configuration is incomplete. Email sending will be disabled.')
    return null
  }

  return {
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465,
    auth: {
      user,
      pass
    }
  }
}

function createTransporter(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    }
  })
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const config = getEmailConfig()
  
  if (!config) {
    console.error('Email configuration is missing')
    return false
  }

  try {
    const transporter = createTransporter(config)
    
    const fromEmail = process.env.SMTP_FROM || config.auth.user
    
    await transporter.sendMail({
      from: `"创客AI" <${fromEmail}>`,
      to,
      subject,
      html
    })

    console.log(`Email sent successfully to ${to}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export function generateVerificationCodeEmail(code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>验证码</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .content {
          padding: 40px 30px;
        }
        .code-box {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .code {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #667eea;
          font-family: 'Courier New', monospace;
        }
        .info {
          color: #666;
          font-size: 14px;
          margin-top: 20px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin-top: 20px;
          border-radius: 4px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>创客AI</h1>
        </div>
        <div class="content">
          <p>您好，</p>
          <p>您正在进行密码重置操作，请使用以下验证码完成验证：</p>
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          <div class="info">
            <p>验证码有效期为 <strong>5分钟</strong>，请尽快完成验证。</p>
          </div>
          <div class="warning">
            <p style="margin: 0;"><strong>安全提示：</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>请勿将验证码透露给任何人</li>
              <li>如非本人操作，请忽略此邮件</li>
              <li>创客AI不会主动向您索要验证码</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>© 创客AI · 配置管理系统</p>
          <p>此邮件由系统自动发送，请勿直接回复</p>
        </div>
      </div>
    </body>
    </html>
  `
}
