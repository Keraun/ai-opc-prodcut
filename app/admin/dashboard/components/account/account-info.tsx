"use client"

import { useState } from "react"
import { Button, Modal, Input, Alert } from "@arco-design/web-react"
import { IconLock, IconEye, IconEyeInvisible } from "@arco-design/web-react/icon"
import { toast } from "sonner"
import styles from "../../dashboard.module.css"

interface AccountInfoProps {
  currentUser: any
  onChangePassword: () => void
}

export function AccountInfo({ currentUser, onChangePassword }: AccountInfoProps) {
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false)
  const [password, setPassword] = useState("")
  const [superAdminToken, setSuperAdminToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const handleViewSuperAdminToken = async () => {
    setError("")
    setLoading(true)
    try {
      const response = await fetch("/api/admin/super-admin-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      if (response.ok) {
        setSuperAdminToken(data.token)
        setError("")
      } else {
        setError(data.message || "密码错误")
      }
    } catch (error) {
      setError("获取超级管理员口令失败")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    setShowSuperAdminModal(true)
    setPassword("")
    setSuperAdminToken("")
    setError("")
  }

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
        <div className={styles.accountInfoButtons}>
          <Button
            type="text"
            size="small"
            icon={<IconLock />}
            onClick={onChangePassword}
          >
            修改密码
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconLock />}
            onClick={handleOpenModal}
          >
            查看超级管理员口令
          </Button>
        </div>
      </div>

      <Modal
        title="查看超级管理员口令"
        visible={showSuperAdminModal}
        onCancel={() => setShowSuperAdminModal(false)}
        onOk={handleViewSuperAdminToken}
        okText="验证密码"
        cancelText="取消"
        okButtonProps={{ loading }}
      >
        <div style={{ marginBottom: 20 }}>
          <p>请输入当前登录密码以查看超级管理员口令</p>
        </div>
        {error && (
          <Alert
            type="error"
            content={error}
            style={{ marginBottom: 20 }}
            closable
            onClose={() => setError("")}
          />
        )}
        <Input.Password
          placeholder="输入当前密码"
          value={password}
          onChange={setPassword}
          style={{ width: '100%' }}
        />
        {superAdminToken && (
          <div style={{ marginTop: 20 }}>
            <p style={{ marginBottom: 8 }}>超级管理员口令:</p>
            <Input
              value={superAdminToken}
              disabled
              addAfter={
                <>
                  <Button
                    icon={showToken ? <IconEyeInvisible /> : <IconEye />}
                    onClick={() => setShowToken(!showToken)}
                  />
                  <Button
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(superAdminToken);
                        toast.success('口令已复制到剪贴板');
                      } catch (err) {
                        toast.error('复制失败，请手动复制');
                      }
                    }}
                  />
                </>
              }
              type={showToken ? 'text' : 'password'}
              style={{ width: '100%' }}
            />
            <p style={{ marginTop: 8, fontSize: 12, color: '#999' }}>请妥善保存此口令，仅在特殊情况下使用</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
