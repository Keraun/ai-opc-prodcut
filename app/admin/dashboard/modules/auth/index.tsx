import { useState } from 'react'
import { toast } from 'sonner'
import { changePassword } from '@/lib/api-client'
import { useAuth } from '../../common/hooks/useAuth'
import styles from './auth.module.css'

interface ChangePasswordModalProps {
  visible: boolean
  onClose: () => void
  mustChange?: boolean
}

export function ChangePasswordModal({ visible, onClose, mustChange = false }: ChangePasswordModalProps) {
  const { updateCurrentUser } = useAuth()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("请填写所有字段")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致")
      return
    }

    if (newPassword.length < 8) {
      toast.error("新密码长度至少为8位")
      return
    }

    const currentUserStr = sessionStorage.getItem('currentUser')
    if (!currentUserStr) {
      toast.error("未找到用户信息,请重新登录")
      return
    }

    const currentUser = JSON.parse(currentUserStr)

    setLoading(true)

    try {
      const result = await changePassword({
        username: currentUser.username,
        oldPassword,
        newPassword
      })

      if (result.success) {
        toast.success("密码修改成功")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")

        if (result.user) {
          updateCurrentUser(result.user)
        }

        if (!mustChange) {
          onClose()
        }
      } else {
        toast.error(result.message || "密码修改失败")
      }
    } catch (error) {
      toast.error("密码修改失败,请重试")
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {mustChange ? '首次登录需修改密码' : '修改密码'}
          </h3>
          {!mustChange && (
            <button onClick={onClose} className={styles.closeButton}>×</button>
          )}
        </div>
        <div className={styles.modalBody}>
          {mustChange && (
            <div className={styles.warningBanner}>
              <svg className={styles.warningIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className={styles.warningText}>为了账户安全,首次登录必须修改密码</span>
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>旧密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={styles.formInput}
              placeholder="请输入旧密码"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.formInput}
              placeholder="请输入新密码（至少8位）"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.formInput}
              placeholder="请再次输入新密码"
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? '提交中...' : '确认修改'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PasswordBanner({ onChangePassword }: { onChangePassword: () => void }) {
  return (
    <div className={styles.passwordBanner}>
      <div className={styles.passwordBannerInner}>
        <div className={styles.passwordBannerContent}>
          <div className={styles.passwordBannerIcon}>
            <svg className={styles.passwordBannerIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className={styles.passwordBannerText}>
            <div className={styles.passwordBannerTitle}>安全提醒</div>
            <div className={styles.passwordBannerMessage}>
              为了账户安全,您需要立即修改密码
            </div>
          </div>
        </div>
        <div className={styles.passwordBannerButton}>
          <button onClick={onChangePassword} className={styles.changePasswordButton}>
            立即修改
          </button>
        </div>
      </div>
    </div>
  )
}
