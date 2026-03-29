import { useEffect, useRef } from 'react'
import styles from './QrcodeModal.module.css'

interface QrcodeModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function QrcodeModal({ isOpen, onClose, title = '联系客服' }: QrcodeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.qrcodeWrapper}>
            <div className={styles.qrcodePlaceholder}>
              <svg className={styles.qrcodeIcon} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="5" width="30" height="30" rx="2" />
                <rect x="65" y="5" width="30" height="30" rx="2" />
                <rect x="5" y="65" width="30" height="30" rx="2" />
                <rect x="12" y="12" width="16" height="16" rx="1" />
                <rect x="72" y="12" width="16" height="16" rx="1" />
                <rect x="12" y="72" width="16" height="16" rx="1" />
                <rect x="50" y="40" width="10" height="10" />
                <rect x="60" y="40" width="10" height="10" />
                <rect x="50" y="50" width="10" height="10" />
                <rect x="60" y="50" width="10" height="10" />
                <rect x="40" y="60" width="10" height="10" />
                <rect x="50" y="70" width="10" height="10" />
                <rect x="70" y="60" width="10" height="10" />
                <rect x="70" y="70" width="10" height="10" />
              </svg>
            </div>
          </div>
          <p className={styles.hint}>扫码添加客服微信</p>
        </div>
      </div>
    </div>
  )
}
