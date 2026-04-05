'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SendIcon } from '@/modules/icons'
import { submitContactForm } from '@/lib/api-client'
import { useModuleTheme } from '@/hooks/use-module-theme'
import styles from './index.module.css'

interface ContactFormProps {
  contactPreferences?: Array<{ value?: string; label?: string }>
}

export function ContactFormClient({ contactPreferences }: ContactFormProps) {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { primaryColor } = useModuleTheme()

  useEffect(() => {
    const contact = searchParams.get('contact')
    if (contact === 'success') {
      setMessage({ type: 'success', text: '感谢您的留言，我们会尽快与您联系！' })
      // 清除URL参数
      window.history.replaceState({}, '', window.location.pathname)
    } else if (contact === 'error') {
      setMessage({ type: 'error', text: '提交留言失败，请稍后重试' })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setMessage(null)
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const result = await submitContactForm(formData)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        form.reset()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setMessage({ type: 'error', text: '提交失败，请稍后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} method="post">
      {message?.type === 'error' && (
        <div className={styles.errorMessage}>{message.text}</div>
      )}

      {message?.type === 'success' && (
        <div className={styles.successMessage}>{message.text}</div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formItem}>
          <label className={styles.formLabel} htmlFor="name">
            姓名 *
          </label>
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
          <label className={styles.formLabel} htmlFor="phone">
            电话 *
          </label>
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

      <div className={styles.formGrid}>
        <div className={styles.formItem}>
          <label className={styles.formLabel} htmlFor="email">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="请输入您的邮箱地址（选填）"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formItem}>
          <label className={styles.formLabel} htmlFor="wechat">
            微信
          </label>
          <input
            id="wechat"
            name="wechat"
            type="text"
            placeholder="请输入您的微信号（选填）"
            className={styles.formInput}
          />
        </div>
      </div>

      <div className={styles.formItem}>
        <label className={styles.formLabel} htmlFor="company">
          公司名称
        </label>
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
          {contactPreferences?.map((pref) => (
            <label key={pref.value || ''} className={styles.radioLabel}>
              <input
                type="radio"
                name="contactPreference"
                value={pref.value || ''}
                defaultChecked={pref.value === 'wechat'}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>{pref.label || ''}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formItem}>
        <label className={styles.formLabel} htmlFor="message">
          留言 *
        </label>
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
          disabled={isSubmitting}
        >
          <span style={{ marginRight: '0.5rem' }}><SendIcon /></span>
          {isSubmitting ? '提交中...' : '提交留言'}
        </button>
      </div>
    </form>
  )
}
