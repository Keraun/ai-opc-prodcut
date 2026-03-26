import { Card, Form, Input, Button, Radio } from "@arco-design/web-react"
import { IconSend } from "@arco-design/web-react/icon"
import type { ModuleProps } from "@/modules/types"
import type { ContactData } from "./types"
import styles from "./index.module.css"

const FormItem = Form.Item
const TextArea = Input.TextArea
const RadioGroup = Radio.Group

const contactPreferences = [
  { label: "电话", value: "phone" },
  { label: "微信", value: "wechat" },
  { label: "邮箱", value: "email" },
]

export function ContactModule({ data }: ModuleProps) {
  const config: ContactData = (data as ContactData) || {}

  const primaryColor = "#1e40af" // 默认主色
  const accentColor = "#06b6d4" // 默认强调色

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.bgPattern} />
      <div className={styles.decorativeOrb1} />
      <div className={styles.decorativeOrb2} />

      <div className={styles.container}>
        <div className={styles.header}>
          <span
            className={styles.tag}
            style={{
              backgroundColor: `${accentColor}0D`,
              color: accentColor,
              borderColor: `${accentColor}33`
            }}
          >
            {config.sectionTag || "联系我们"}
          </span>
          <h2 className={styles.title}>
            {config.title || "准备好开启AI之旅了吗？"}
          </h2>
          <p className={styles.description}>
            {config.description || "留下您的联系方式，我们会尽快与您取得联系"}
          </p>
        </div>

        <Card className={styles.card}>
          <div className={styles.cardContent}>
            <form
              className={styles.form}
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const values = Object.fromEntries(formData)
                
                try {
                  const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(values)
                  })

                  const result = await response.json()
                  if (result.success) {
                    alert(result.message)
                    e.currentTarget.reset()
                  } else {
                    alert(result.message)
                  }
                } catch (error) {
                  alert("提交留言失败，请稍后重试")
                }
              }}
            >
              <div className={styles.formGrid}>
                <div className={styles.formItem}>
                  <label className={styles.formLabel}>姓名 *</label>
                  <Input
                    name="name"
                    placeholder="请输入您的姓名"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formItem}>
                  <label className={styles.formLabel}>电话 *</label>
                  <Input
                    name="phone"
                    placeholder="请输入您的电话号码"
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formItem}>
                <label className={styles.formLabel}>邮箱 *</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="请输入您的邮箱地址"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.formLabel}>公司名称</label>
                <Input
                  name="company"
                  placeholder="请输入您的公司名称（选填）"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.formLabel}>偏好联系方式</label>
                <RadioGroup name="contactPreference">
                  {contactPreferences.map((pref) => (
                    <Radio key={pref.value} value={pref.value}>
                      {pref.label}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>

              <div className={styles.formItem}>
                <label className={styles.formLabel}>留言 *</label>
                <TextArea
                  name="message"
                  placeholder="请简单描述您的需求或问题"
                  autoSize={{ minRows: 4, maxRows: 6 }}
                  className={styles.formTextArea}
                />
              </div>

              <div className={styles.formItem}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.submitButton}
                  style={{ backgroundColor: primaryColor }}
                >
                  <IconSend style={{ marginRight: '0.5rem' }} />
                  提交留言
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </section>
  )
}
