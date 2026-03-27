import type { ModuleProps } from "@/modules/types"
import type { ContactData } from "./types"
import { useTheme } from "@/components/theme-provider"
import { Section } from "@/components/ui"
import { SendIcon } from "@/modules/icons"
import styles from "./index.module.css"

export function ContactModule({ data }: ModuleProps) {
  const config: ContactData = (data as ContactData) || {}
  const { themeConfig } = useTheme()

  const primaryColor = themeConfig?.colors.primary || "#1e40af" // 默认主色
  const accentColor = themeConfig?.colors.accent || "#06b6d4" // 默认强调色

  return (
    <Section
      id="contact"
      badge={config.sectionTag}
      title={config.title}
      description={config.description}
      className={styles.section}
      badgeType="yellow"
      centered
    >
      <div className={styles.bgPattern} />
      <div className={styles.decorativeOrb1} />
      <div className={styles.decorativeOrb2} />

      <div className={styles.container}>
        <div className={styles.card}>
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
                  <label className={styles.formLabel} htmlFor="name">姓名 *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="请输入您的姓名"
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formItem}>
                  <label className={styles.formLabel} htmlFor="phone">电话 *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="请输入您的电话号码"
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.formItem}>
                <label className={styles.formLabel} htmlFor="email">邮箱 *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="请输入您的邮箱地址"
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.formLabel} htmlFor="company">公司名称</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="请输入您的公司名称（选填）"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.formLabel}>偏好联系方式</label>
                <div className={styles.radioGroup}>
                  {config.contactPreferences?.map((pref) => (
                    <label key={pref.value} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="contactPreference"
                        value={pref.value}
                        defaultChecked={pref.value === 'wechat'}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioText}>{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formItem}>
                <label className={styles.formLabel} htmlFor="message">留言 *</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="请简单描述您的需求或问题"
                  rows={4}
                  className={styles.formTextArea}
                  required
                />
              </div>

              <div className={styles.formItem}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  style={{ backgroundColor: primaryColor }}
                >
                  <span style={{ marginRight: '0.5rem' }}><SendIcon /></span>
                  提交留言
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Section>
  )
}
