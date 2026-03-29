'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './CustomerServiceModal.module.css'

interface CustomerServiceModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function CustomerServiceModal({ 
  isOpen, 
  onClose, 
  title = '联系客服' 
}: CustomerServiceModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className={styles.serviceInfo}>
              <h3 className={styles.serviceTitle}>电话客服</h3>
              <p className={styles.serviceText}>400-123-4567</p>
              <p className={styles.serviceDesc}>工作日 9:00-18:00</p>
            </div>
          </div>
          
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div className={styles.serviceInfo}>
              <h3 className={styles.serviceTitle}>邮件咨询</h3>
              <p className={styles.serviceText}>support@example.com</p>
              <p className={styles.serviceDesc}>24小时内回复</p>
            </div>
          </div>
          
          <div className={styles.serviceItem}>
            <div className={styles.serviceIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className={styles.serviceInfo}>
              <h3 className={styles.serviceTitle}>在线客服</h3>
              <p className={styles.serviceText}>点击立即咨询</p>
              <p className={styles.serviceDesc}>工作日 9:00-22:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
