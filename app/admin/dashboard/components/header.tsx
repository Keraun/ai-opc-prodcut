"use client"

import { Button, Dropdown } from "@arco-design/web-react"
import { IconUser, IconSettings, IconExport, IconCustomerService } from "@arco-design/web-react/icon"
import styles from "../dashboard.module.css"

interface HeaderProps {
  currentUser: any
  onLogout: () => void
  onChangePassword: () => void
}

export function Header({ currentUser, onLogout, onChangePassword }: HeaderProps) {
  return (
    <header className={styles.headerBar}>
      <div className={styles.headerBarInner}>
        <div className={styles.headerBarContent}>
          <div className={styles.headerLogo}>
            <div className={styles.headerLogoIcon}>
              <svg className={styles.headerLogoIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className={styles.headerLogoText}>
              <span className={styles.headerLogoTitle}>AI OPC</span>
              <span className={styles.headerLogoSeparator}>|</span>
              <span className={styles.headerLogoSubtitle}>管理后台</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <Dropdown
              droplist={
                <div className={styles.qrDropdown}>
                  <div className={styles.qrContainer}>
                    <div className={styles.qrInner}>
                      <div className={styles.qrPlaceholder}>
                        <span className={styles.qrPlaceholderText}>客服二维码</span>
                      </div>
                    </div>
                  </div>
                  <p className={styles.qrHint}>联系客服获取帮助</p>
                </div>
              }
              position="br"
            >
              <Button type="text" icon={<IconCustomerService />}>
                联系客服
              </Button>
            </Dropdown>

            <Dropdown
              droplist={
                <div className={styles.userDropdown}>
                  <Button type="text" onClick={onChangePassword} className={styles.userDropdownButton}>
                    <IconSettings style={{ marginRight: 8 }} />
                    修改密码
                  </Button>
                  <Button type="text" onClick={onLogout} className={styles.userDropdownButton}>
                    <IconExport style={{ marginRight: 8 }} />
                    退出登录
                  </Button>
                </div>
              }
              position="br"
            >
              <Button type="text" icon={<IconUser />}>
                {currentUser?.username || '管理员'}
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  )
}
