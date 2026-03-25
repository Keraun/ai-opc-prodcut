"use client"

import { Button } from "@arco-design/web-react"
import { IconLock } from "@arco-design/web-react/icon"
import styles from "../dashboard.module.css"

interface AccountInfoProps {
  currentUser: any
  onChangePassword: () => void
}

export function AccountInfo({ currentUser, onChangePassword }: AccountInfoProps) {
  return (
    <div className={styles.accountInfoGrid}>
      <div className={styles.accountInfoCard}>
        <div className={styles.accountInfoCardHeader}>
          <div className={styles.accountInfoIcon}>
            <svg className={styles.accountInfoIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className={styles.accountInfoLabel}>用户名</p>
            <p className={styles.accountInfoValue}>{currentUser?.username || '管理员'}</p>
          </div>
        </div>
        <p className={styles.accountInfoDescription}>当前登录的管理员账户</p>
      </div>

      <div className={`${styles.accountInfoCard} ${styles.accountInfoCardGreen}`}>
        <div className={styles.accountInfoCardHeader}>
          <div className={`${styles.accountInfoIcon} ${styles.accountInfoIconGreen}`}>
            <svg className={styles.accountInfoIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className={styles.accountInfoLabel}>账户状态</p>
            <p className={styles.accountInfoValue}>正常</p>
          </div>
        </div>
        <p className={styles.accountInfoDescription}>账户运行正常,无异常</p>
      </div>

      <div className={`${styles.accountInfoCard} ${styles.accountInfoCardPurple}`}>
        <div className={styles.accountInfoCardHeader}>
          <div className={`${styles.accountInfoIcon} ${styles.accountInfoIconPurple}`}>
            <svg className={styles.accountInfoIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className={styles.accountInfoLabel}>安全设置</p>
            <p className={styles.accountInfoValue}>已设置密码</p>
          </div>
        </div>
        <Button
          type="text"
          size="small"
          icon={<IconLock />}
          onClick={onChangePassword}
        >
          修改密码
        </Button>
      </div>
    </div>
  )
}
