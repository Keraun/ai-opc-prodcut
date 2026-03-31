"use client"

import { useState, useEffect } from "react"
import { ManagementHeader, CommonTable } from "../index"
import { Code, Save } from "lucide-react"
import { Form, Switch, Input, Button, Card, Modal } from '@arco-design/web-react'
import { toast } from "sonner"
import { useConfig } from '../../common/hooks/useConfig'

const FormItem = Form.Item

const templateOptions = [
  {
    name: '默认模板',
    content: '【新留言通知】\n\n用户信息：\n姓名：{name}\n电话：{phone}\n微信：{wechat}\n邮箱：{email}\n偏好联系方式：{preference}\n\n留言内容：\n{message}\n\n大模型信息：\n使用模型：{llmModel}\n\n设备信息：\nIP地址：{ip}\n地区：{region}\n操作系统：{os} {osVersion}\n浏览器：{browser} {browserVersion}\n设备机型：{deviceModel}\n\n提交时间：{created_at}\n\n查看详情：{detail_link}\n\n请及时处理！'
  },
  {
    name: '简洁模板',
    content: '【新留言】\n\n姓名：{name}\n电话：{phone}\n偏好联系方式：{preference}\n内容：{message}\n大模型：{llmModel}\n\n提交时间：{created_at}\n\n查看详情：{detail_link}'
  },
  {
    name: '详细模板',
    content: '【重要通知】新留言提醒\n\n尊敬的管理员：\n\n您收到了一条新的用户留言，详情如下：\n\n用户信息\n姓名：{name}\n联系电话：{phone}\n微信：{wechat}\n邮箱：{email}\n偏好联系方式：{preference}\n\n留言内容\n{message}\n\n大模型信息\n使用模型：{llmModel}\n\n设备信息\nIP地址：{ip}\n地区：{region}\n操作系统：{os} {osVersion}\n浏览器：{browser} {browserVersion}\n设备：{deviceModel}\n\n提交时间：{created_at}\n\n查看详情：{detail_link}\n\n请及时处理此留言。\n\n系统自动发送，请勿回复。'
  }
]

export function NotificationSettings() {
  const { configs, loading: configLoading, saveConfig, fetchConfigs } = useConfig()
  const [notificationForm] = Form.useForm()
  const [notificationSubmitting, setNotificationSubmitting] = useState(false)
  const [showJsonPreview, setShowJsonPreview] = useState(false)

  useEffect(() => {
    fetchConfigs()
  }, [])

  // 当配置数据加载完成后，设置表单初始值
  useEffect(() => {
    if (configs.notification) {
      notificationForm.setFieldsValue({
        enabled: configs.notification?.pushplus?.enabled || false,
        token: configs.notification?.pushplus?.token || '',
        wechatEnabled: configs.notification?.pushplus?.wechatEnabled || false,
        webHookEnabled: configs.notification?.pushplus?.webHookEnabled || false,
        voiceEnabled: configs.notification?.pushplus?.voiceEnabled || false,
        emailEnabled: configs.notification?.email?.enabled || false,
        smsEnabled: configs.notification?.sms?.enabled || false,
        wxClawBotEnabled: configs.notification?.wxClawBot?.enabled || false,
        notificationTemplate: configs.notification?.notificationTemplate || ''
      })
    }
  }, [configs.notification, notificationForm])

  // 处理通知配置保存
  const handleNotificationSubmit = async (values: any) => {
    setNotificationSubmitting(true)
    try {
      // 检查启用的渠道数量
      const enabledChannels = [
        values.wechatEnabled,
        values.webHookEnabled,
        values.voiceEnabled,
        values.emailEnabled,
        values.smsEnabled,
        values.wxClawBotEnabled
      ].filter(Boolean).length

      if (enabledChannels === 0) {
        toast.error('请至少启用一个通知渠道')
        setNotificationSubmitting(false)
        return
      }

      if (enabledChannels < 3 || enabledChannels > 5) {
        toast.warning('建议配置3~5个通知渠道以获得更好的通知效果')
      }

      const configData = {
        pushplus: {
          enabled: values.enabled,
          token: values.token,
          wechatEnabled: values.wechatEnabled,
          webHookEnabled: values.webHookEnabled,
          voiceEnabled: values.voiceEnabled
        },
        email: {
          enabled: values.emailEnabled
        },
        sms: {
          enabled: values.smsEnabled
        },
        wxClawBot: {
          enabled: values.wxClawBotEnabled
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

  return (
    <div style={{ padding: '24px' }}>
      <ManagementHeader
        title="通知管理"
        description="配置用户提交留言时的消息通知功能（建议配置3~5个渠道）"
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
          {/* 基础配置 */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>基础配置</h4>
            <FormItem
              label="启用PushPlus通知"
              field="enabled"
              triggerPropName="checked"
              extra={
                <div>启用后才能使用PushPlus相关的通知渠道,需要你在 <a href="https://www.pushplus.plus/" style={{ color: '#165DFF' }} target="_blank">pushplus </a> 网站注册账号,并在微信服务号 <b style={{ color: 'red' }}>pushplus推送加</b> 绑定你个人微信,完成 <b style={{ color: 'red' }}>实名验证</b>(3块钱费用)才可正常推送消息</div>
              }

            >
              <Switch />
            </FormItem>

            <FormItem
              label="PushPlus Token"
              field="token"
              extra={<div>PushPlus的Token，用于发送消息。获取方式：登录PushPlus官网(<a style={{ color: 'blue' }} href='https://www.pushplus.plus/' target='_blank'>https://www.pushplus.plus/</a>)，注册账号后在个人中心获取Token。</div>}
            >
              <Input.Password placeholder="请输入PushPlus Token" allowClear style={{ width: '100%' }} />
            </FormItem>
          </div>

          {/* 通知渠道配置表格 */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
            <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>pushplus 通知渠道配置 <span style={{ fontSize: 12, color: '#666', fontWeight: 400 }}>(建议选择3~5个渠道)</span></h4>

            <CommonTable
              columns={[
                {
                  title: '渠道名称',
                  dataIndex: 'name',
                  key: 'name',
                  width: 120,
                  render: (name: string) => (
                    <span style={{ fontWeight: 500 }}>{name}</span>
                  )
                },
                {
                  title: '收费',
                  dataIndex: 'isFree',
                  key: 'isFree',
                  width: 80,
                  render: (isFree: boolean) => (
                    isFree ? (
                      <span style={{ color: 'green', fontSize: 12, padding: '2px 8px', borderRadius: 10, backgroundColor: '#f0f9ff' }}>免费</span>
                    ) : (
                      <span style={{ color: 'orange', fontSize: 12, padding: '2px 8px', borderRadius: 10, backgroundColor: '#fff7e6' }}>付费</span>
                    )
                  )
                },
                {
                  title: '渠道说明',
                  dataIndex: 'description',
                  key: 'description',
                  render: (desc: string, record: any) => (
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                      <div>{desc}</div>
                      {record.extraInfo && (
                        <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                          {record.extraInfo}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: '教程',
                  dataIndex: 'link',
                  key: 'link',
                  width: 120,
                  render: (link: string) => (
                    link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#165DFF', fontSize: 12 }}
                      >
                        查看教程
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: '#999' }}>-</span>
                    )
                  )
                },
                {
                  title: '启用状态',
                  key: 'enabled',
                  width: 120,
                  render: (_: any, record: any) => (
                    <FormItem
                      field={record.field}
                      triggerPropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Switch />
                    </FormItem>
                  )
                }
              ]}
              data={[
                {
                  id: 'wechat',
                  name: '微信通知',
                  description: '通过PushPlus发送微信通知，消息推送在 pushplus推送加 服务号，需先注册绑定个人微信',
                  isFree: true,
                  field: 'wechatEnabled'
                },
                {
                  id: 'webhook',
                  name: 'WebHook通知',
                  description: '通过PushPlus发送WebHook通知(钉钉、飞书等)，需要先在PushPlus平台配置webhook',
                  isFree: true,
                  field: 'webHookEnabled',
                  link: 'https://www.pushplus.plus/doc/extend/webhook.html'
                },
                {
                  id: 'voice',
                  name: '语音通知',
                  description: '通过PushPlus发送语音通知',
                  isFree: true,
                  field: 'voiceEnabled'
                },
                {
                  id: 'email',
                  name: '邮件通知',
                  description: '通过PushPlus邮件渠道发送通知，需要先在PushPlus平台配置邮箱',
                  isFree: true,
                  field: 'emailEnabled',
                  link: 'https://www.pushplus.plus/doc/extend/mail.html'
                },
                {
                  id: 'sms',
                  name: '短信通知',
                  description: '收费使用，1条短信扣减10积分。需要先在 PushPlus 平台个人中心绑定手机号',
                  isFree: false,
                  field: 'smsEnabled',
                  link: 'https://www.pushplus.plus/uc-profile.html'
                },
                {
                  id: 'wxClawBot',
                  name: '微信ClawBot',
                  description: '使用 PushPlus 微信ClawBot渠道发送通知，需要先在 PushPlus 平台绑定微信',
                  isFree: false,
                  field: 'wxClawBotEnabled',
                  link: 'https://www.pushplus.plus/doc/channel/clawbot.html#%E6%93%8D%E4%BD%9C%E6%B5%81%E7%A8%8B',
                  extraInfo: '• 绑定后需要主动发起一次对话，才能下发消息\n• 每下发10次消息后，需要主动发起一次对话\n• 每隔24小时，也需要有一次主动对话'
                }
              ]}
              pagination={false}
              emptyText="暂无渠道配置"
            />
          </div>

          {/* 通知模板区域 */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
            <FormItem
              label="通知模板"
              field="notificationTemplate"
              extra={
                <div style={{ marginTop: 8 }}>
                  消息通知的模板内容，可使用以下变量：<br />
                  {'{name}'} - 姓名 {'{phone}'} - 电话 {'{wechat}'} - 微信 {'{email}'} - 邮箱<br />
                  {'{message}'} - 留言内容 {'{ip}'} - IP地址 {'{region}'} - 地区<br />
                  {'{os}'} - 操作系统 {'{osVersion}'} - 操作系统版本 {'{browser}'} - 浏览器<br />
                  {'{browserVersion}'} - 浏览器版本 {'{deviceModel}'} - 设备机型 {'{created_at}'} - 提交时间<br />
                  {'{detail_link}'} - 留言详情链接（带会话验证）<br />
                  <br />
                  <span style={{ color: '#165DFF' }}>系统默认使用HTML格式发送通知，支持富文本和链接。</span>
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
                  webHookEnabled: values.webHookEnabled,
                  voiceEnabled: values.voiceEnabled
                },
                email: {
                  enabled: values.emailEnabled
                },
                sms: {
                  enabled: values.smsEnabled
                },
                wxClawBot: {
                  enabled: values.wxClawBotEnabled
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
              webHookEnabled: notificationForm.getFieldValue('webHookEnabled'),
              voiceEnabled: notificationForm.getFieldValue('voiceEnabled')
            },
            email: {
              enabled: notificationForm.getFieldValue('emailEnabled')
            },
            sms: {
              enabled: notificationForm.getFieldValue('smsEnabled')
            },
            wxClawBot: {
              enabled: notificationForm.getFieldValue('wxClawBotEnabled')
            },
            notificationTemplate: notificationForm.getFieldValue('notificationTemplate')
          }, null, 2)}
        </pre>
      </Modal>
    </div>
  )
}